// jsdom smoke suite: loads the real workshop from disk with canvas, matchMedia,
// and fetch stubbed, then drives it the way a finger would (taps and slider
// events). Needs jsdom, which is a dev-only dependency kept OUTSIDE the
// portable project folder. Run with, for example:
//   NODE_PATH=/path/to/scratch/node_modules node --test tests/smoke.test.cjs
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
let JSDOM,VirtualConsole;
try{({JSDOM,VirtualConsole}=require('jsdom'));}catch{throw new Error('smoke.test.cjs needs jsdom installed outside the project (see header comment).');}
const root=path.resolve(__dirname,'..');
const SPRINGFIELDS={results:[
 {name:'Springfield',admin1:'Illinois',country:'United States',latitude:39.7817,longitude:-89.6501},
 {name:'Springfield',admin1:'Missouri',country:'United States',latitude:37.2089,longitude:-93.2923}]};
const ARCHIVE={daily:{time:['2000-06-15'],temperature_2m_max:[30.2],temperature_2m_min:[18.4],precipitation_sum:[2.1],wind_speed_10m_max:[25]}};
const FORECAST={current:{temperature_2m:21.5,relative_humidity_2m:55,wind_speed_10m:12,weather_code:1,time:'2026-11-14T12:00'},daily:{time:['2026-11-14','2026-11-15','2026-11-16','2026-11-17','2026-11-18','2026-11-19','2026-11-20'],temperature_2m_max:[22,22,22,22,22,22,22],temperature_2m_min:[10,10,10,10,10,10,10],precipitation_sum:[0,0,0,0,0,0,0],weather_code:[1,1,1,1,1,1,1]}};
const CURRENT={current:{temperature_2m:19,relative_humidity_2m:60,wind_speed_10m:14,weather_code:2,time:'2026-11-14T12:00'}};
const tick=()=>new Promise(r=>setTimeout(r,40));
test('workshop smoke: load, original features, and find-a-place search',async()=>{
 const calls=[],errors=[];let geoMode='ok';
 const vc=new VirtualConsole();vc.on('jsdomError',e=>{if(e.type!=='notImplemented')errors.push(String(e.detail&&e.detail.message||e.message));});
 const ctx=new Proxy({},{get:(t,k)=>typeof k==='symbol'?undefined:(()=>ctx),set:()=>true});
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'file://'+root+'/index.html',runScripts:'dangerously',resources:'usable',pretendToBeVisual:true,virtualConsole:vc,beforeParse(window){
  window.matchMedia=q=>({matches:false,media:q,addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}});
  window.HTMLCanvasElement.prototype.getContext=()=>ctx;
  window.addEventListener('error',e=>errors.push(String(e.message)));
  window.fetch=async url=>{const u=String(url);calls.push(u);
   if(u.includes('geocoding-api.open-meteo.com')){if(geoMode==='fail')throw new Error('network down');return {ok:true,status:200,json:async()=>geoMode==='empty'?{results:[]}:SPRINGFIELDS};}
   if(u.includes('archive-api.open-meteo.com'))return {ok:true,status:200,json:async()=>ARCHIVE};
   if(u.includes('api.open-meteo.com/v1/forecast'))return {ok:true,status:200,json:async()=>u.includes('forecast_days=7')?FORECAST:CURRENT};
   throw new Error('unexpected fetch: '+u);};
 }});
 const {window}=dom,document=window.document,$=id=>document.getElementById(id),$$=s=>[...document.querySelectorAll(s)];
 await new Promise(res=>{if(document.readyState==='complete')res();else window.addEventListener('load',res);});
 await tick();await tick();
 const geoCalls=()=>calls.filter(u=>u.includes('geocoding-api.open-meteo.com'));
 const archiveCalls=()=>calls.filter(u=>u.includes('archive-api.open-meteo.com'));
 const forecastCalls=()=>calls.filter(u=>u.includes('api.open-meteo.com/v1/forecast')&&u.includes('forecast_days=7'));
 const currentCalls=()=>calls.filter(u=>u.includes('api.open-meteo.com/v1/forecast')&&!u.includes('forecast_days=7'));
 // Load and original features.
 assert.deepEqual(errors,[],'no page errors on load');
 assert.equal($$('.room').length,8,'all eight rooms render');
 assert.equal($('mission-grid').children.length,9,'nine field missions');
 assert.equal($$('#season-table tbody tr').length,12,'twelve-row season table');
 assert.match($('place-info').querySelector('h2').textContent,/Rothera/,'place card starts on Rothera');
 assert.ok($$('#word-list .word-row').length>=30,'glossary list renders its words');
 assert.equal(calls.length,0,'no fetch of any kind on load (offline core)');
 // (1) Typing fires zero fetches; only the Search tap sends the name.
 const input=$('place-search');input.value='Springfield';
 for(const type of ['input','keydown','keyup','change'])input.dispatchEvent(new window.Event(type,{bubbles:true}));
 await tick();
 assert.equal(calls.length,0,'typing fires zero fetches before Search is tapped');
 // (2) A stubbed two-result search renders both rows with region and country.
 $('search-place').click();await tick();await tick();
 assert.equal(geoCalls().length,1,'exactly one geocoding request, on the Search tap');
 assert.ok(geoCalls()[0].includes('name=Springfield'),'the typed name is what was sent');
 const rows=$$('.found-row');
 assert.equal(rows.length,2,'both stubbed results render as rows');
 assert.match(rows[0].textContent,/Springfield/);assert.match(rows[0].textContent,/Illinois/);assert.match(rows[0].textContent,/United States/);assert.match(rows[0].textContent,/39\.78/,'first row shows its coordinates');
 assert.match(rows[1].textContent,/Missouri/);assert.match(rows[1].textContent,/37\.21/,'second row shows its own coordinates');
 assert.match($('search-status').textContent,/2 places matched/);
 // (3) Tapping a result sets the found place; Look back, Look live, and the Sun room use it.
 rows[0].click();await tick();
 assert.equal($('place').value,'custom','found place takes the custom selection slot, like a map pin');
 assert.equal($('place-info').querySelector('h2').textContent,'Springfield, Illinois, United States','place card names the found place with region and country');
 assert.match($('search-status').textContent,/^Found place: Springfield, Illinois, United States/,'selection is stated in plain words');
 assert.equal($('lat').value,'39.7817','coordinate inputs follow the found place');
 assert.equal($('lon').value,'-89.6501');
 $('archive-date').value='2000-06-15';$('look-back').click();await tick();await tick();
 assert.equal(archiveCalls().length,1,'Look back fetched once for the found place');
 const aurl=new URL(archiveCalls()[0]);
 assert.equal(aurl.searchParams.get('latitude'),'39.7817','Look back used the found latitude');
 assert.equal(aurl.searchParams.get('longitude'),'-89.6501','Look back used the found longitude');
 assert.equal(aurl.searchParams.get('start_date'),'2000-06-15');
 assert.match($('archive-status').textContent,/Springfield, Illinois, United States/,'archive result is labeled with the found name');
 $('look-live').click();await tick();await tick();
 assert.equal(forecastCalls().length,1,'Look live fetched once for the found place');
 assert.equal(new URL(forecastCalls()[0]).searchParams.get('latitude'),'39.7817','Look live used the found latitude');
 assert.match($('live-status').textContent,/MODEL FORECAST/);
 for(const id of ['tilt-place','town-place','sun-place']){const o=$(id).querySelector('option[value="found"]');assert.ok(o,id+' offers the found place');assert.equal(o.textContent,'Springfield, Illinois, United States',id+' labels it with its name');}
 $('sun-place').value='found';$('sun-place').dispatchEvent(new window.Event('change'));await tick();
 assert.match($('sun-status').textContent,/Springfield/,'sun slider runs on the found place');
 $('tilt-place').value='found';$('tilt-place').dispatchEvent(new window.Event('change'));await tick();
 assert.match($('tilt-readout').textContent,/Springfield/,'tilt room runs on the found place');
 // The found place can be re-chosen from the place dropdown after another place was picked.
 $('place').value='london';$('place').dispatchEvent(new window.Event('change'));await tick();
 assert.match($('place-info').querySelector('h2').textContent,/London/,'a built-in place can be chosen after the found place');
 $('place').value='custom';$('place').dispatchEvent(new window.Event('change'));await tick();
 assert.equal($('place-info').querySelector('h2').textContent,'Springfield, Illinois, United States','re-choosing the found place from the dropdown restores it');
 // (4) An empty result set says so plainly and moves nothing.
 geoMode='empty';input.value='Zzzqq';$('search-place').click();await tick();await tick();
 assert.match($('search-status').textContent,/No places matched/, 'no-results message is plain');
 assert.equal($$('.found-row').length,0,'no result rows for an empty set');
 assert.equal($('place-info').querySelector('h2').textContent,'Springfield, Illinois, United States','selection did not move');
 assert.equal($('lat').value,'39.7817','pin coordinates did not move');
 // Failure and empty-input wording.
 geoMode='fail';input.value='Springfield';$('search-place').click();await tick();await tick();
 assert.match($('search-status').textContent,/could not be reached/,'unreachable search is said plainly');
 geoMode='ok';const before=geoCalls().length;input.value='   ';$('search-place').click();await tick();
 assert.match($('search-status').textContent,/Type a place name first/);
 assert.equal(geoCalls().length,before,'empty input sends nothing');
 // (5) Original feature checks still pass.
 const firstWord=$$('#word-list .word-row')[0];firstWord.click();
 assert.equal(firstWord.parentElement.querySelector('.word-meaning').hidden,false,'glossary row opens by tap');
 $('tilt').value='0';$('tilt').dispatchEvent(new window.Event('input'));await tick();
 assert.match($('tilt-readout').textContent,/no seasons of light/,'tilt 0 readout still computes');
 $('archive-date').value=new Date().toISOString().slice(0,10);const archBefore=archiveCalls().length;
 $('look-back').click();await tick();
 assert.equal(archiveCalls().length,archBefore,'a too-recent date is refused before any request');
 assert.match($('archive-status').textContent,/too recent/);
 $('opp-antipode').click();await tick();await tick();
 assert.ok(currentCalls().some(u=>new URL(u).searchParams.get('latitude')==='-39.7817'),'antipode of the found place is fetched');
 assert.equal($$('#opp-result .comparison-stats > div').length,2,'opposite weather renders two cards');
 assert.deepEqual(errors,[],'no page errors at the end');
 window.close();
});
