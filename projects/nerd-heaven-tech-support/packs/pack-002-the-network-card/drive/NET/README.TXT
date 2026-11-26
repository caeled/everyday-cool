THE NETWORK CARD - A SETUP WORKSHOP
====================================

This is a plain DOS machine. A network card has been fitted -
an NE2000-compatible card, the kind nearly every machine of
the era either had or pretended to have. Nothing is loaded:
no driver, no TCP/IP, nothing. Bringing the network up, one
layer at a time, is the whole job.

Work through the walkthrough beside the console on the web
page. It tells you what to type, what a healthy machine
answers, and how to read it when it answers otherwise.
Everything you need is in this folder:

  PNPPD.COM    The packet driver for the card. First layer:
               DOS programs cannot talk to the card itself,
               so this small driver sits between them and
               the hardware, at software interrupt 0x60.
  PKTADDR.COM  Crynwr utilities from the packet driver
  PKTMODE.COM  collection - they interrogate a loaded
               packet driver and report what they find.
  MTCP.CFG     The TCP/IP configuration file. The stack
               reads it before it does anything.
  DHCP.EXE     The mTCP programs: a complete TCP/IP stack
  PING.EXE     for DOS. DHCP asks the network for an
  PKTTOOL.EXE  address; PING tests one; PKTTOOL inspects
  FTP.EXE      the packet driver itself. FTP, FTPSRV,
  FTPSRV.EXE   HTGET, HTTPSERV, TELNET, SNTP, NC and
  HTGET.EXE    IRCJR ride along - a working stack is a
  HTTPSERV.EXE toolbox, not a single program.
  TELNET.EXE
  SNTP.EXE
  NC.EXE
  IRCJR.EXE
  SAMPLE.CFG   mTCP's own sample configuration, kept as
               the reference for every setting.
  COPYING.TXT  The mTCP licence (GPL). The packet driver
               and utilities are free software too; the
               Crynwr collection they came from is the
               period canon.
  WINPKT.COM   For the Windows layer - see TRUMPET.TXT.
  BBS.TXT - the phone book: boards that still answer on telnet,
                drawn from the Telnet BBS Guide. On a machine with
                a card, TELNET is all it takes.
  NETWALK.BAT - the guided bring-up: this whole setup,
                run as a narrated batch file. Type NETWALK.
  TRUMPET.TXT

One honest note before you start. This console's machine
is an emulation, and the emulation has no network card in
it. When you load the packet driver it will look for the
card and tell you, in its own words, that it is not there.
That is not you failing the lesson - reading that message
and knowing exactly which layer is speaking IS the lesson.
On a machine with the card - or an emulator that fits one,
like DOSBox-X - this same drive loads the driver, takes an
address by DHCP, and pings. The setup you are learning is
the real setup, every step of it.
