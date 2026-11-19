// The Survival Guide — the first-aid kit checklist counter.
// Runs entirely in the page: it counts ticks and forgets everything
// when the page closes. Nothing is stored and nothing is sent anywhere.
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
