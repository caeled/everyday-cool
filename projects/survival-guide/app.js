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
