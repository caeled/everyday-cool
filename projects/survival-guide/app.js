// The Survival Guide — the first-aid kit checklist counter and the
// which-knot bench. Both run entirely in the page and forget
// everything when the page closes. Nothing is stored and nothing
// is sent anywhere.
(function () {
  var boxes = Array.prototype.slice.call(document.querySelectorAll('.kit-check'));
  var status = document.getElementById('kit-count');
  if (!boxes.length || !status) return;
  function update() {
    var packed = boxes.filter(function (b) { return b.checked; }).length;
    status.textContent = packed + ' of ' + boxes.length + ' packed' +
      (packed === boxes.length ? ' — kit complete. Now go learn where everything in it lives.' : '.');
  }
  boxes.forEach(function (b) { b.addEventListener('change', update); });
  update();
})();

// The which-knot bench (Knots section). The job-to-knot mapping is
// plain data, kept outside the DOM wiring so it can be checked
// without a browser. Every answer is a card in the section, and
// every answer names the classic wrong choice on purpose — half of
// knotcraft is knowing which knot not to tie.
var KNOT_JOBS = {
  join: {
    knot: 'Sheet bend — the double, if the ropes differ or the cord is slick',
    anchor: '#knot-sheet',
    why: "It's the bend built for joining: the bight rides in the thicker rope, the thinner rope does the travelling, and it holds its shape where most bends quit.",
    wrong: 'The square knot. Used as a bend it capsizes — rolls over and spills both ends — under a working pull, and its granny-knot twin is worse, slipping and jamming by turns. The square knot binds around things; it was never a joining knot.'
  },
  loop: {
    knot: 'Bowline',
    anchor: '#knot-bowline',
    why: "A fixed loop that keeps its size under load, won't slip shut on what it holds, and — the rarest virtue — still unties afterward with your fingers.",
    wrong: 'The overhand loop. Simple, and it jams: after one hard load it welds itself shut, and the loop comes off with a knife. (The figure-eight loop is the strong alternative — stronger than the bowline, and it pays for it by jamming too.)'
  },
  adjust: {
    knot: 'Taut-line hitch',
    anchor: '#knot-taut-line',
    why: 'It slides when you push it and grips when the line pulls — so at dusk, when the tarp sags and the line goes slack, you tune it standing at the line instead of re-tying it.',
    wrong: 'Two half hitches. A fine tie-off doing the wrong job: the line is locked at whatever tension you tied it, and a sagging tarp at 2 a.m. means untying in the rain.'
  },
  post: {
    knot: 'Two half hitches',
    anchor: '#knot-half-hitches',
    why: 'Quick, secure, and checkable at a glance — and it unties after the load comes off. Start with a round turn around the post when the pull is heavy, so the hitches only have to hold, not haul.',
    wrong: "The bare clove hitch. It's the right start to a lashing and the wrong finish for a tie-off: when the pull swings or works on and off, it can roll itself loose. Finish it with the half hitches it was asking for."
  },
  haul: {
    knot: "Trucker's hitch",
    anchor: '#knot-truckers',
    why: 'A pulley made of rope: the loop and the anchor give you mechanical advantage — 3-to-1 in the ideal, less after friction — so the line ends up tighter than your arms could ever leave it.',
    wrong: 'Raw pulling, locked off with two half hitches. You get exactly the tension you can hold with one hand while tying with the other — which is to say, a loose line, permanently.'
  },
  bind: {
    knot: 'Square lashing',
    anchor: '#knot-lashing',
    why: "Wrapping turns to bind the poles, frapping turns between them to lock the bundle — it's how shelter frames and camp gadgets have been built for a century of camporees.",
    wrong: 'Round and round with rope and no frapping. It looks bound and racks loose the first time the frame takes a sideways push — the frapping is the knot; the wrapping is just the setup.'
  }
};

function knotAnswer(job) {
  return KNOT_JOBS[job] || null;
}

(function () {
  var result = document.getElementById('knot-result');
  var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-knot-job]'));
  if (!result || !buttons.length) return;
  function show(job) {
    var a = knotAnswer(job);
    if (!a) return;
    result.innerHTML = '';
    var head = document.createElement('p');
    head.className = 'big-answer';
    var link = document.createElement('a');
    link.href = a.anchor;
    link.textContent = a.knot;
    head.appendChild(link);
    var why = document.createElement('p');
    why.textContent = a.why;
    var wrong = document.createElement('p');
    var strong = document.createElement('strong');
    strong.textContent = 'The classic wrong choice: ';
    wrong.appendChild(strong);
    wrong.appendChild(document.createTextNode(a.wrong));
    result.appendChild(head);
    result.appendChild(why);
    result.appendChild(wrong);
  }
  buttons.forEach(function (b) {
    b.addEventListener('click', function () { show(b.getAttribute('data-knot-job')); });
  });
})();

// The knot step-throughs (Knots section). Stage diagrams are plain
// data in knots.js (KNOT_STEPTHROUGHS) — one stage per numbered text
// step on the card — so the counts can be checked without a browser.
// This component only renders that data: Back/Next buttons, a step
// counter, the card's current text step highlighted, and a
// "Watch it tie" replay that draws the final stage's rope on. The
// text steps carry the teaching; without this script they stand
// exactly as written.
(function () {
  var mounts = Array.prototype.slice.call(document.querySelectorAll('[data-knot-steps]'));
  if (!mounts.length || typeof KNOT_STEPTHROUGHS === 'undefined') return;
  var COLOURS = { stand: '#7fdddb', work: '#f5c369', frap: '#79d9c9' };
  var BG = '#0d1a29';

  function colour(el) { return COLOURS[el.c] || COLOURS.work; }
  function width(el) { return el.w || 6; }

  // One drawing element -> SVG text. Rope shapes are drawn twice:
  // first as a wider stroke in the background colour (the halo that
  // breaks the line underneath at a crossing), then in their own
  // colour. Draw order in the data is what tells over from under.
  function elSvg(el) {
    var out = '';
    if (el.r) {
      if (el.c === 'pole') {
        return '<rect x="' + el.r[0] + '" y="' + el.r[1] + '" width="' + el.r[2] + '" height="' + el.r[3] +
          '" fill="#22384c" stroke="#7fdddb" stroke-width="2"/>';
      }
      return '<rect x="' + el.r[0] + '" y="' + el.r[1] + '" width="' + el.r[2] + '" height="' + el.r[3] +
        '" fill="#304354"/>';
    }
    if (el.b) {
      return '<rect x="' + el.b[0] + '" y="' + el.b[1] + '" width="' + el.b[2] + '" height="' + el.b[3] +
        '" rx="' + el.b[4] + '" fill="none" stroke="' + colour(el) + '" stroke-width="5"/>';
    }
    if (el.o || el.e) {
      var shape = el.o
        ? '<circle cx="' + el.o[0] + '" cy="' + el.o[1] + '" r="' + el.o[2] + '"'
        : '<ellipse cx="' + el.e[0] + '" cy="' + el.e[1] + '" rx="' + el.e[2] + '" ry="' + el.e[3] + '"';
      out = shape + ' fill="none" stroke="' + BG + '" stroke-width="' + (width(el) + 5) + '"/>' +
            shape + ' fill="none" stroke="' + colour(el) + '" stroke-width="' + width(el) + '"/>';
      return out;
    }
    if (el.p) {
      var cls = (el.c === 'work' || el.c === 'frap') ? ' class="ks-anim"' : '';
      return '<path d="' + el.p + '" fill="none" stroke="' + BG + '" stroke-width="' + (width(el) + 5) +
        '" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path' + cls + ' d="' + el.p + '" fill="none" stroke="' + colour(el) + '" stroke-width="' + width(el) +
        '" stroke-linecap="round" stroke-linejoin="round"/>';
    }
    if (el.a) {
      var dx = el.a[2] - el.a[0], dy = el.a[3] - el.a[1];
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      var ux = dx / len, uy = dy / len, px = -uy, py = ux;
      var tip = el.a[2] + ',' + el.a[3];
      var b1 = (el.a[2] - ux * 11 + px * 5) + ',' + (el.a[3] - uy * 11 + py * 5);
      var b2 = (el.a[2] - ux * 11 - px * 5) + ',' + (el.a[3] - uy * 11 - py * 5);
      return '<line x1="' + el.a[0] + '" y1="' + el.a[1] + '" x2="' + el.a[2] + '" y2="' + el.a[3] +
        '" stroke="' + COLOURS.work + '" stroke-width="3.5" stroke-linecap="round"/>' +
        '<polygon points="' + tip + ' ' + b1 + ' ' + b2 + '" fill="' + COLOURS.work + '"/>';
    }
    if (el.d) {
      return '<circle cx="' + el.d[0] + '" cy="' + el.d[1] + '" r="5.5" fill="' +
        (el.c === 'stand' ? COLOURS.stand : COLOURS.work) + '" stroke="' + BG + '" stroke-width="2"/>';
    }
    if (el.t) {
      return '<text class="d-note" x="' + el.t[0] + '" y="' + el.t[1] + '" text-anchor="middle">' + el.t[2] + '</text>';
    }
    return '';
  }

  function cardOf(node) {
    var n = node;
    while (n && !(n.classList && n.classList.contains('card'))) n = n.parentNode;
    return n;
  }

  function buildViewer(mount) {
    var data = knotStepthrough(mount.getAttribute('data-knot-steps'));
    if (!data) return;
    var card = cardOf(mount);
    var steps = card ? Array.prototype.slice.call(card.querySelectorAll('ol li')) : [];
    var title = card && card.querySelector('h3') ? card.querySelector('h3').textContent : 'Knot';
    var total = data.stages.length;
    var stage = 0;
    var timer = null;

    mount.innerHTML =
      '<svg class="knot-svg" viewBox="0 0 320 200" role="img" aria-label=""></svg>' +
      '<div class="knot-bar">' +
      '<button type="button" class="ks-back">&larr; Back</button>' +
      '<span class="ks-count" role="status"></span>' +
      '<button type="button" class="ks-next">Next &rarr;</button>' +
      '<button type="button" class="ks-watch">Watch it tie</button>' +
      '</div>';
    var svg = mount.querySelector('svg');
    var count = mount.querySelector('.ks-count');
    var back = mount.querySelector('.ks-back');
    var next = mount.querySelector('.ks-next');
    var watch = mount.querySelector('.ks-watch');

    function render() {
      svg.innerHTML = data.stages[stage].map(elSvg).join('');
      svg.setAttribute('aria-label', title + ' — step ' + (stage + 1) + ' of ' + total);
      count.textContent = 'Step ' + (stage + 1) + ' of ' + total;
      steps.forEach(function (li, i) { li.classList.toggle('knot-step-on', i === stage); });
      back.disabled = stage === 0;
      next.disabled = stage === total - 1;
    }
    function go(n) {
      if (timer) { clearTimeout(timer); timer = null; }
      stage = Math.max(0, Math.min(total - 1, n));
      render();
    }
    back.addEventListener('click', function () { go(stage - 1); });
    next.addEventListener('click', function () { go(stage + 1); });
    watch.addEventListener('click', function () {
      go(total - 1);
      var paths = Array.prototype.slice.call(svg.querySelectorAll('path.ks-anim'));
      if (!paths.length) return;
      paths.forEach(function (p) {
        var len = p.getTotalLength();
        p.style.strokeDasharray = String(len);
        p.style.strokeDashoffset = String(len);
      });
      // Force a layout pass so the dash state registers, then let
      // each rope path draw itself on, staggered in draw order.
      void svg.getBoundingClientRect();
      paths.forEach(function (p, i) {
        p.style.transition = 'stroke-dashoffset 1s ease ' + (i * 0.22) + 's';
        p.style.strokeDashoffset = '0';
      });
      timer = setTimeout(function () {
        paths.forEach(function (p) {
          p.style.transition = '';
          p.style.strokeDasharray = '';
          p.style.strokeDashoffset = '';
        });
        timer = null;
      }, 1000 + paths.length * 220 + 150);
    });
    render();
  }

  mounts.forEach(buildViewer);
})();
