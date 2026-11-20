"use strict";
/* The Survival Guide — the Knots section's step-through diagrams.
   Plain data, no DOM: one stage list per knot, one stage per numbered
   text step on that knot's card, in the card's own order. app.js
   renders this data into the viewer on each card; test.cjs checks
   the counts against the page without a browser.

   How to read a stage: a stage is a list of drawing elements, drawn
   in order (later elements lie over earlier ones, which is how the
   over/under crossings are told). Element kinds:
     r  rect   [x, y, w, h]        c: "post" (a post or stake) or
                                   "pole" (a lashing pole)
     b  box    [x, y, w, h, rx]    an outline box (lashing turns)
     p  path   "M..."              c: "stand" (teal — the standing
                                   part, or the end that isn't moving
                                   this knot), "work" (gold — the
                                   working end), "frap" (green —
                                   frapping turns); w: stroke width
     o  circle [cx, cy, r]         c as for paths
     e  ellipse [cx, cy, rx, ry]   c as for paths
     a  arrow  [x1, y1, x2, y2]    a gold direction arrow
     d  dot    [x, y]              the working end's tip (gold, or
                                   c: "stand" for the other end)
     t  text   [x, y, "label"]     a small note in the diagram style
   Colour names the rope, not the motion: in a knot tied with one
   end, teal is the standing part and gold the working end; where
   both ends move (the square knot, the sheet bend), each end keeps
   its colour through every stage so it can be followed. All scenes
   share the viewBox 0 0 320 200 and the room's diagram colours.
   The diagrams are schematics: the rope's path and its crossings
   follow the standard tying sequence the card's text describes,
   drawn clean rather than photographed. */

var KNOT_STEPTHROUGHS = {

  /* Square (reef) knot — 3 steps. Top view: the left end is teal,
     the right end gold; each keeps its colour. A correct reef's two
     crossings twist opposite ways, and each end comes out alongside
     its own standing part. */
  square: { stages: [
    [ // 1 — right over left, tuck under, snug: one half knot
      { p: "M118,196 L118,140 C118,120 138,110 160,109 C182,108 198,94 202,74", c: "stand" },
      { p: "M202,196 L202,140 C202,120 182,110 160,109 C138,108 122,94 118,74", c: "work" },
      { d: [203, 68], c: "stand" },
      { d: [117, 68], c: "work" }
    ],
    [ // 2 — left over right: the second crossing, twisting the other way
      { p: "M118,196 L118,146 C118,128 138,118 160,117 C184,116 202,104 204,86 C205,68 184,57 160,57 C138,57 124,38 120,16", c: "stand" },
      { p: "M202,196 L202,146 C202,128 182,118 160,117 C136,116 118,104 116,86 C115,68 136,57 160,57 C182,57 196,38 200,16", c: "work" },
      { d: [120, 12], c: "stand" },
      { d: [200, 12], c: "work" }
    ],
    [ // 3 — pulled up flat: a loop each side, each end by its own standing part
      { p: "M118,196 L124,116", c: "stand" },
      { p: "M202,196 L196,116", c: "work" },
      { e: [141, 92, 31, 21], c: "stand" },
      { e: [179, 92, 31, 21], c: "work" },
      { p: "M133,75 C127,63 123,55 125,44", c: "stand" },
      { p: "M187,75 C193,63 197,55 195,44", c: "work" },
      { d: [125, 40], c: "stand" },
      { d: [195, 40], c: "work" }
    ]
  ] },

  /* Bowline — 5 steps. The card's story: the tree (standing part,
     teal), the hole (small loop), the rabbit (working end, gold).
     The big loop is working-side rope, so it is gold once formed. */
  bowline: { stages: [
    [ // 1 — the small loop made; the tree rises from it; the end waits below
      { p: "M252,8 L252,88", c: "stand" },
      { o: [252, 112, 21], c: "stand" },
      { p: "M240,128 C214,152 176,164 138,158 C120,155 108,146 106,134", c: "work" },
      { d: [106, 130], c: "work" }
    ],
    [ // 2 — the rabbit comes up through the hole; the big loop is sized
      { e: [138, 112, 92, 54], c: "work" },
      { p: "M252,8 L252,88", c: "stand" },
      { o: [252, 112, 21], c: "stand" },
      { p: "M228,156 C238,142 245,128 247,104", c: "work" },
      { d: [247, 100], c: "work" }
    ],
    [ // 3 — the rabbit runs around behind the tree (drawn before the
        // tree, so the standing part lies over it: behind is behind)
      { e: [138, 112, 92, 54], c: "work" },
      { p: "M250,96 C266,88 272,72 264,58 C258,48 246,46 238,52", c: "work" },
      { p: "M252,8 L252,88", c: "stand" },
      { o: [252, 112, 21], c: "stand" },
      { p: "M232,148 C240,136 246,126 247,110", c: "work" }
    ],
    [ // 4 — the rabbit goes back down the hole, ending inside the big loop
      { e: [138, 112, 92, 54], c: "work" },
      { p: "M252,8 L252,88", c: "stand" },
      { o: [252, 112, 21], c: "stand" },
      { p: "M238,52 C232,74 240,96 244,116 C246,128 244,142 238,152", c: "work" },
      { d: [237, 156], c: "work" }
    ],
    [ // 5 — set: hold the big loop, pull the standing part (arrow)
      { e: [140, 108, 84, 48], c: "work" },
      { p: "M252,8 L252,90", c: "stand" },
      { o: [252, 108, 17], c: "stand" },
      { p: "M244,120 C242,132 240,140 236,148", c: "work" },
      { d: [235, 151], c: "work" },
      { a: [278, 64, 278, 26] }
    ]
  ] },

  /* Figure-eight on a bight — 4 steps. The two standing parts are
     teal; the doubled bight that does the travelling is gold. The
     bight is a fold, so it carries no end dot. */
  "figure-eight": { stages: [
    [ // 1 — the rope doubled into a bight where the loop should be
      { p: "M138,196 L138,122", c: "stand" },
      { p: "M182,196 L182,122", c: "stand" },
      { p: "M138,122 L138,84 C138,58 150,44 160,44 C170,44 182,58 182,84 L182,122", c: "work" }
    ],
    [ // 2 — a loop formed with the bight, as if starting an overhand
      { p: "M138,196 L138,122", c: "stand" },
      { p: "M182,196 L182,122", c: "stand" },
      { p: "M138,122 C136,98 144,84 154,78", c: "work" },
      { o: [170, 64, 20], c: "work" },
      { p: "M186,50 C198,40 210,34 224,32", c: "work" }
    ],
    [ // 3 — the bight once around the standing parts, then through
        // the loop: the 8 takes its shape
      { p: "M138,196 L138,122", c: "stand" },
      { p: "M182,196 L182,122", c: "stand" },
      { e: [160, 130, 34, 13], c: "work" },
      { p: "M138,122 C136,98 144,84 154,78", c: "work" },
      { o: [170, 64, 20], c: "work" },
      { p: "M152,142 C148,118 150,96 158,82 C162,74 166,70 170,66 C176,56 184,50 194,48", c: "work" }
    ],
    [ // 4 — dressed: strands flat beside their neighbours, the
        // finished loop standing at the top
      { p: "M138,196 L138,142", c: "stand" },
      { p: "M182,196 L182,142", c: "stand" },
      { p: "M132,142 C128,116 136,100 148,88 C156,80 164,80 172,88 C184,100 192,116 188,142", c: "work" },
      { p: "M145,142 C143,122 147,108 154,100 C158,95 162,95 166,100 C173,108 177,122 175,142", c: "work" },
      { e: [160, 56, 30, 20], c: "work" }
    ]
  ] },

  /* Taut-line hitch — 4 steps. The standing line runs up to the
     load; the stake is at the bottom. The two gripping coils are
     laid working toward the stake, the third wrap on the far side. */
  "taut-line": { stages: [
    [ // 1 — around the stake, and back alongside the standing line
      { p: "M172,8 L172,166", c: "stand" },
      { r: [160, 166, 24, 30], c: "post" },
      { t: [219, 186, "stake"] },
      { p: "M172,178 C156,184 140,180 134,166 C130,156 128,146 128,134 L128,118", c: "work" },
      { d: [128, 112], c: "work" }
    ],
    [ // 2 — twice around the standing line, coiling toward the stake
      { p: "M172,8 L172,166", c: "stand" },
      { r: [160, 166, 24, 30], c: "post" },
      { t: [219, 186, "stake"] },
      { p: "M172,178 C156,184 140,180 134,166 C130,156 128,146 128,138", c: "work" },
      { e: [172, 118, 32, 10], c: "work" },
      { e: [172, 134, 32, 10], c: "work" },
      { d: [140, 110], c: "work" }
    ],
    [ // 3 — once more around the standing line, on the far side
      { p: "M172,8 L172,166", c: "stand" },
      { r: [160, 166, 24, 30], c: "post" },
      { t: [219, 186, "stake"] },
      { p: "M172,178 C156,184 140,180 134,166 C130,156 128,146 128,138", c: "work" },
      { e: [172, 118, 32, 10], c: "work" },
      { e: [172, 134, 32, 10], c: "work" },
      { e: [172, 100, 32, 10], c: "work" },
      { p: "M142,104 C132,112 126,124 124,138", c: "work" },
      { d: [123, 142], c: "work" }
    ],
    [ // 4 — snug, and slid along the line to set the tension (arrow)
      { p: "M172,8 L172,166", c: "stand" },
      { r: [160, 166, 24, 30], c: "post" },
      { t: [219, 186, "stake"] },
      { p: "M172,178 C156,184 140,180 134,166 C130,156 128,146 128,140", c: "work" },
      { e: [172, 104, 32, 10], c: "work" },
      { e: [172, 116, 32, 10], c: "work" },
      { e: [172, 128, 32, 10], c: "work" },
      { p: "M142,110 C132,118 126,128 124,140", c: "work" },
      { d: [123, 144], c: "work" },
      { a: [216, 150, 216, 98] }
    ]
  ] },

  /* Clove hitch — 3 steps, front view of the post. The standing
     part comes in at the bottom left; the working end makes the X,
     takes a second turn above it, and tucks under that turn. */
  clove: { stages: [
    [ // 1 — around the post, crossing over the standing part: an X
      { r: [148, 18, 26, 178], c: "post" },
      { p: "M84,196 C108,184 130,166 146,150", c: "stand" },
      { p: "M148,158 L170,114", c: "stand" },
      { p: "M150,102 C158,118 164,132 170,146", c: "work" },
      { d: [172, 150], c: "work" }
    ],
    [ // 2 — around the post a second time, above the X
      { r: [148, 18, 26, 178], c: "post" },
      { p: "M84,196 C108,184 130,166 146,150", c: "stand" },
      { p: "M148,158 L170,114", c: "stand" },
      { p: "M150,102 C158,118 164,132 170,146", c: "work" },
      { p: "M149,88 C156,72 164,58 171,46", c: "work" },
      { d: [172, 42], c: "work" }
    ],
    [ // 3 — tucked under the second turn (drawn before it, so the
        // turn lies over the end), out alongside the standing part
      { r: [148, 18, 26, 178], c: "post" },
      { p: "M158,30 C154,52 152,74 154,96 C155,112 148,128 134,142 C124,152 112,162 100,170", c: "work" },
      { p: "M84,196 C108,184 130,166 146,150", c: "stand" },
      { p: "M148,158 L170,114", c: "stand" },
      { p: "M150,102 C158,118 164,132 170,146", c: "work" },
      { p: "M149,88 C156,72 164,58 171,46", c: "work" },
      { d: [97, 172], c: "work" }
    ]
  ] },

  /* Two half hitches — 3 steps. The standing line runs in from the
     left to the post; each half hitch is a wrap around that line,
     drawn as a loop around it, hugging the post. */
  "half-hitches": { stages: [
    [ // 1 — around the post, around the standing part, tucked
        // through: one half hitch, snug against the post
      { p: "M14,104 L204,104", c: "stand" },
      { r: [206, 26, 26, 168], c: "post" },
      { t: [219, 18, "post"] },
      { e: [219, 104, 17, 30], c: "work" },
      { e: [172, 104, 20, 12], c: "work" },
      { p: "M156,110 C146,116 138,124 134,134", c: "work" },
      { d: [133, 138], c: "work" }
    ],
    [ // 2 — exactly again: the pair sits as a neat double wrap
      { p: "M14,104 L204,104", c: "stand" },
      { r: [206, 26, 26, 168], c: "post" },
      { t: [219, 18, "post"] },
      { e: [219, 104, 17, 30], c: "work" },
      { e: [176, 104, 20, 12], c: "work" },
      { e: [138, 104, 20, 12], c: "work" },
      { p: "M122,110 C112,116 106,124 102,132", c: "work" },
      { d: [101, 136], c: "work" }
    ],
    [ // 3 — a tail left, and a round turn on the post (the extra
        // full wrap, teal) so the hitches only hold, not haul
      { p: "M14,104 L204,104", c: "stand" },
      { r: [206, 26, 26, 168], c: "post" },
      { t: [219, 18, "post"] },
      { e: [219, 104, 24, 38], c: "stand" },
      { e: [219, 104, 17, 30], c: "work" },
      { e: [180, 104, 18, 12], c: "work" },
      { e: [146, 104, 18, 12], c: "work" },
      { p: "M130,110 C116,118 104,128 96,142", c: "work" },
      { d: [94, 146], c: "work" }
    ]
  ] },

  /* Sheet bend — 5 steps. The thicker rope (teal, wide) holds the
     bight; the thinner rope (gold, narrow) does the travelling.
     Draw order does the telling: what passes behind is drawn first. */
  sheet: { stages: [
    [ // 1 — a bight formed in the thicker rope, and held; the
        // thinner rope waits in the other hand
      { p: "M104,14 L104,112 C104,140 118,152 140,152 C162,152 176,140 176,112 L176,14", c: "stand", w: 9 },
      { p: "M262,196 C242,192 224,190 208,187", c: "work", w: 5 },
      { d: [204, 186], c: "work" }
    ],
    [ // 2 — the thinner end up through the bight, from underneath
        // (drawn before the bight, so it passes under its bottom)
      { p: "M262,196 C224,190 188,180 164,164 C150,154 142,140 140,124", c: "work", w: 5 },
      { p: "M104,14 L104,112 C104,140 118,152 140,152 C162,152 176,140 176,112 L176,14", c: "stand", w: 9 },
      { d: [140, 118], c: "work" }
    ],
    [ // 3 — around behind both legs of the bight, and down the far side
      { p: "M108,78 C136,64 164,64 182,76", c: "work", w: 5 },
      { p: "M262,196 C224,190 188,180 164,164 C150,154 142,140 140,124", c: "work", w: 5 },
      { p: "M104,14 L104,112 C104,140 118,152 140,152 C162,152 176,140 176,112 L176,14", c: "stand", w: 9 },
      { p: "M140,118 C128,108 118,98 112,86", c: "work", w: 5 },
      { p: "M182,76 C190,92 190,108 184,122", c: "work", w: 5 },
      { d: [183, 126], c: "work" }
    ],
    [ // 4 — tucked under its own standing part, on top of the bight;
        // the end comes out on the same side it went in
      { p: "M108,78 C136,64 164,64 182,76", c: "work", w: 5 },
      { p: "M104,14 L104,112 C104,140 118,152 140,152 C162,152 176,140 176,112 L176,14", c: "stand", w: 9 },
      { p: "M184,122 C178,134 168,142 154,144 C168,150 184,152 198,152", c: "work", w: 5 },
      { p: "M262,196 C224,190 188,180 164,164 C150,154 142,140 140,124", c: "work", w: 5 },
      { p: "M140,118 C128,108 118,98 112,86", c: "work", w: 5 },
      { p: "M182,76 C190,92 190,108 184,122", c: "work", w: 5 },
      { d: [201, 152], c: "work" }
    ],
    [ // 5 — the double sheet bend: around behind the legs twice
        // before the same tuck
      { p: "M108,78 C136,64 164,64 182,76", c: "work", w: 5 },
      { p: "M110,96 C136,84 164,84 180,94", c: "work", w: 5 },
      { p: "M104,14 L104,112 C104,140 118,152 140,152 C162,152 176,140 176,112 L176,14", c: "stand", w: 9 },
      { p: "M184,122 C178,134 168,142 154,144 C168,150 184,152 198,152", c: "work", w: 5 },
      { p: "M262,196 C224,190 188,180 164,164 C150,154 142,140 140,124", c: "work", w: 5 },
      { p: "M140,118 C128,108 118,98 112,86", c: "work", w: 5 },
      { p: "M182,76 C190,92 190,108 184,122", c: "work", w: 5 },
      { d: [201, 152], c: "work" }
    ]
  ] },

  /* Trucker's hitch — 5 steps, wide view: far anchor left, near
     anchor right, the loop tied in the line between them. */
  truckers: { stages: [
    [ // 1 — the far end anchored: two half hitches at the far post;
        // the line still slack, the free end waiting at the near post
      { r: [30, 44, 16, 150], c: "post" },
      { r: [274, 44, 16, 150], c: "post" },
      { t: [46, 30, "far anchor"] },
      { p: "M46,76 C120,88 200,88 268,80", c: "stand" },
      { e: [38, 96, 13, 9], c: "stand" },
      { e: [38, 114, 13, 9], c: "stand" },
      { p: "M268,80 C276,104 278,128 272,150", c: "work" },
      { d: [271, 154], c: "work" }
    ],
    [ // 2 — a loop tied in the standing line, facing the near anchor
      { r: [30, 44, 16, 150], c: "post" },
      { r: [274, 44, 16, 150], c: "post" },
      { t: [46, 30, "far anchor"] },
      { p: "M46,76 L176,76", c: "stand" },
      { e: [38, 96, 13, 9], c: "stand" },
      { e: [38, 114, 13, 9], c: "stand" },
      { o: [190, 76, 14], c: "work" },
      { p: "M204,76 C232,84 254,96 264,116 C270,128 272,140 271,150", c: "work" },
      { d: [271, 154], c: "work" }
    ],
    [ // 3 — the free end around the near anchor and back up
        // through the loop
      { r: [30, 44, 16, 150], c: "post" },
      { r: [274, 44, 16, 150], c: "post" },
      { t: [46, 30, "far anchor"] },
      { t: [276, 30, "near anchor"] },
      { p: "M46,76 L176,76", c: "stand" },
      { e: [38, 96, 13, 9], c: "stand" },
      { e: [38, 114, 13, 9], c: "stand" },
      { o: [190, 76, 14], c: "work" },
      { p: "M204,80 C230,90 252,100 266,112", c: "work" },
      { e: [282, 124, 13, 20], c: "work" },
      { p: "M272,138 C244,122 218,102 200,88", c: "work" },
      { d: [196, 82], c: "work" }
    ],
    [ // 4 — pull toward the anchor (arrow): the span tightens
      { r: [30, 44, 16, 150], c: "post" },
      { r: [274, 44, 16, 150], c: "post" },
      { t: [46, 30, "far anchor"] },
      { t: [276, 30, "near anchor"] },
      { p: "M46,76 L176,76", c: "stand" },
      { e: [38, 96, 13, 9], c: "stand" },
      { e: [38, 114, 13, 9], c: "stand" },
      { o: [190, 76, 14], c: "work" },
      { p: "M204,82 L268,116", c: "work" },
      { e: [282, 124, 13, 20], c: "work" },
      { p: "M270,136 L202,90", c: "work" },
      { d: [197, 84], c: "work" },
      { a: [228, 148, 258, 170] }
    ],
    [ // 5 — locked off: two half hitches around the doubled line
      { r: [30, 44, 16, 150], c: "post" },
      { r: [274, 44, 16, 150], c: "post" },
      { t: [46, 30, "far anchor"] },
      { t: [276, 30, "near anchor"] },
      { p: "M46,76 L176,76", c: "stand" },
      { e: [38, 96, 13, 9], c: "stand" },
      { e: [38, 114, 13, 9], c: "stand" },
      { o: [190, 76, 14], c: "work" },
      { p: "M204,82 L268,116", c: "work" },
      { e: [282, 124, 13, 20], c: "work" },
      { p: "M270,136 L202,90", c: "work" },
      { e: [193, 95, 13, 8], c: "work" },
      { e: [187, 107, 13, 8], c: "work" },
      { p: "M182,112 C172,124 164,136 158,148", c: "work" },
      { d: [157, 151], c: "work" }
    ]
  ] },

  /* Square lashing — 4 steps. Two poles at right angles; gold
     wraps bind the crossing, green frapping locks the bundle. */
  lashing: { stages: [
    [ // 1 — a clove hitch on the upright, just below where the
        // cross pole rests; the cross pole laid in place
      { r: [147, 14, 26, 182], c: "pole" },
      { r: [34, 97, 252, 26], c: "pole" },
      { p: "M149,148 L171,132", c: "work" },
      { p: "M149,170 L171,154", c: "work" },
      { p: "M150,178 C142,186 134,192 124,196", c: "stand" }
    ],
    [ // 2 — wrapping turns: three shown, each beside the last,
        // each pulled snug
      { r: [147, 14, 26, 182], c: "pole" },
      { r: [34, 97, 252, 26], c: "pole" },
      { p: "M149,148 L171,132", c: "work" },
      { p: "M149,170 L171,154", c: "work" },
      { p: "M150,178 C142,186 134,192 124,196", c: "stand" },
      { b: [118, 66, 84, 88, 10], c: "work" },
      { b: [126, 74, 68, 72, 9], c: "work" },
      { b: [134, 82, 52, 56, 8], c: "work" }
    ],
    [ // 3 — frapping: between the poles, around the bundle of
        // wrapping turns, hauled tight — the lock
      { r: [147, 14, 26, 182], c: "pole" },
      { r: [34, 97, 252, 26], c: "pole" },
      { p: "M149,148 L171,132", c: "work" },
      { p: "M149,170 L171,154", c: "work" },
      { p: "M150,178 C142,186 134,192 124,196", c: "stand" },
      { b: [118, 66, 84, 88, 10], c: "work" },
      { b: [126, 74, 68, 72, 9], c: "work" },
      { b: [134, 82, 52, 56, 8], c: "work" },
      { p: "M136,84 L184,136", c: "frap" },
      { p: "M184,84 L136,136", c: "frap" },
      { p: "M143,80 L191,132", c: "frap" },
      { p: "M191,80 L143,132", c: "frap" }
    ],
    [ // 4 — finished with a clove hitch on the cross pole, beside
        // the turns
      { r: [147, 14, 26, 182], c: "pole" },
      { r: [34, 97, 252, 26], c: "pole" },
      { p: "M149,148 L171,132", c: "work" },
      { p: "M149,170 L171,154", c: "work" },
      { p: "M150,178 C142,186 134,192 124,196", c: "stand" },
      { b: [118, 66, 84, 88, 10], c: "work" },
      { b: [126, 74, 68, 72, 9], c: "work" },
      { b: [134, 82, 52, 56, 8], c: "work" },
      { p: "M136,84 L184,136", c: "frap" },
      { p: "M184,84 L136,136", c: "frap" },
      { p: "M143,80 L191,132", c: "frap" },
      { p: "M191,80 L143,132", c: "frap" },
      { p: "M214,99 L230,121", c: "work" },
      { p: "M236,99 L252,121", c: "work" },
      { d: [258, 122], c: "work" }
    ]
  ] }
};

function knotStepthrough(key) {
  return KNOT_STEPTHROUGHS[key] || null;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { KNOT_STEPTHROUGHS, knotStepthrough };
}
