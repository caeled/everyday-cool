@ECHO OFF
REM ============================================================
REM  NETWALK.BAT - the guided network bring-up.
REM  Part of Pack 002 - The Network Card, and of Steven's
REM  Template C:. It runs the real commands, one at a time,
REM  and tells you what you are looking at after each one.
REM  Run it from the NET folder:  CD \NET  then  NETWALK
REM ============================================================
SET MTCPCFG=C:\NET\MTCP.CFG
REM The stack finds its configuration through the
REM MTCPCFG variable. Pack 002's AUTOEXEC sets it at
REM boot; this walkthrough sets it itself, so the same
REM file works on any machine - including the template.
ECHO.
ECHO  THE NETWORK CARD - A GUIDED BRING-UP
ECHO  ====================================
ECHO  This batch file walks the setup the way it was done:
ECHO  one layer at a time, running the real program at each
ECHO  layer and reading what it says before moving on.
ECHO  Nothing here is simulated. The driver is Realtek's
ECHO  own from 1995; the stack is mTCP, maintained today.
ECHO  (The walkthrough has set MTCPCFG to point at the
ECHO  stack's configuration - part of the config layer.)
ECHO.
ECHO  Press a key and we will look at the toolbox first.
PAUSE
DIR
ECHO.
ECHO  Everything the job needs is in this folder: the driver,
ECHO  the interrogation tools, the configuration, and a whole
ECHO  TCP/IP stack. Next, the machine's own notes.
PAUSE
TYPE README.TXT
ECHO.
ECHO  LAYER 1 - THE CARD AND ITS DRIVER.
ECHO  DOS programs cannot talk to a network card directly.
ECHO  A packet driver sits between them and the hardware, at
ECHO  software interrupt 0x60. Watch it load - and read
ECHO  exactly what it reports.
PAUSE
PNPPD 0x60
ECHO.
ECHO  READ WHAT IT SAID. On a machine with the card fitted,
ECHO  that banner ends with the driver resident at 0x60.
ECHO  In the web console the emulation fits no card, and the
ECHO  driver says so, in so many words: there is no 8019
ECHO  PnP card on your system. The driver is fine. The
ECHO  software is fine. The missing layer is hardware -
ECHO  and knowing which layer is missing is the job.
PAUSE
ECHO  LAYER 2 - ASK THE MACHINE. Never take one program's
ECHO  word. PKTTOOL scans every interrupt for a driver.
PAUSE
PKTTOOL SCAN
ECHO.
ECHO  Two witnesses, one story: nothing is loaded anywhere.
ECHO  That agreement is what a diagnosis feels like.
PAUSE
ECHO  LAYER 3 - THE CONFIGURATION. The stack reads MTCP.CFG
ECHO  before it does anything. Watch for the agreement:
ECHO  packetint 0x60 must match where the driver would live.
PAUSE
TYPE MTCP.CFG
ECHO.
ECHO  A configuration file is a promise the rest of the
ECHO  system makes. This stage is reading the promise
ECHO  before testing it.
PAUSE
ECHO  LAYER 4 - ASK FOR AN ADDRESS. DHCP asks the network
ECHO  who this machine is. Listen to what the stack says
ECHO  when its first layer is missing.
PAUSE
DHCP
ECHO.
ECHO  It asked you a question - are the configured interrupts
ECHO  correct - and the question is the method. You already
ECHO  know: the config is honest, and there is no driver at
ECHO  0x60 for it to find, because there is no card under
ECHO  the driver. Each layer's complaint points one layer
ECHO  down. On a card machine this same command leases an
ECHO  address and writes it into MTCP.CFG.
PAUSE
ECHO  LAYER 5 - TEST ANYWAY.
PAUSE
PING 1.1.1.1
ECHO.
ECHO  One line: IPADDR must be set. No address, because DHCP
ECHO  never ran, because the stack never started, because
ECHO  the driver never loaded, because the card is not
ECHO  there. A five-link chain you can now walk both ways.
ECHO.
ECHO  THE WHOLE BOARD: card, driver, configuration, stack,
ECHO  address. Modern networks add one more layer on top -
ECHO  the network itself, and the control daemons that run
ECHO  it. DHCP is one of those daemons: the address arrives
ECHO  by grace of a service elsewhere, and when a daemon
ECHO  lies or dies, every correct machine is wrong together.
ECHO.
ECHO  The Windows layer - WINPKT and Trumpet Winsock - is in
ECHO  TRUMPET.TXT in this folder. One warning from the field
ECHO  rides in it: keep exactly one WINSOCK.DLL.
ECHO.
ECHO  Walkthrough complete. The machine is yours.
