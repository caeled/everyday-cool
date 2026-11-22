# The Coloring Book

A free colouring room by Steven Powell, Everyday Cool, built with AI assistance. Twelve picture pages to colour on screen with a box of 24 crayons — or print the outline and colour it with real crayons — plus a bench that turns your own photo into a colouring page.

Open `index.html`. Everything is local: no framework, account, installation, analytics, or internet connection. The whole room is one self-contained page (plus its lesson page); it also works as a standalone folder.

## Picture pages

Twelve hand-built vector pages, graded by patch size — the grading is deliberate practice for aim (see the lesson):

- **Little hands** (big patches): Rocket (13 patches), Robot Buddy (14), Robot Pup (14)
- **Getting steady**: Baby Bot (20), Bulldog (19), Fish (20), Butterfly (21)
- **Fine detail** (small patches): Train (29), Dinosaur (27), Owl (28), Submarine (28), Castle (31)

Pick a crayon, tap a patch to fill it. The stripy white crayon is the eraser crayon. Undo and Start over are on the page. **Print the outline** gives you the blank page for real crayons; **Print my coloured picture** prints your finished work; **Save as picture** downloads a PNG.

## Your own picture

Drop in any photo (or choose one) and the page converts it to an outline with a Canny-style pipeline — grayscale, a Gaussian blur, Sobel edge detection, thinning, and hysteresis thresholding (a faint line counts if it is connected to a strong one), finished with a one-pixel sealing growth so patches don't leak. Two sliders steer it: **Line strength** sets the bar for a definite line, and **Detail** trades calm for fineness (Simple blurs more and suits busy photos; Detailed keeps fainter lines). Then you colour it by tapping patches, filled by flood fill under the lines. Print and save work here too.

**Privacy: your picture never leaves this device.** The outline is drawn right in the page, on your own machine. Nothing is uploaded, nothing is sent anywhere — close the page and the picture is gone.

## The back door

Colouring a patch is a targeting task, and small patches are harder targets — that is Fitts's law, and it is why the pages are graded. The lesson page (`coloring-book-lesson.html`, also under the 📖 Lesson button in the app) tells the whole story: aim as the real curriculum, the Solitaire-and-Minesweeper lineage of learning by playing, how edge detection finds a line, and what a flood fill is. It also names the limits honestly: busy photos still make busier outlines — the pipeline narrows that gap without closing it — and the sliders are a fix, not a cure.

## Files

- `index.html` — the colouring book itself (pages, crayons, photo conversion, print and save)
- `coloring-book-lesson.html` — the back-door lesson
- `README.md` — this file
- `COLLECTION.md` — collection origin note

Code is MIT; original writing is CC BY 4.0.
