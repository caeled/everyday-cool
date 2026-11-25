#!/usr/bin/env python3
"""
mame-romset-diagnostic.py — read your MAME archive's vintage, read-only.

Written for The MAME Console in Nerd Heaven (Everyday Cool). The console's
core is MAME 2003-Plus, built on the MAME 0.78 codebase — and a MAME core
only plays the romsets built for its own version. Before blaming a machine
for refusing a set, it helps to know which vintage your archive is. This
script answers that from the outside of the zips: folder names, counts,
and the file *names and sizes* inside three fingerprint sets. It never
extracts anything, never writes anything, and never copies anything.

    python3 mame-romset-diagnostic.py "Z:\\Library\\Roms\\Archives"

(or pass any folder; with no argument it looks for that default path,
then falls back to the current folder.)

What it reports:
  1. The top-level folder names — they often confess the vintage outright
     ("MAME 0.78", "MAME 2003 Reference Set", "FBNeo", ...).
  2. The romset census: how many .zip sets, and their total size. A full
     0.78-era set is roughly 4,700 sets; a modern full set is several
     times that. The count brackets the era before anything is opened.
  3. Telltale neighbours: a samples/ folder (a 0.78-era habit), .chd
     files (modern-set leanings), and any .dat files — a .dat filename
     usually contains the very version it describes.
  4. The fingerprint sets: pacman.zip, dkong.zip, neogeo.zip — wherever
     they live under the folder — listed by internal file name and size
     (a zip directory listing; nothing is extracted). These sets' contents
     changed across MAME versions in known ways, so their listings read
     like tree rings.

How to read the result (the short version):
  - Folder names or a .dat naming 0.78 / "MAME 2003"  ->  this console's
    core is your match.
  - "FBNeo" anywhere  ->  your sets were built for FinalBurn Neo, a
    different (rolling) vintage; this core will refuse many of them.
  - A set count in the tens of thousands, or heavy .chd presence  ->
    a current-MAME archive; a 2003 core is the wrong machine for most
    of it, and the honest move is to say so rather than force it.
  - Mixed signals are normal in a lived-in archive. The fingerprints
    are the tiebreakers: bring the listings back and they can be read
    against the published per-version data.
"""

import os
import sys
import zipfile

FINGERPRINTS = ("pacman.zip", "dkong.zip", "neogeo.zip")
DEFAULT_PATH = r"Z:\Library\Roms\Archives"


def human(n):
    for unit in ("B", "KB", "MB", "GB", "TB"):
        if n < 1024 or unit == "TB":
            return "%.1f %s" % (n, unit) if unit != "B" else "%d B" % n
        n /= 1024.0


def main():
    root = sys.argv[1] if len(sys.argv) > 1 else (
        DEFAULT_PATH if os.path.isdir(DEFAULT_PATH) else os.getcwd())
    if not os.path.isdir(root):
        print("Folder not found: %s" % root)
        print("Pass your archive folder as the argument, e.g.")
        print('    python3 mame-romset-diagnostic.py "D:\\Arcade\\Roms"')
        return 1

    print("=" * 68)
    print("MAME ROMSET DIAGNOSTIC — read-only, names and sizes only")
    print("Archive: %s" % root)
    print("=" * 68)

    # 1. top-level folders
    try:
        entries = sorted(os.listdir(root))
    except OSError as e:
        print("Cannot list that folder: %s" % e)
        return 1
    folders = [e for e in entries if os.path.isdir(os.path.join(root, e))]
    print("\n-- Top-level folders (%d) --" % len(folders))
    for f in folders:
        print("   %s" % f)

    # 2 + 3. census and telltales (one walk)
    zip_count = 0
    zip_bytes = 0
    chd_count = 0
    dat_files = []
    has_samples = False
    found = {}  # fingerprint name -> (path, [(name, size), ...])
    for dirpath, dirnames, filenames in os.walk(root):
        if os.path.basename(dirpath).lower() == "samples":
            has_samples = True
        for name in filenames:
            low = name.lower()
            path = os.path.join(dirpath, name)
            if low.endswith(".zip"):
                zip_count += 1
                try:
                    zip_bytes += os.path.getsize(path)
                except OSError:
                    pass
                if low in FINGERPRINTS and low not in found:
                    try:
                        with zipfile.ZipFile(path) as z:
                            listing = [(i.filename, i.file_size)
                                       for i in z.infolist()]
                        found[low] = (path, listing)
                    except (zipfile.BadZipFile, OSError) as e:
                        found[low] = (path, None)
                        print("   (could not read %s: %s)" % (path, e))
            elif low.endswith(".chd"):
                chd_count += 1
            elif low.endswith(".dat"):
                dat_files.append(os.path.relpath(path, root))

    print("\n-- Census --")
    print("   Romsets (.zip): %d" % zip_count)
    print("   Total size:     %s" % human(zip_bytes))
    print("   CHD files:      %d" % chd_count)
    print("   samples/ folder: %s" % ("yes" if has_samples else "no"))
    if dat_files:
        print("   .dat files (the filename usually names the version):")
        for d in dat_files[:12]:
            print("     %s" % d)

    # 4. fingerprints
    print("\n-- Fingerprint sets (directory listings — nothing extracted) --")
    for fp in FINGERPRINTS:
        if fp not in found:
            print("\n   %s: not found under this folder" % fp)
            continue
        path, listing = found[fp]
        print("\n   %s  (%s)" % (fp, os.path.relpath(path, root)))
        if listing is None:
            print("     (unreadable as a zip)")
            continue
        for name, size in listing:
            print("     %-24s %8d bytes" % (name, size))

    print("\n" + "=" * 68)
    print("Reading the rings:")
    print("  * ~4,700 sets, a samples/ folder, 0.78/'MAME 2003' in a name:")
    print("    a 0.78-vintage archive — this console's core is the match.")
    print("  * 'FBNeo' in a name: FinalBurn Neo sets, a different vintage.")
    print("  * Tens of thousands of sets or many CHDs: a current-MAME")
    print("    archive — a 2003 core is the wrong machine for most of it.")
    print("  * Mixed? The fingerprint listings above are the tiebreakers.")
    print("=" * 68)
    return 0


if __name__ == "__main__":
    sys.exit(main())
