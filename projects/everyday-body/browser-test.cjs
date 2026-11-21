'use strict';
// Test-only dependency: npm install playwright, then npx playwright install chromium.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.BODY_TEST_BROWSER?{executablePath:process.env.BODY_TEST_BROWSER}:{})});
 try {
 const context=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce',offline:true});
 const page=await context.newPage(),errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
 await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
 assert.equal(await page.locator('#lab-region option').count(),25);
 const ids=await page.locator('#lab-region option').evaluateAll(es=>es.map(e=>e.value));
 for(const view of ['front','back']){
  await page.locator('#lab-'+view).click();
  for(const layer of ['regions','muscles','bones','nerves']){
   await page.selectOption('#lab-layer',layer);
   for(const id of ids){await page.selectOption('#lab-region',id);assert.equal(await page.locator('.lab-part[aria-pressed=true]').getAttribute('data-lab-region'),id);assert.ok((await page.locator('#lab-detail').innerText()).length>100);}
  }
 }
 await page.selectOption('#lab-region','r6-left');
 const backX=Number(await page.locator('[data-lab-region="r6-left"]').getAttribute('cx'));
 await page.locator('#lab-front').click();
 assert.ok(backX<240);assert.ok(Number(await page.locator('[data-lab-region="r6-left"]').getAttribute('cx'))>240);
 const shape=page.locator('[data-lab-region="r9-right"]');await shape.focus();await page.keyboard.press('Space');
 assert.equal(await page.locator('#lab-region').inputValue(),'r9-right');
 assert.equal(await page.locator(':focus').getAttribute('data-lab-region'),'r9-right');
 await page.keyboard.press('Enter');assert.equal(await page.locator('#lab-region').inputValue(),'r9-right');
 for(let i=0;i<5;i++){
  await page.selectOption('#detective-case',String(i));
  assert.equal(await page.locator('#detective-answer').isVisible(),false);
  await page.fill('#detective-notes',`Prediction ${i}: <script>not executable</script>`);
  await page.locator('#detective-clue').click();assert.equal(await page.locator('#detective-clue-text').isVisible(),true);
  await page.locator('#detective-explain').click();assert.equal(await page.locator('#detective-answer').isVisible(),true);
  await page.locator('#detective-map').click();
  const expected=await page.evaluate(i=>detectiveCases[i],i);
  assert.equal(await page.locator('#lab-region').inputValue(),expected.region);
  assert.equal(await page.locator('#lab-layer').inputValue(),expected.layer);
  await page.locator('#detective-atlas').click();assert.equal(await page.locator('#organ-name').innerText(),await page.evaluate(id=>organs.find(o=>o.id===id).name,expected.organ));
 }
 await page.selectOption('#detective-case','0');assert.match(await page.locator('#detective-notes').inputValue(),/Prediction 0/);
 assert.equal(await page.locator('#detective-answer').isVisible(),true);
 await page.locator('#detective-explain').click();assert.equal(await page.locator('#detective-answer').isVisible(),false);
 const organIds=await page.locator('#organ-buttons button').evaluateAll(es=>es.map(e=>e.dataset.id));assert.equal(organIds.length,12);
 for(const id of organIds){await page.locator(`#organ-buttons [data-id="${id}"]`).click();assert.ok(await page.locator('#organ-summary').innerText());}
 await page.locator('#organ-buttons [data-id="brain"]').click();
 const brainIds=await page.locator('#region-panel button').evaluateAll(es=>es.map(e=>e.dataset.region));assert.equal(brainIds.length,12);
 for(const id of brainIds){await page.locator(`#region-panel [data-region="${id}"]`).click();assert.equal(await page.locator(`#region-panel [data-region="${id}"]`).getAttribute('aria-pressed'),'true');}
 // Every possible answer, including the previously broken unselected-wrong branch.
 for(let q=0;q<6;q++)for(let answer=0;answer<3;answer++){
  await page.evaluate(q=>{qi=q;showQuiz();},q);await page.locator(`#answers [data-answer="${answer}"]`).click();
  assert.ok((await page.locator('#quiz-result').innerText()).length>10);assert.equal(await page.locator('#answers button:disabled').count(),3);
 }
 for(const scenario of ['run','eat','hear','hot']){await page.selectOption('#scenario',scenario);assert.equal(await page.locator('#chain .step').count(),4);}
 for(const width of [320,390,768,1280]){
  await page.setViewportSize({width,height:850});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`no overflow at ${width}px`);
  await page.locator('#lab-back').click();await page.selectOption('#lab-region','r14-left');
 }
 if(process.env.BODY_TEST_SCREENSHOT){await page.locator('#body-lab').screenshot({path:process.env.BODY_TEST_SCREENSHOT});}
 await page.reload();assert.equal(await page.locator('#detective-notes').inputValue(),'');
 assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
 console.log('Browser checks passed: 200 region/view/layer combinations, 5 cases, keyboard selection, atlas/brain, 18 quiz answers, 4 viewport widths, offline file loading.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
