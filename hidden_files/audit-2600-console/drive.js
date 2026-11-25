/* Headless audit drive for The 2600 Console (Javatari embedded unmodified).
   Loads the house page from a local server, drops the synthetic TEST2600 ROM
   onto the screen through Javatari's own drag & drop path, samples canvas
   pixels, drives the joystick from the keyboard, and round-trips a save
   state both ways Javatari offers: slots (Ctrl+1 save / Alt+1 load) and the
   File... export (.jst) + Load-from-File import. Logs every network request. */
const fs = require('fs');
const puppeteer = require('puppeteer');

const BASE = 'http://127.0.0.1:8611';
const PAGE = BASE + '/the-2600-console.html';
const DL = '/tmp/audit2600/downloads';
fs.mkdirSync(DL, { recursive: true });
for (const f of fs.readdirSync(DL)) fs.unlinkSync(DL + '/' + f);

const results = { requests: [], errors: [], samples: {}, steps: [] };
const step = (name, ok, detail) => { results.steps.push({ name, ok, detail }); console.log((ok ? 'PASS' : 'FAIL') + '  ' + name + (detail ? '  — ' + detail : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

function classify([r, g, b]) {
  if (r > 170 && g > 170 && b > 170) return 'near-white';
  if (r > 100 && b > g + 40 && b >= r) return 'violet';
  if (b > r + 40 && r < 110) return 'blue';
  if (r > b + 40 && r > g - 10) return 'red-orange';
  if (g > r + 30 && g > b + 30) return 'green';
  return 'other';
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--autoplay-policy=no-user-gesture-required',
           '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  await page.setRequestInterception(true);
  page.on('request', req => { results.requests.push(req.url().startsWith('data:') ? 'data:(embedded)' : req.url()); req.continue().catch(() => {}); });
  page.on('pageerror', e => results.errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') results.errors.push('console: ' + m.text()); });
  page.on('requestfailed', r => results.errors.push('reqfailed: ' + r.url() + ' ' + (r.failure() || {}).errorText));

  const bcdp = await browser.target().createCDPSession();
  await bcdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: DL, eventsEnabled: true });

  await page.goto(PAGE, { waitUntil: 'networkidle2', timeout: 45000 });
  await page.waitForSelector('#javatari-screen canvas', { timeout: 20000 });
  step('emulator canvas boots inside #javatari-screen', true);
  await sleep(3000);

  const sample = async (fx, fy) => page.evaluate((fx, fy) => {
    const cv = document.querySelector('#javatari-screen canvas');
    const ctx = cv.getContext('2d');
    const x = Math.min(cv.width - 1, Math.max(0, Math.round(fx * cv.width)));
    const y = Math.min(cv.height - 1, Math.max(0, Math.round(fy * cv.height)));
    const d = ctx.getImageData(x, y, 1, 1).data;
    return [d[0], d[1], d[2]];
  }, fx, fy);

  const dims = await page.evaluate(() => { const cv = document.querySelector('#javatari-screen canvas'); return { w: cv.width, h: cv.height, id: cv.id }; });
  results.canvas = dims;
  console.log('canvas:', JSON.stringify(dims));

  // --- Load the synthetic ROM through Javatari's own drag & drop path ---
  const b64 = fs.readFileSync('/tmp/audit2600/test2600.bin').toString('base64');
  await page.evaluate(async (b64) => {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const file = new File([bytes], 'test2600.bin', { type: 'application/octet-stream' });
    const dt = new DataTransfer();
    dt.items.add(file);
    const target = document.querySelector('#javatari-screen canvas') || document.getElementById('javatari-screen');
    for (const type of ['dragenter', 'dragover', 'drop']) {
      target.dispatchEvent(new DragEvent(type, { dataTransfer: dt, bubbles: true, cancelable: true }));
    }
  }, b64);
  step('synthetic ROM dropped on screen (Javatari drag & drop path)', true);
  await sleep(3500);

  // PF1 band: canvas x 32..95 (centre 64 -> fx .20); mirrored band centre fx .80; BG centre fx .50
  let pf = await sample(0.20, 0.5);
  let bg = await sample(0.5, 0.5);
  let pfR = await sample(0.80, 0.5);
  results.samples.initial = { pf, bg, pfR };
  console.log('initial  PF:', pf, classify(pf), ' BG:', bg, classify(bg), ' PF-right:', pfR, classify(pfR));
  step('playfield band renders near-white (PF1 $FF, COLUPF $0E = rgb 244,244,244)', classify(pf) === 'near-white', 'rgb=' + pf.join(','));
  step('mirrored playfield band renders near-white (CTRLPF reflect)', classify(pfR) === 'near-white', 'rgb=' + pfR.join(','));
  step('background renders mode-0 blue (COLUBK $84 = rgb 56,64,176)', classify(bg) === 'blue', 'rgb=' + bg.join(','));

  // --- Momentary input: hold Up -> BG turns orange-red while held ---
  await page.click('#javatari-screen canvas').catch(() => {});
  await page.keyboard.down('ArrowUp');
  await sleep(800);
  let up = await sample(0.5, 0.5);
  results.samples.upHeld = up;
  console.log('up-held BG:', up, classify(up));
  step('holding ArrowUp changes execution (BG -> $36 red-orange)', classify(up) === 'red-orange', 'rgb=' + up.join(','));
  await page.keyboard.up('ArrowUp');
  await sleep(600);
  let rel = await sample(0.5, 0.5);
  results.samples.upReleased = rel;
  step('releasing ArrowUp restores mode colour (blue)', classify(rel) === 'blue', 'rgb=' + rel.join(','));

  // --- Edge input: tap Down -> mode steps 0 -> 1 (green), again -> 2 (violet) ---
  const tapDown = async () => { await page.keyboard.down('ArrowDown'); await sleep(180); await page.keyboard.up('ArrowDown'); await sleep(500); };
  await tapDown();
  let m1 = await sample(0.5, 0.5);
  results.samples.mode1 = m1;
  console.log('mode1 BG:', m1, classify(m1));
  step('tapping ArrowDown steps mode to 1 (COLUBK $C6 green)', classify(m1) === 'green', 'rgb=' + m1.join(','));
  await tapDown();
  let m2 = await sample(0.5, 0.5);
  results.samples.mode2 = m2;
  console.log('mode2 BG:', m2, classify(m2));
  step('second ArrowDown tap steps mode to 2 (COLUBK $66 violet)', classify(m2) === 'violet', 'rgb=' + m2.join(','));

  // --- Save-state slot round-trip: Ctrl+1 save (at violet), change state, Alt+1 load ---
  await page.keyboard.down('Control'); await page.keyboard.press('1'); await page.keyboard.up('Control');
  await sleep(400);
  const slotSaved = await page.evaluate(() => localStorage.getItem('javatarisave1') !== null);
  results.slot1Saved = slotSaved;
  step('Ctrl+1 writes save slot 1 to localStorage (javatarisave1)', slotSaved === true);
  await tapDown(); // mode wraps 2 -> 0 (blue)
  let wrapped = await sample(0.5, 0.5);
  results.samples.afterWrap = wrapped;
  step('state changed after save (mode wraps to blue)', classify(wrapped) === 'blue', 'rgb=' + wrapped.join(','));
  await page.keyboard.down('Alt'); await page.keyboard.press('1'); await page.keyboard.up('Alt');
  await sleep(600);
  let restored = await sample(0.5, 0.5);
  results.samples.restored = restored;
  console.log('restored BG:', restored, classify(restored));
  step('Alt+1 loads the saved state back (violet returns, exact rgb match)', classify(restored) === 'violet' && restored.join() === m2.join(), 'rgb=' + restored.join(','));

  // --- File export (.jst) through the Save State dialog's File entry ---
  // Real (trusted) mouse clicks — Javatari's dialog uses a user-gesture (UIG)
  // guard for downloads/file dialogs, so synthetic events are not enough.
  const realClickByText = async (label) => {
    const pt = await page.evaluate((label) => {
      const els = Array.from(document.querySelectorAll('div, li, span')).filter(e => e.children.length === 0 && (e.textContent || '').trim() === label);
      if (!els.length) return null;
      const r = els[0].getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }, label);
    if (!pt) return false;
    await page.mouse.click(pt.x, pt.y);
    return true;
  };
  const realClickDialogFile = async (kind) => {
    const pt = await page.evaluate((kind) => {
      const li = Array.from(document.querySelectorAll('li')).find(e =>
        /File\.\.\./.test(e.textContent || '') &&
        e.getBoundingClientRect().width > 0 &&
        (kind === 'save' ? /Save/.test(e.textContent) : /Load/.test(e.textContent)));
      if (!li) return null;
      const r = li.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }, kind);
    if (!pt) return false;
    await page.mouse.click(pt.x, pt.y);
    return true;
  };
  const tapMenuItem = realClickByText;
  const tapDialogFile = () => realClickDialogFile('save');
  const tapDialogLoadFile = () => realClickDialogFile('load');

  let jstPath = null;
  try {
    await page.click('#jt-bar-power');
    await sleep(700);
    const menuOk = await tapMenuItem('Save State');
    await sleep(900);
    const dlgOk = await tapDialogFile();
    let files = [];
    for (let i = 0; i < 14 && !files.some(f => f.endsWith('.jst')); i++) { await sleep(500); files = fs.readdirSync(DL); }
    results.downloaded = files;
    jstPath = files.find(f => f.endsWith('.jst')) ? DL + '/' + files.find(f => f.endsWith('.jst')) : null;
    step('Save State -> File... downloads a .jst state file', !!jstPath, 'menu=' + menuOk + ' dialog=' + dlgOk + ' files=' + files.join(','));
    if (jstPath) {
      const head = fs.readFileSync(jstPath).subarray(0, 18).toString('latin1');
      results.jstHead = JSON.stringify(head);
      step('.jst file carries the Javatari state identifier', head.includes('javataristate!'), 'size=' + fs.statSync(jstPath).size + ' bytes');
    }
  } catch (e) {
    step('Save State -> File... downloads a .jst state file', false, 'exception: ' + e.message);
  }

  // --- Load the .jst back through Load State -> File (the baton, returned) ---
  if (jstPath) {
    try {
      await tapDown(); // violet -> blue, so a successful load visibly changes the screen
      let before = await sample(0.5, 0.5);
      console.log('before .jst load BG:', before, classify(before));
      const chooserPromise = page.waitForFileChooser({ timeout: 12000 });
      await page.click('#jt-bar-power');
      await sleep(700);
      await tapMenuItem('Load State');
      await sleep(900);
      await tapDialogLoadFile();
      const chooser = await chooserPromise;
      await chooser.accept([jstPath]);
      await sleep(1200);
      let after = await sample(0.5, 0.5);
      results.samples.jstLoaded = after;
      console.log('after .jst load BG:', after, classify(after));
      step('Load State -> File... restores the exported moment (violet returns)', classify(after) === 'violet' && classify(before) === 'blue', 'rgb=' + after.join(','));
    } catch (e) {
      step('Load State -> File... restores the exported moment (violet returns)', false, 'exception: ' + e.message);
    }
  }

  // --- Network + error verdicts ---
  const external = results.requests.filter(u => !u.startsWith(BASE) && u !== 'data:(embedded)');
  results.externalRequests = external;
  step('zero external network requests for the whole session', external.length === 0,
       results.requests.length + ' requests total, all local/embedded' + (external.length ? ': ' + external.join(' | ') : ''));
  step('zero page errors / console errors', results.errors.length === 0, results.errors.slice(0, 4).join(' | ') || 'none');

  fs.writeFileSync('/tmp/audit2600/drive-results.json', JSON.stringify(results, null, 2));
  await browser.close();
  const failed = results.steps.filter(s => !s.ok).length;
  console.log('\nDRIVE: ' + (results.steps.length - failed) + '/' + results.steps.length + ' checks passed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('DRIVE CRASH:', e); process.exit(2); });
