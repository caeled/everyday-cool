#!/usr/bin/env python3
"""
Baton Box self-test — standard library only.

Copies the box into a throwaway folder, registers a dummy second game
("test-echo") by manifest alone, starts the server on a test port, and
drives the whole player loop over real HTTP:

  create → join/load → hand back (turn advances) → second player loads
  → stale hand-back is refused → forced hand-back works → restart the
  server → the game is still there.

Run:  python3 selftest.py        (exit code 0 = all passed)
"""

import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.request
import urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
PORT = 8799
BASE = "http://127.0.0.1:%d" % PORT

results = []


def check(name, ok, detail=""):
    results.append((name, bool(ok), detail))
    print("%s %s%s" % ("PASS" if ok else "FAIL", name,
                       (" — " + detail) if detail else ""))


def req(method, path, body=None):
    data = None
    headers = {}
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        headers["content-type"] = "application/json"
    r = urllib.request.Request(BASE + path, data=data, headers=headers,
                               method=method)
    try:
        with urllib.request.urlopen(r, timeout=5) as resp:
            return resp.status, resp.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()


def req_json(method, path, body=None):
    status, raw = req(method, path, body)
    try:
        return status, json.loads(raw.decode("utf-8"))
    except ValueError:
        return status, {}


def wait_up(proc, seconds=15):
    deadline = time.time() + seconds
    while time.time() < deadline:
        if proc.poll() is not None:
            return False
        try:
            status, _ = req("GET", "/api/games")
            if status == 200:
                return True
        except Exception:
            pass
        time.sleep(0.25)
    return False


def start_server(cwd):
    env = dict(os.environ, BATON_BOX_PORT=str(PORT))
    return subprocess.Popen(
        [sys.executable, os.path.join(cwd, "baton_box.py")],
        cwd=cwd, env=env,
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def main():
    sandbox = tempfile.mkdtemp(prefix="baton-box-test-")
    proc = None
    try:
        # --- build the sandbox: the box + its games, plus a dummy game
        # registered by manifest ONLY (no code changes anywhere). ---
        shutil.copy(os.path.join(HERE, "baton_box.py"), sandbox)
        shutil.copytree(os.path.join(HERE, "games"),
                        os.path.join(sandbox, "games"))
        echo_dir = os.path.join(sandbox, "games", "test-echo")
        os.makedirs(echo_dir)
        with open(os.path.join(echo_dir, "manifest.json"), "w") as f:
            json.dump({"id": "test-echo", "title": "Test Echo",
                       "page": "echo.html", "blurb": "A dummy game.",
                       "stateName": "echo blob",
                       "turnEnds": "paste-code", "players": "2"}, f)
        with open(os.path.join(echo_dir, "echo.html"), "w") as f:
            f.write("<!DOCTYPE html><title>Test Echo</title>"
                    "<p>echo game page</p>")

        proc = start_server(sandbox)
        check("server starts on test port", wait_up(proc))

        # --- the shelf: both games, one of them manifest-only ---
        status, games = req_json("GET", "/api/games")
        ids = [g["id"] for g in games.get("games", [])]
        check("shelf lists the-relay", "the-relay" in ids, str(ids))
        check("dummy game registered by manifest only",
              "test-echo" in ids, str(ids))

        # --- pages serve ---
        status, home = req("GET", "/")
        check("home page serves", status == 200 and
              b"Baton Box" in home)
        status, help_body = req("GET", "/help")
        check("help page serves with join notes",
              status == 200 and b"same Wi-Fi" in help_body)
        status, relay_page = req("GET", "/games/the-relay.html")
        src = os.path.join(HERE, "games", "the-relay", "the-relay.html")
        with open(src, "rb") as f:
            src_bytes = f.read()
        check("served Relay page is byte-identical to the copy",
              status == 200 and
              hashlib.sha256(relay_page).hexdigest() ==
              hashlib.sha256(src_bytes).hexdigest())

        # --- create a session ---
        status, sess = req_json("POST", "/api/sessions", {
            "gameId": "the-relay", "title": "Test Relay",
            "players": ["Ana", "Bo"], "state": "BLOB-1"})
        code = sess.get("code", "")
        check("create session returns a 6-char code",
              status == 201 and len(code) == 6, code)
        check("first turn belongs to Ana",
              sess.get("turnIndex") == 0 and
              sess.get("currentPlayer") == "Ana")
        first_updated = sess.get("updatedAt")

        # --- player 1 loads, then hands back: turn advances ---
        status, loaded = req_json("GET", "/api/sessions/" + code)
        check("player loads current blob",
              status == 200 and loaded.get("state") == "BLOB-1")
        status, after = req_json(
            "POST", "/api/sessions/" + code + "/handback",
            {"state": "BLOB-2", "baseUpdatedAt": loaded["updatedAt"]})
        check("hand-back advances the turn",
              status == 200 and after.get("turnIndex") == 1 and
              after.get("currentPlayer") == "Bo")
        check("hand-back stores the new blob",
              after.get("state") == "BLOB-2")
        second_updated = after.get("updatedAt")

        # --- player 2 loads the advanced state ---
        status, loaded2 = req_json("GET", "/api/sessions/" + code)
        check("second player loads the advanced state",
              status == 200 and loaded2.get("state") == "BLOB-2" and
              loaded2.get("currentPlayer") == "Bo")

        # --- a stale hand-back (based on the FIRST load) is refused ---
        status, stale = req_json(
            "POST", "/api/sessions/" + code + "/handback",
            {"state": "BLOB-STALE", "baseUpdatedAt": first_updated})
        check("stale hand-back refused with 409",
              status == 409 and stale.get("error") == "stale")
        status, still = req_json("GET", "/api/sessions/" + code)
        check("refused hand-back changed nothing",
              still.get("state") == "BLOB-2" and
              still.get("turnIndex") == 1)

        # --- forced hand-back wins, turn wraps to player 1 ---
        status, forced = req_json(
            "POST", "/api/sessions/" + code + "/handback",
            {"state": "BLOB-3", "baseUpdatedAt": first_updated,
             "force": True})
        check("forced hand-back succeeds and wraps the turn",
              status == 200 and forced.get("turnIndex") == 0 and
              forced.get("state") == "BLOB-3")

        # --- the play page renders for humans ---
        status, play = req("GET", "/play/" + code)
        check("play page shows whose turn it is",
              status == 200 and b"Ana" in play and
              b"Hand it back" in play)

        # --- the dummy game runs a session too (generic box) ---
        status, echo_sess = req_json("POST", "/api/sessions", {
            "gameId": "test-echo", "title": "Echo test",
            "players": ["X", "Y"], "state": ""})
        check("session created for the dummy game",
              status == 201 and len(echo_sess.get("code", "")) == 6)

        # --- storage file exists, then restart: persistence ---
        check("sessions.json written beside the server",
              os.path.exists(os.path.join(sandbox, "sessions.json")))
        proc.terminate()
        proc.wait(timeout=5)
        proc = start_server(sandbox)
        check("server restarts", wait_up(proc))
        status, revived = req_json("GET", "/api/sessions/" + code)
        check("session survives a server restart",
              status == 200 and revived.get("state") == "BLOB-3" and
              revived.get("turnIndex") == 0)

    finally:
        if proc is not None and proc.poll() is None:
            proc.terminate()
            try:
                proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                proc.kill()
        shutil.rmtree(sandbox, ignore_errors=True)

    failed = [r for r in results if not r[1]]
    print("-" * 60)
    print("SELF-TEST: %d/%d passed" % (len(results) - len(failed),
                                       len(results)))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
