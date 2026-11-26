STEVEN'S TEMPLATE C:
====================
The starting drive Steven Powell actually builds from -
"the basic C I would build" - shared as a template in the
old shareware sense (see REGISTER.TXT).

WHAT IS HERE, AND WHOSE IT IS
-----------------------------
His, word for word, byte for byte:
  AUTOEXEC.BAT, CONFIG.SYS        at the root
  DOS\AUTOEXEC.BAT, DOS\CONFIG.SYS, DOS\C.BAT
  WINSETUP\AUTOEXEC.BAT, WINSETUP\AUTOEXEC.BAK

Free software, working and extracted:
  DOS\ - a real DOS: the FreeDOS 1.4 base (kernel,
  FreeCom shell, HIMEMX, Edit, MEM, CTMouse and the
  core utilities) laid in around Steven's own three
  files. DOS\FREEDOS.TXT is the manifest; the original
  packages, sources included, ride beside the template.
  NET\ - the whole Pack 002 network layer: Realtek's
  PNPPD packet driver, Crynwr utilities, WINPKT, and the
  complete mTCP stack. NET\SOURCES.TXT lists the
  original archives. NET\NETWALK.BAT is the guided
  bring-up: CD \NET, then NETWALK, and it runs the
  setup with narration, one real command at a time.
  NET\BBS.TXT is the phone book -- boards that still
  answer on telnet, drawn from the Telnet BBS Guide;
  on a card machine, TELNET is all it takes.

Yours to supply (the slots):
  WINDOWS\  your Windows 3.x install.
  WINSETUP\ your Windows setup files.
  Each slot has a SLOT.TXT saying what belongs there.
  Microsoft's layers were never ours to hand out; the
  template is the shape and the handwriting, the way the
  consoles in Nerd Heaven ship the machine, not the ROMs.

HOW TO USE IT
-------------
Unzip it as a folder and give the folder to an emulator
as drive C: - the DOS Workbench's folder door on the web,
DOSBox or DOSBox-X on a desktop. Two honest notes:

  1. Folder-mounted DOS (the Workbench, plain DOSBox)
     does not run CONFIG.SYS, and Steven's AUTOEXEC ends
     with win - with the Windows slot empty you will see
     three error lines at boot (DOSBox words them
     "Illegal command"; MS-DOS says "Bad command or
     file name") - for SMARTDRV, MOUSE and WIN. Those
     are the empty slots
     announcing themselves. The machine still lands at a
     working C:\ prompt, and NET works as-is.
  2. On a bootable setup (a DOSBox-X boot disk, real
     hardware), a boot sector wants KERNEL.SYS at the
     root of a bootable disk - making that image is
     the bootable-disk project. When this drive does
     boot for real, CONFIG.SYS at the root is Steven's,
     and DOS\FREEDOS.TXT names the two lines of his
     that point at Microsoft names (HIMEM, MOUSE) and
     their FreeDOS counterparts here.

Steven Powell built the original. The template was
assembled, with the slots labelled, by Muse,
26 November 2026 - Nerd Heaven, Everyday Cool.
