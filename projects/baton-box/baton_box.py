#!/usr/bin/env python3
"""
THE BATON BOX — a small relay server for pass-and-play games.

One person (the host) runs this file. It keeps game sessions on the host's
own network: whose turn it is, and the game's current "state blob" (an
opaque chunk of text the game itself produces — the box never reads inside
it). Players open the box in a browser, take their turn in the game, and
hand the new state blob back. Last one to hand back wins the turn order;
the box just passes the baton.

The box understands NO game. Any game that can pack its state into a blob
and say whose turn is next can ride it. See CONTRACT.md.

Zero dependencies: Python 3 standard library only.
Run it:  python baton_box.py            (or double-click start-baton-box.bat)
Stop it: close the window, or press Ctrl+C.
"""

import html
import json
import os
import re
import secrets
import socket
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

# --------------------------------------------------------------------------
# Configuration
# --------------------------------------------------------------------------

HERE = os.path.dirname(os.path.abspath(__file__))
GAMES_DIR = os.path.join(HERE, "games")
STORE_PATH = os.path.join(HERE, "sessions.json")
PORT = int(os.environ.get("BATON_BOX_PORT", "8765"))
HISTORY_KEEP = 10                 # how many handed-back blobs to remember
MAX_BODY = 5 * 1024 * 1024        # biggest state blob / request we accept
CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"   # no 0/O/1/I/L look-alikes
CODE_LEN = 6

# --------------------------------------------------------------------------
# Storage — sessions.json beside this script, written atomically
# --------------------------------------------------------------------------

_lock = threading.Lock()
_sessions = {}   # code -> session dict


def _save_locked():
    tmp = STORE_PATH + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump({"sessions": _sessions}, f, indent=2, ensure_ascii=False)
    os.replace(tmp, STORE_PATH)


def load_store():
    global _sessions
    if os.path.exists(STORE_PATH):
        try:
            with open(STORE_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            if isinstance(data, dict) and isinstance(data.get("sessions"), dict):
                _sessions = data["sessions"]
        except (ValueError, OSError):
            print("! sessions.json could not be read — starting with an empty box.")
            _sessions = {}


def new_code():
    while True:
        code = "".join(secrets.choice(CODE_ALPHABET) for _ in range(CODE_LEN))
        if code not in _sessions:
            return code


def public_session(s):
    """What the API and pages may show about a session."""
    players = s["players"]
    return {
        "code": s["code"],
        "gameId": s["gameId"],
        "title": s["title"],
        "players": players,
        "turnIndex": s["turnIndex"],
        "currentPlayer": players[s["turnIndex"]] if players else "",
        "state": s["state"],
        "hasState": bool(s["state"]),
        "updatedAt": s["updatedAt"],
        "updatedHuman": time.strftime("%a %b %d, %I:%M %p",
                                      time.localtime(s["updatedAt"])),
        "createdHuman": time.strftime("%a %b %d, %I:%M %p",
                                      time.localtime(s["createdAt"])),
        "history": [
            {"byPlayer": h["byPlayer"], "turnIndex": h["turnIndex"],
             "whenHuman": time.strftime("%b %d, %I:%M %p",
                                        time.localtime(h["at"]))}
            for h in s.get("history", [])
        ],
    }


# --------------------------------------------------------------------------
# Games — discovered from games/<folder>/manifest.json. No code changes
# are needed to add a game: drop in a folder, a page, and a manifest.
# --------------------------------------------------------------------------

def scan_games():
    games = []
    if os.path.isdir(GAMES_DIR):
        for name in sorted(os.listdir(GAMES_DIR)):
            folder = os.path.join(GAMES_DIR, name)
            manifest_path = os.path.join(folder, "manifest.json")
            if not (os.path.isdir(folder) and os.path.exists(manifest_path)):
                continue
            try:
                with open(manifest_path, "r", encoding="utf-8") as f:
                    m = json.load(f)
            except (ValueError, OSError):
                continue
            page = os.path.basename(str(m.get("page", "")))
            if not page or not os.path.exists(os.path.join(folder, page)):
                continue
            games.append({
                "id": str(m.get("id", name)),
                "title": str(m.get("title", name)),
                "page": page,
                "folder": folder,
                "dir": name,
                "blurb": str(m.get("blurb", "")),
                "stateName": str(m.get("stateName", "state code")),
                "turnEnds": str(m.get("turnEnds", "paste-code")),
                "players": str(m.get("players", "")),
            })
    return games


def find_game(game_id):
    for g in scan_games():
        if g["id"] == game_id:
            return g
    return None


def game_page_path(page_name):
    page_name = os.path.basename(page_name)
    for g in scan_games():
        if g["page"] == page_name:
            return os.path.join(g["folder"], page_name)
    return None


# Static assets inside a game folder — most games are a single page, but a
# game that is a small machine room of files (an emulator rack, say) needs
# its folder served too. Only files inside a discovered game's folder are
# reachable, and only under /games/<folder>/… — ".." cannot escape.
ASSET_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".md": "text/plain; charset=utf-8",
    ".data": "application/octet-stream",
    ".wasm": "application/wasm",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
}


def game_asset_path(rest):
    """Map 'folder/sub/path' (the part after /games/) to a real file inside
    that game's folder, or None."""
    parts = [p for p in rest.split("/") if p not in ("", ".")]
    if len(parts) < 2 or any(p == ".." for p in parts):
        return None
    for g in scan_games():
        if g["dir"] == parts[0]:
            folder = os.path.realpath(g["folder"])
            target = os.path.realpath(os.path.join(folder, *parts[1:]))
            if target.startswith(folder + os.sep) and os.path.isfile(target):
                return target
            return None
    return None


# --------------------------------------------------------------------------
# Network helpers — what address do we tell the players?
# --------------------------------------------------------------------------

def lan_addresses():
    ips = []
    # The "which way is out" trick: no packet is actually sent, the OS just
    # tells us which local address it would use.
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("10.255.255.255", 1))
        ips.append(s.getsockname()[0])
        s.close()
    except OSError:
        pass
    try:
        for info in socket.getaddrinfo(socket.gethostname(), None,
                                       socket.AF_INET):
            ip = info[4][0]
            if ip not in ips:
                ips.append(ip)
    except OSError:
        pass
    return [ip for ip in ips if not ip.startswith("127.")]

# --------------------------------------------------------------------------
# Pages — paper-and-ink, in the Relay's own warmth. All inline: the box
# serves everything itself, nothing is loaded from the internet.
# --------------------------------------------------------------------------

CSS = """
:root{--paper:#FFF6E8;--surface:#FFFCF3;--ink:#221A12;--muted:#6B5B4A;
--orange:#FF6B2B;--sun:#FFC53D;--teal:#0E9A8B;--berry:#E94E7A;--sky:#4AA8FF}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);
font-family:Verdana,Geneva,'Segoe UI',sans-serif;line-height:1.5}
.wrap{max-width:860px;margin:0 auto;padding:16px 14px 48px}
h1,h2,h3{line-height:1.15;margin:.2em 0 .4em}
h1{font-size:2rem} h2{font-size:1.35rem} h3{font-size:1.1rem}
.card{background:var(--surface);border:3px solid var(--ink);border-radius:18px;
box-shadow:5px 5px 0 var(--ink);padding:18px;margin:18px 0}
.card.sun{background:#FFF3D1}.card.teal{background:#DFF7F2}
.btn{display:inline-block;background:var(--orange);color:#fff;border:3px solid var(--ink);
border-radius:14px;box-shadow:3px 3px 0 var(--ink);padding:10px 18px;
font-weight:800;font-size:1rem;cursor:pointer;text-decoration:none}
.btn:active{transform:translate(2px,2px);box-shadow:1px 1px 0 var(--ink)}
.btn.teal{background:var(--teal)} .btn.white{background:#fff;color:var(--ink)}
.btn.small{padding:6px 12px;font-size:.9rem}
input[type=text],select,textarea{width:100%;border:3px solid var(--ink);
border-radius:12px;padding:10px;font:inherit;background:#fff;color:var(--ink)}
textarea{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.82rem}
label{font-weight:800;display:block;margin:14px 0 4px}
.small{font-size:.88rem;color:var(--muted)}
.bigaddr{font-size:1.5rem;font-weight:900;letter-spacing:.02em;word-break:break-all}
.codechip{display:inline-block;background:var(--ink);color:var(--sun);
font-family:ui-monospace,Menlo,Consolas,monospace;font-weight:900;
font-size:1.3rem;letter-spacing:.25em;padding:4px 12px 4px 16px;border-radius:10px}
.turnbanner{background:var(--sun);border:3px solid var(--ink);border-radius:16px;
box-shadow:4px 4px 0 var(--ink);padding:14px 18px;font-size:1.3rem;font-weight:900}
.warn{background:#FFE1EA;border:3px solid var(--berry);border-radius:14px;
padding:12px 14px;margin:12px 0}
.ok{background:#E4F6DC;border:3px solid var(--teal);border-radius:14px;
padding:12px 14px;margin:12px 0}
ol.steps li,ul.tight li{margin:.35em 0}
table.turns{border-collapse:collapse;width:100%}
table.turns td,table.turns th{border:2px solid var(--ink);padding:6px 9px;text-align:left}
.pill{display:inline-block;border:2px solid var(--ink);border-radius:999px;
padding:1px 10px;font-size:.8rem;font-weight:800;background:#fff}
.pill.now{background:var(--sun)}
footer{margin-top:34px;font-size:.85rem;color:var(--muted);text-align:center}
a{color:#0B5FA5}
"""

def page_head(title):
    return ("<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\">"
            "<meta name=\"viewport\" content=\"width=device-width, "
            "initial-scale=1\"><title>" + esc(title) +
            " · The Baton Box</title>"
            "<style>" + CSS + "</style></head><body><div class=\"wrap\">")
PAGE_TAIL = ("<footer>The Baton Box — a pass-and-play game box. "
             "It holds the baton; the players hold each other up.<br>"
             "<a href=\"/\">Home</a> · <a href=\"/help\">Help &amp; setup "
             "notes</a></footer></div></body></html>")


def esc(x):
    return html.escape(str(x), quote=True)


def home_page(addresses):
    games = scan_games()
    with _lock:
        sessions = [public_session(s) for s in _sessions.values()]
    sessions.sort(key=lambda s: -_sessions[s["code"]]["updatedAt"])

    addr_html = ""
    for ip in addresses:
        addr_html += ('<div class="bigaddr">http://' + esc(ip) + ':' +
                      str(PORT) + '</div>')
    if not addr_html:
        addr_html = ('<div class="bigaddr">http://127.0.0.1:' + str(PORT) +
                     '</div><p class="small">No network address found — '
                     'players on this same computer can still use the '
                     'address above.</p>')

    game_options = "".join(
        '<option value="' + esc(g["id"]) + '">' + esc(g["title"]) +
        '</option>' for g in games)
    shelf = ""
    for g in games:
        shelf += ('<div style="margin:12px 0"><strong>' + esc(g["title"]) +
                  '</strong> ' +
                  ('<span class="pill">' + esc(g["players"]) +
                   ' players</span>' if g["players"] else '') +
                  '<br><span class="small">' + esc(g["blurb"]) + '</span><br>'
                  '<a class="btn small white" href="/games/' + esc(g["dir"]) +
                  '/' + esc(g["page"]) +
                  '">Open the game page</a></div>')

    sess_html = ""
    if sessions:
        for s in sessions:
            g = find_game(s["gameId"])
            sess_html += (
                '<div style="margin:12px 0"><strong>' + esc(s["title"]) +
                '</strong> <span class="codechip" style="font-size:1rem">' +
                esc(s["code"]) + '</span><br><span class="small">' +
                esc(g["title"] if g else s["gameId"]) + ' · It is ' +
                esc(s["currentPlayer"]) + '&rsquo;s turn · last handed back ' +
                esc(s["updatedHuman"]) + '</span><br>'
                '<a class="btn small teal" href="/play/' + esc(s["code"]) +
                '">Open this game</a> '
                '<button class="btn small white" onclick="delSession(\'' +
                esc(s["code"]) + '\')">Remove</button></div>')
    else:
        sess_html = ('<p class="small">No games yet. Start the first one '
                     'above — it takes about a minute.</p>')

    return (page_head("Home")) + """
<header>
<h1>📦 The Baton Box</h1>
<p><strong>A pass-and-play game box.</strong> One person hosts. Everybody
else just opens a web page, takes a turn, and hands the baton back.
No accounts, no sign-ups, no internet needed — just the same Wi-Fi or
network as the host.</p>
</header>

<section class="card sun">
<h2>📣 Tell the players where to knock</h2>
<p>Players type this address into any browser — phone, tablet, laptop:</p>
""" + addr_html + """
<p>Then they type the <strong>game code</strong> shown on the game they
want to join. That is all they need.</p>
</section>

<section class="card">
<h2>🎲 Join a game</h2>
<label for="joinCode">Game code (6 letters/numbers, from the host or a friend)</label>
<input type="text" id="joinCode" maxlength="6" style="text-transform:uppercase"
 autocomplete="off" placeholder="e.g. K7P2QX">
<div style="margin-top:12px"><button class="btn" onclick="joinGame()">Join this game</button></div>
<p class="small" id="joinMsg"></p>
</section>

<section class="card">
<h2>✨ Start a new game</h2>
<label for="gameSel">Which game?</label>
<select id="gameSel">""" + game_options + """</select>
<label for="sessTitle">Name this game (so you can find it later)</label>
<input type="text" id="sessTitle" placeholder="e.g. Friday Kitchen Table Relay">
<label for="players">Player names — one per line, in turn order</label>
<textarea id="players" rows="4" style="font-family:inherit;font-size:1rem"
 placeholder="Ana&#10;Bo&#10;Cy"></textarea>
<label for="firstCode">First state code <span style="font-weight:400">(optional —
leave blank if the first player will start a brand-new game)</span></label>
<textarea id="firstCode" rows="3" placeholder="Paste a state code here if one player already started…"></textarea>
<p class="small">Not sure about codes? A game hands you a code when you
export or save mid-game. <a href="/help">The help page explains it all,
in plain words.</a></p>
<div style="margin-top:10px"><button class="btn" onclick="createGame()">Start this game</button></div>
<p class="small" id="createMsg"></p>
</section>

<section class="card">
<h2>📚 Games on the shelf</h2>
""" + shelf + """
</section>

<section class="card">
<h2>🏃 Games in progress</h2>
""" + sess_html + """
<p class="small">Removing a game here only clears it from this box.
The host's backup file (sessions.json, next to the box program) keeps
everything until it is removed.</p>
</section>

<script>
function joinGame(){
  var c=document.getElementById('joinCode').value.trim().toUpperCase();
  if(c.length!==6){document.getElementById('joinMsg').textContent=
    'A game code is 6 letters or numbers. Check it and try again.';return;}
  location.href='/play/'+encodeURIComponent(c);
}
async function createGame(){
  var names=document.getElementById('players').value.split('\\n')
    .map(function(s){return s.trim();}).filter(Boolean);
  var msg=document.getElementById('createMsg');
  if(names.length<2){msg.textContent='A relay needs at least 2 players. Add another name.';return;}
  var body={gameId:document.getElementById('gameSel').value,
    title:document.getElementById('sessTitle').value.trim(),
    players:names, state:document.getElementById('firstCode').value.trim()};
  msg.textContent='Starting…';
  try{
    var r=await fetch('/api/sessions',{method:'POST',
      headers:{'content-type':'application/json'},body:JSON.stringify(body)});
    var j=await r.json();
    if(!r.ok){msg.textContent=j.error||'Something went wrong.';return;}
    location.href='/play/'+j.code;
  }catch(e){msg.textContent='Could not reach the box. Is it still running?';}
}
async function delSession(code){
  if(!confirm('Remove this game from the box? Players will not be able to join it.'))return;
  await fetch('/api/sessions/'+code+'/delete',{method:'POST'});
  location.reload();
}
</script>
""" + PAGE_TAIL


def play_page(code):
    with _lock:
        raw = _sessions.get(code)
        s = public_session(raw) if raw else None
    if s is None:
        return None
    g = find_game(s["gameId"])
    gtitle = g["title"] if g else s["gameId"]
    state_name = g["stateName"] if g else "state code"
    game_link = ('/games/' + esc(g["dir"]) + '/' + esc(g["page"])) if g else '/'

    pills = ""
    for i, p in enumerate(s["players"]):
        pills += ('<span class="pill' + (' now' if i == s["turnIndex"]
                  else '') + '">' + esc(p) +
                  (' — playing now' if i == s["turnIndex"] else '') +
                  '</span> ')
    hist = ""
    if s["history"]:
        rows = "".join(
            '<tr><td>' + esc(h["byPlayer"]) + '</td><td>' +
            esc(h["whenHuman"]) + '</td></tr>' for h in s["history"])
        hist = ('<h3>What happened so far</h3><table class="turns">'
                '<tr><th>Handed back by</th><th>When</th></tr>' + rows +
                '</table>')
    else:
        hist = ('<p class="small">Nobody has handed back a turn yet. '
                'History will grow here as you play.</p>')

    if s["hasState"]:
        take_html = """
<ol class="steps">
<li><strong>Copy the code</strong> in the box below (the button does it).</li>
<li><strong>Open the game</strong> with the big button — it opens here in the box.</li>
<li>In the game, tap <strong>Import</strong> (on the start screen it says
“Import a Code”), paste the code, and tap <strong>Continue</strong>.</li>
<li>Play your turn. Take your time — nobody is waiting on a clock.</li>
<li>In the game, tap <strong>Export Code</strong>, copy the new code,
come back to this page, and hand it back below.</li>
</ol>
<label for="curState">The current """ + esc(state_name) + """ — copy this one</label>
<textarea id="curState" rows="4" readonly>""" + esc(s["state"]) + """</textarea>
<div style="margin-top:10px">
<button class="btn teal" onclick="copyState()">📋 Copy the code</button>
<a class="btn" href=\"""" + game_link + """\" target="_blank" rel="noopener">▶ Open """ + esc(gtitle) + """</a>
</div>"""
    else:
        take_html = """
<p>No code yet — <strong>""" + esc(s["currentPlayer"]) + """</strong>
starts this one fresh:</p>
<ol class="steps">
<li>Open the game with the big button below.</li>
<li>Set up the players and start a brand-new game, exactly as the game describes.</li>
<li>Play the first turn.</li>
<li>In the game, tap <strong>Export Code</strong>, copy the code,
come back to this page, and hand it back below. From then on, the baton
travels by code.</li>
</ol>
<div style="margin-top:10px">
<a class="btn" href=\"""" + game_link + """\" target="_blank" rel="noopener">▶ Open """ + esc(gtitle) + """</a>
</div>"""

    return (page_head(s["title"])) + """
<p><a href="/">← All games</a></p>
<h1>""" + esc(s["title"]) + """</h1>
<p class="small">""" + esc(gtitle) + """ · Game code
<span class="codechip" style="font-size:1rem">""" + esc(s["code"]) + """</span>
· started """ + esc(s["createdHuman"]) + """</p>
<div class="turnbanner">🏃 It is """ + esc(s["currentPlayer"]) + """&rsquo;s turn</div>
<p style="margin-top:12px">""" + pills + """</p>

<section class="card">
<h2>🎯 Take your turn</h2>
<p class="small">The Baton Box runs on trust: it will show the code to
anyone with the game code. If it is not your turn, the kind move is to
wait — your turn is coming.</p>
""" + take_html + """
</section>

<section class="card">
<h2>🤲 Hand it back</h2>
<p>Finished your turn in the game? Paste the <strong>new</strong>
""" + esc(state_name) + """ the game gave you, and the baton passes to
<strong>""" + esc(s["players"][(s["turnIndex"] + 1) % len(s["players"])]) + """</strong>.</p>
<label for="newState">Your new """ + esc(state_name) + """</label>
<textarea id="newState" rows="4" placeholder="Paste the new code from the game here…"></textarea>
<div style="margin-top:10px">
<button class="btn" onclick="handBack(false)">Hand it back →</button>
</div>
<div id="hbMsg"></div>
</section>

<section class="card">
""" + hist + """
<p class="small" style="margin-top:10px">Stuck? <a href="/help">The help
page</a> walks through every step, including what to do when a code
will not paste or two people played at once.</p>
</section>

<script>
var BASE_UPDATED = """ + json.dumps(s["updatedAt"]) + """;
async function copyState(){
  var t=document.getElementById('curState');
  t.select(); t.setSelectionRange(0, 999999);
  try{ await navigator.clipboard.writeText(t.value); }
  catch(e){ document.execCommand('copy'); }
}
async function handBack(force){
  var v=document.getElementById('newState').value.trim();
  var msg=document.getElementById('hbMsg');
  if(!v){msg.innerHTML='<div class="warn">Paste the new code first — ' +
    'the game gives it to you when you tap Export Code.</div>';return;}
  try{
    var r=await fetch('/api/sessions/""" + esc(s["code"]) + """/handback',
      {method:'POST',headers:{'content-type':'application/json'},
       body:JSON.stringify({state:v, baseUpdatedAt:BASE_UPDATED, force:!!force})});
    var j=await r.json();
    if(r.status===409){
      msg.innerHTML='<div class="warn"><strong>Wait — this game moved '
        + 'while you were playing.</strong><br>Someone handed back a newer '
        + 'turn after you copied your code. If you hand back now, their '
        + 'turn is replaced by yours.<br><br>'
        + '<button class="btn" onclick="handBack(true)">Hand back anyway '
        + '(replace their turn)</button> '
        + '<button class="btn white" onclick="location.reload()">Reload '
        + 'and see the newest turn</button></div>';
      return;
    }
    if(!r.ok){msg.innerHTML='<div class="warn">'+(j.error||'Something went wrong.')+'</div>';return;}
    msg.innerHTML='<div class="ok"><strong>Handed back!</strong> It is now '
      + j.currentPlayer + '&rsquo;s turn.</div>';
    setTimeout(function(){location.reload();}, 1200);
  }catch(e){
    msg.innerHTML='<div class="warn">Could not reach the box. Is it still running?</div>';
  }
}
</script>
""" + PAGE_TAIL


HELP_HTML = (page_head("Help")) + """
<h1>🛟 Help — the Baton Box in plain words</h1>
<p>The Baton Box lets people play a turn-based game <strong>together but
not at the same time</strong>. One person runs the box (the
<strong>host</strong>). Everyone takes turns in a game, and the box
remembers whose turn it is and keeps the game's place, using a
<strong>code</strong> the game itself makes.</p>

<section class="card sun">
<h2>For the host — setting up (about 5 minutes, once)</h2>
<ol class="steps">
<li><strong>You need Python 3</strong> on the host computer (a Windows,
Mac, or Linux machine that can stay on while you play).
On Windows, if Python is missing, get it free from
<strong>python.org → Downloads</strong>, and during install tick the box
<strong>“Add Python to PATH.”</strong> Macs and Linux usually have it
already, or install it the same way.</li>
<li><strong>Put the baton-box folder somewhere simple</strong> — the
Desktop is fine — and keep its files together.</li>
<li><strong>Start the box:</strong> on Windows, double-click
<strong>start-baton-box.bat</strong>. Anywhere else, open a terminal in
the folder and type <strong>python baton_box.py</strong>
(on some systems: <strong>python3 baton_box.py</strong>).</li>
<li>A window opens with friendly writing and some addresses. <strong>Leave
that window open</strong> — that window <em>is</em> the box. Closing it
(or pressing Ctrl+C) puts the box away; your games are saved in the
folder and come back next time you start it.</li>
<li>The box's home page shows the <strong>address</strong> to give
players (it looks like http://192.168.1.20:8765 — your numbers will
differ). Players must be on the <strong>same Wi-Fi or network</strong>
as the host computer.</li>
<li>Start a game from the home page, then tell the players the address
<strong>and</strong> the 6-letter game code. That is the whole setup.</li>
</ol>
<p class="small">School and office networks sometimes block computers
from seeing each other. If players cannot open the address, a home
network or a phone hotspot for the host usually fixes it.</p>
</section>

<section class="card">
<h2>For players — joining and playing</h2>
<ol class="steps">
<li>Connect to the <strong>same Wi-Fi</strong> as the host.</li>
<li>Open the <strong>address</strong> the host gave you in any browser.</li>
<li>Type the <strong>game code</strong> and tap <strong>Join</strong>.</li>
<li>The page tells you <strong>whose turn it is</strong>. If it is yours:
copy the code, open the game, paste it into the game's
<strong>Import</strong>, and play your turn.</li>
<li>When your turn is done, use the game's <strong>Export Code</strong>,
come back to the game's page in the box, paste the new code, and tap
<strong>Hand it back</strong>. The next player's name lights up. Done —
go live your life; the box will keep your place.</li>
</ol>
</section>

<section class="card">
<h2>When something looks wrong</h2>
<ul class="tight">
<li><strong>The page will not load.</strong> Check you are on the same
Wi-Fi as the host, and that the host's box window is still open. Ask the
host to read the address off the box's home page once more — one wrong
digit is the usual culprit.</li>
<li><strong>“This game moved while you were playing.”</strong> Two
people played from the same starting code. Talk it over like players,
not like computers: whoever hands back second can choose to replace the
first turn, or reload and replay from the newest one. No harm done —
the box keeps the last few codes, and the host can see them.</li>
<li><strong>A code will not paste into the game.</strong> Make sure you
copied the whole code (they are long — that is normal) and that you are
pasting the <em>newest</em> one from the game's page in the box.</li>
<li><strong>The host computer restarted.</strong> Start the box again.
Games are saved in <strong>sessions.json</strong> in the baton-box
folder after every hand-back. That file is your backup — the host can
copy it somewhere safe now and then.</li>
<li><strong>Forgot the game code?</strong> It is on the game's page in
the box, and the host sees every game on the home page.</li>
</ul>
</section>

<section class="card teal">
<h2>The honest limits</h2>
<ul class="tight">
<li>The box works on <strong>your own network</strong>. It is not on the
internet unless the host deliberately puts it there.</li>
<li>The <strong>host computer must be on</strong> and the box window
open while anyone is playing or handing back. Turns can wait as long as
they like in between — days is fine.</li>
<li>There are <strong>no passwords</strong>. Anyone on your network with
a game code can see that game's code and take a turn. It is an
honor-system game box for people you like — <strong>not a bank
vault</strong>. Never put secrets, passwords, or private information
inside a game's state.</li>
<li>The box does not know the rules of any game. If a code is nonsense,
the game will say so when someone imports it; the box just carries
codes faithfully, like a good baton.</li>
</ul>
</section>
""" + PAGE_TAIL


# --------------------------------------------------------------------------
# HTTP handler
# --------------------------------------------------------------------------

class Handler(BaseHTTPRequestHandler):
    server_version = "BatonBox/1.0"

    # -- plumbing ------------------------------------------------------
    def log_message(self, fmt, *args):
        sys.stderr.write("· %s %s\n" % (self.command, self.path))

    def _send(self, status, body, content_type="text/html; charset=utf-8",
              isolate=False):
        if isinstance(body, str):
            body = body.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        if isolate:
            # Cross-origin isolation for the game routes: some passengers
            # (the DOS Console's DOSBox Pure core) are threaded builds that
            # hard-require it — they need SharedArrayBuffer, which a browser
            # only hands out to an isolated page. The box is served from
            # localhost / the home network, a secure context, so a game page
            # served from here can genuinely be isolated; a static host that
            # cannot set these headers (GitHub Pages) cannot run such a core
            # at all. Scoped to /games/… so the session API and the box's own
            # pages are untouched.
            self.send_header("Cross-Origin-Opener-Policy", "same-origin")
            self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
            self.send_header("Cross-Origin-Resource-Policy", "same-origin")
        self.end_headers()
        self.wfile.write(body)

    def _json(self, status, obj):
        self._send(status, json.dumps(obj), "application/json; charset=utf-8")

    def _read_json(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0
        if length <= 0 or length > MAX_BODY:
            return None
        raw = self.rfile.read(length)
        try:
            data = json.loads(raw.decode("utf-8"))
            return data if isinstance(data, dict) else None
        except (ValueError, UnicodeDecodeError):
            return None

    # -- GET ------------------------------------------------------------
    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/" or path == "/index.html":
            self._send(200, home_page(lan_addresses()))
            return
        if path == "/help":
            self._send(200, HELP_HTML)
            return
        if path.startswith("/play/"):
            code = path[len("/play/"):].strip("/").upper()
            page = play_page(code)
            if page is None:
                self._send(404, (page_head("Not found")) +
                           "<h1>🤔 No game with that code</h1><p>Check the "
                           "code and try again — or ask the host to read it "
                           "off the box's home page.</p>" + PAGE_TAIL)
            else:
                self._send(200, page)
            return
        if path.startswith("/games/"):
            rest = path[len("/games/"):]
            if "/" in rest:
                asset = game_asset_path(rest)
                if asset:
                    ext = os.path.splitext(asset)[1].lower()
                    with open(asset, "rb") as f:
                        self._send(200, f.read(),
                                   ASSET_TYPES.get(
                                       ext, "application/octet-stream"),
                                   isolate=True)
                else:
                    self._send(404, "No such game file.")
                return
            page_path = game_page_path(rest)
            if page_path and os.path.exists(page_path):
                with open(page_path, "rb") as f:
                    self._send(200, f.read(), isolate=True)
            else:
                self._send(404, "No such game page.")
            return
        if path == "/api/games":
            self._json(200, {"games": [
                {"id": g["id"], "title": g["title"], "page": g["page"],
                 "blurb": g["blurb"], "stateName": g["stateName"],
                 "turnEnds": g["turnEnds"], "players": g["players"]}
                for g in scan_games()]})
            return
        if path == "/api/sessions":
            with _lock:
                out = [public_session(s) for s in _sessions.values()]
            self._json(200, {"sessions": out})
            return
        if path.startswith("/api/sessions/"):
            code = path[len("/api/sessions/"):].strip("/").upper()
            with _lock:
                s = _sessions.get(code)
                out = public_session(s) if s else None
            if out is None:
                self._json(404, {"error": "No session with that code."})
            else:
                self._json(200, out)
            return
        self._send(404, (page_head("Not found")) +
                   "<h1>🤔 Nothing here</h1><p>Try the "
                   "<a href=\"/\">home page</a>.</p>" + PAGE_TAIL)

    # -- POST -----------------------------------------------------------
    def do_POST(self):
        path = urlparse(self.path).path
        if path == "/api/sessions":
            data = self._read_json()
            if data is None:
                self._json(400, {"error": "That request could not be read."})
                return
            game = find_game(str(data.get("gameId", "")))
            if game is None:
                self._json(400, {"error": "Pick a game from the shelf first."})
                return
            players = [str(p).strip() for p in data.get("players", [])
                       if str(p).strip()]
            if len(players) < 2:
                self._json(400, {"error":
                                 "A relay needs at least 2 players."})
                return
            if len(players) > 12:
                self._json(400, {"error":
                                 "Up to 12 players in one game, please."})
                return
            title = str(data.get("title", "")).strip() or \
                (game["title"] + " game")
            state = str(data.get("state", "")).strip()
            now = time.time()
            with _lock:
                code = new_code()
                _sessions[code] = {
                    "code": code, "gameId": game["id"], "title": title,
                    "players": players, "turnIndex": 0, "state": state,
                    "createdAt": now, "updatedAt": now, "history": [],
                }
                _save_locked()
                out = public_session(_sessions[code])
            self._json(201, out)
            return

        if path.startswith("/api/sessions/") and path.endswith("/handback"):
            code = path[len("/api/sessions/"):-len("/handback")] \
                .strip("/").upper()
            data = self._read_json()
            if data is None:
                self._json(400, {"error": "That request could not be read."})
                return
            new_state = str(data.get("state", "")).strip()
            if not new_state:
                self._json(400, {"error":
                                 "Paste the new code from the game first."})
                return
            with _lock:
                s = _sessions.get(code)
                if s is None:
                    self._json(404, {"error": "No session with that code."})
                    return
                base = data.get("baseUpdatedAt")
                stale = (base is not None and
                         float(base) != float(s["updatedAt"]))
                if stale and not data.get("force"):
                    self._json(409, {
                        "error": "stale",
                        "message": "This session was updated after you "
                                   "loaded it.",
                        "currentUpdatedAt": s["updatedAt"],
                        "currentPlayer":
                            s["players"][s["turnIndex"]]})
                    return
                s.setdefault("history", []).insert(0, {
                    "state": s["state"], "at": s["updatedAt"],
                    "byPlayer": s["players"][s["turnIndex"]],
                    "turnIndex": s["turnIndex"],
                })
                s["history"] = s["history"][:HISTORY_KEEP]
                s["state"] = new_state
                s["turnIndex"] = (s["turnIndex"] + 1) % len(s["players"])
                s["updatedAt"] = time.time()
                _save_locked()
                out = public_session(s)
            self._json(200, out)
            return

        if path.startswith("/api/sessions/") and path.endswith("/delete"):
            code = path[len("/api/sessions/"):-len("/delete")] \
                .strip("/").upper()
            with _lock:
                existed = _sessions.pop(code, None) is not None
                if existed:
                    _save_locked()
            self._json(200 if existed else 404,
                       {"deleted": existed})
            return

        self._json(404, {"error": "Nothing there."})


# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------

def main():
    load_store()
    games = scan_games()
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    ips = lan_addresses()
    print("=" * 62)
    print("  📦  THE BATON BOX is open!")
    print("=" * 62)
    print("  Players on THIS computer:   http://127.0.0.1:%d" % PORT)
    for ip in ips:
        print("  Players on your network:    http://%s:%d" % (ip, PORT))
    if not ips:
        print("  (No network address found — same-computer play only.)")
    print()
    print("  Give players the network address and a game code.")
    print("  Games on the shelf: %s" %
          (", ".join(g["title"] for g in games) or "(none yet)"))
    print("  Games in progress: %d" % len(_sessions))
    print("  Saved in: %s" % STORE_PATH)
    print()
    print("  Leave this window open while you play.")
    print("  To close the box: close this window, or press Ctrl+C.")
    print("=" * 62)
    sys.stdout.flush()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nThe Baton Box is closed. Games are saved. 🏃")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
