@ECHO OFF
REM ============================================================
REM  TUTOR.BAT - the in-drive lesson engine.
REM
REM  HOW AN AUTHOR USES THIS FILE:
REM  The engine is the shape, not the words. Each STAGE below
REM  does four things: say what to do, PAUSE, check the work
REM  (IF EXIST), and either advance or repeat with a hint.
REM  Write your course by replacing the stage text, the proof
REM  files, and the hints. Keep stages small - one task each.
REM  A student runs TUTOR at the prompt and works the course
REM  inside the machine, which is the whole point: the lesson
REM  lives where the work happens.
REM ============================================================
CLS
ECHO.
ECHO  ==========================================
ECHO   [YOUR COURSE TITLE HERE]
ECHO  ==========================================
ECHO.
ECHO  This drive teaches by doing. Each stage asks for one
ECHO  thing, then checks your work before moving on.
ECHO  If you leave and come back, run TUTOR again - the
ECHO  stages check the drive, not your history.
ECHO.
PAUSE
GOTO STAGE1

:STAGE1
CLS
ECHO  STAGE 1 - MAKE A FILE OUT OF NOTHING
ECHO  ------------------------------------------
ECHO  DOS machines run on files you make yourself. The
ECHO  oldest way is still on this machine:
ECHO.
ECHO      COPY CON PROOF1.TXT
ECHO.
ECHO  Type anything - your name is fine - then press F6
ECHO  and Enter to close the file. You have made a file
ECHO  out of keystrokes, the way it was done in 1981.
ECHO.
ECHO  When PROOF1.TXT exists, press a key and I will check.
PAUSE
IF EXIST PROOF1.TXT GOTO STAGE2
ECHO.
ECHO  Not yet - PROOF1.TXT is not on the drive.
ECHO  Hint: COPY CON takes its closing key seriously.
ECHO  F6, then Enter. Nothing is harmed by trying again.
ECHO.
PAUSE
GOTO STAGE1

:STAGE2
CLS
ECHO  STAGE 2 - A PLACE FOR THE FILE TO LIVE
ECHO  ------------------------------------------
ECHO  Make a folder and put a copy of your file in it:
ECHO.
ECHO      MD WORK2
ECHO      COPY PROOF1.TXT WORK2
ECHO.
ECHO  The original stays where it was. COPY makes a second
ECHO  one - the whole idea of a backup, in one line.
ECHO.
ECHO  When WORK2 holds a copy, press a key and I will check.
PAUSE
IF EXIST WORK2\PROOF1.TXT GOTO STAGE3
ECHO.
ECHO  Not yet - WORK2\PROOF1.TXT is not there.
ECHO  Hint: DIR shows you the drive as it is, not as you
ECHO  hoped. Look, then fix.
ECHO.
PAUSE
GOTO STAGE2

:STAGE3
CLS
ECHO  STAGE 3 - LOOK AT WHAT YOU MADE
ECHO  ------------------------------------------
ECHO  No check this time - just look:
ECHO.
ECHO      DIR WORK2
ECHO.
ECHO  One folder, one file, both yours, made from a bare
ECHO  prompt with two commands older than the web.
ECHO.
PAUSE
GOTO FINISH

:FINISH
CLS
ECHO.
ECHO  ==========================================
ECHO   COURSE COMPLETE
ECHO  ==========================================
ECHO.
ECHO  You made a file from nothing, gave it a home, and
ECHO  proved it was there by looking. That loop - make,
ECHO  check, look - is most of bench work, in any era.
ECHO.
ECHO  [Authors: replace this with what YOUR course taught.]
ECHO.
