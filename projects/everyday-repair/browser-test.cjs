'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {pathToFileURL}=require('node:url');const E=require('./engine.js');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.REPAIR_TEST_BROWSER?{executablePath:process.env.REPAIR_TEST_BROWSER}:{})});
 try{
 const ctx=await browser.newContext({viewport:{width:1280,height:900},offline:true,reducedMotion:'reduce'}),page=await ctx.newPage(),errors=[],network=[];
 ctx.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));page.on('pageerror',e=>errors.push(e.message));
 ctx.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
 const open=async file=>page.goto(pathToFileURL(path.join(__dirname,file)).href);
 async function widths(){for(const width of [320,390,768,1280]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`no overflow ${width}`);}}
 async function screenshot(name){if(process.env.REPAIR_TEST_SHOTS){fs.mkdirSync(process.env.REPAIR_TEST_SHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.REPAIR_TEST_SHOTS,name+'.png'),fullPage:true});}}
 await open('index.html');assert.equal(await page.locator('#case-select option').count(),4);
 await page.locator('#theory-0').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#theory-0').getAttribute('aria-pressed'),'true');
 await page.click('#repair');assert.match(await page.locator('#status').innerText(),/Not enough/);assert.ok(await page.locator('#verify').isDisabled());
 await page.fill('#repair-notes','Prediction <b>must stay text</b>');await page.selectOption('#case-select','1');await page.selectOption('#case-select','0');assert.equal(await page.locator('#repair-notes').inputValue(),'Prediction <b>must stay text</b>');
 for(let i=0;i<4;i++){
  await page.selectOption('#case-select',String(i));
  for(let actual=0;actual<3;actual++){
   if(actual)await page.click('#new-ticket');
   await page.click(`#theory-${(actual+1)%3}`);
   for(let t=0;t<4;t++)await page.click(`#test-${t}`);
   await page.click('#repair');assert.match(await page.locator('#status').innerText(),/Not enough/);
   await page.click(`#theory-${actual}`);await page.click('#repair');assert.ok(await page.locator('#verify').isEnabled());
   await page.click('#verify');assert.match(await page.locator('#status').innerText(),/^Verified:/);assert.ok(await page.locator('#repair').isDisabled());
  }
 }
 assert.match(await page.locator('#completion').innerText(),/4 \/ 4/);await widths();await screenshot('repair-desktop');
 await page.setViewportSize({width:390,height:844});await screenshot('repair-mobile');
 await page.reload();assert.equal(await page.locator('#repair-notes').inputValue(),'');
 await open('one-more-clue.html');
 for(let i=0;i<6;i++){
  await page.selectOption('#case-select',String(i));const actual=E.mysteries[i].actual;
  await page.click(`#theory-${actual}`);await page.click('#close-case');assert.match(await page.locator('#status').innerText(),/so do others/);
  await page.click(`#theory-${(actual+1)%4}`);
  for(let t=0;t<4;t++)await page.click(`#test-${t}`);
  await page.click('#close-case');assert.match(await page.locator('#status').innerText(),/conflicts/);
  await page.click(`#theory-${actual}`);await page.click('#close-case');assert.match(await page.locator('#status').innerText(),/Case closed with evidence/);assert.ok(await page.locator('#case-explanation').isVisible());
 }
 assert.match(await page.locator('#case-progress').innerText(),/6 \/ 6/);
 await page.fill('#clue-notes','A revised theory.');await page.selectOption('#case-select','0');await page.selectOption('#case-select','5');assert.equal(await page.locator('#clue-notes').inputValue(),'A revised theory.');
 await page.click('#replay-case');assert.equal(await page.locator('#clue-notes').inputValue(),'');assert.match(await page.locator('#case-progress').innerText(),/5 \/ 6/);
 await widths();await screenshot('clue-desktop');await page.setViewportSize({width:390,height:844});await screenshot('clue-mobile');
 await open('robot-rescue.html');
 const original=await page.locator('#board').innerHTML();await page.locator('#tile-1').focus();await page.keyboard.press('Space');assert.match(await page.locator('#turns').innerText(),/1 rotations/);assert.equal(await page.locator(':focus').getAttribute('id'),'tile-1');
 await page.keyboard.press('ArrowDown');assert.equal(await page.locator(':focus').getAttribute('id'),'tile-6');
 await page.click('#undo');assert.equal(await page.locator('#board').innerHTML(),original);
 await page.click('#hint');assert.match(await page.locator('#turns').innerText(),/1 hints/);await page.click('#undo');assert.equal(await page.locator('#board').innerHTML(),original);
 for(let n=0;n<6;n++){
  await page.selectOption('#mission-select',String(n));const start=E.boardFor(n),solution=E.solvedBoard(E.missions[n]);
  assert.ok(await page.locator('#dispatch').isDisabled());
  for(const i of E.missions[n].path){let turns=0;while(start[i]!==solution[i]&&turns<4){await page.click(`#tile-${i}`);start[i]=E.rotate(start[i]);turns++;}}
  assert.ok(await page.locator('#dispatch').isEnabled());await page.click('#dispatch');assert.match(await page.locator('#status').innerText(),/Rescue complete/);assert.equal(await page.locator('#board button:not(:disabled)').count(),0);
 }
 assert.equal(await page.locator('#crew-count').innerText(),'6 / 6');assert.match(await page.locator('#status').innerText(),/All six/);
 await page.click('#reset');assert.equal(await page.locator('#crew-count').innerText(),'5 / 6');assert.ok(await page.locator('#dispatch').isDisabled());
 // Complete a mission using hints to verify the independent help path.
 for(let i=0;i<25&&await page.locator('#dispatch').isDisabled();i++)await page.click('#hint');
 assert.ok(await page.locator('#dispatch').isEnabled());await page.click('#dispatch');
 await widths();await screenshot('robot-desktop');await page.setViewportSize({width:390,height:844});await screenshot('robot-mobile');
 for(const file of ['robot-rescue-lesson.html','one-more-clue-lesson.html']){await open(file);await widths();}
 assert.deepEqual(network,[],'no external requests during offline play');assert.deepEqual(errors,[]);
 // Exercise an actual search submission but intercept the outgoing request.
 await ctx.setOffline(false);await ctx.route('https://www.youtube.com/**',route=>route.fulfill({status:200,contentType:'text/html',body:'Search intercepted by local test.'}));
 await open('index.html');await page.fill('#video-query','zipper & backpack repair');
 const popupWait=ctx.waitForEvent('page');await page.locator('#video-search button').click();const popup=await popupWait;await popup.waitForLoadState();
 assert.equal(new URL(popup.url()).searchParams.get('search_query'),'zipper & backpack repair');assert.equal(await popup.evaluate(()=>window.opener),null);await popup.close();
 console.log('Browser checks passed: 12 repair tickets, 6 mysteries, 6 robot missions, hints/undo/reset, notes, keyboard, 4 widths, offline loading, encoded YouTube search.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
