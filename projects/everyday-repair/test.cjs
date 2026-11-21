'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const E=require('./engine.js');
let evidenceChecks=0;
for(const c of [...E.repairCases,...E.mysteries]){
 for(const t of c.tests)assert.equal(t.outcomes.length,c.hypotheses.length);
 for(let actual=0;actual<c.hypotheses.length;actual++){
  for(let mask=0;mask<2**c.tests.length;mask++){
   const observed=c.tests.map((_,i)=>i).filter(i=>mask&(1<<i));
   const fits=E.candidates(c,observed,actual);assert.ok(fits.includes(actual),'truth survives all subsets');
   for(let selected=0;selected<c.hypotheses.length;selected++)assert.equal(E.supported(c,{actual,observed,selected}),fits.length===1&&selected===actual);
   evidenceChecks++;
  }
  assert.deepEqual(E.candidates(c,c.tests.map((_,i)=>i),actual),[actual],'all modeled causes distinguishable');
  const initial=E.newInquiry(actual),next=E.investigate(c,initial,0);
  assert.deepEqual(initial.observed,[],'investigation is immutable');assert.deepEqual(next.observed,[0]);
  assert.equal(E.investigate(c,next,0),next,'no duplicate evidence');
  assert.equal(E.investigate(c,next,-1),next);assert.equal(E.investigate(c,next,99),next);
  assert.equal(E.investigate(c,{...next,solved:true},1).observed.length,1,'closed case cannot gain clues');
 }
}
for(let mask=0;mask<16;mask++){let m=mask;for(let n=0;n<4;n++)m=E.rotate(m);assert.equal(m,mask);}
assert.equal(E.rotate(3),6);assert.equal(E.rotate(5),10);
assert.equal(E.neighbor(4,1),-1);assert.equal(E.neighbor(5,3),-1);assert.equal(E.neighbor(0,0),-1);assert.equal(E.neighbor(24,2),-1);
const disconnected=Array(25).fill(0);disconnected[0]=2;disconnected[1]=2;
assert.deepEqual([...E.powered(disconnected)],[0],'one facing port is insufficient');
disconnected[1]=8;assert.deepEqual([...E.powered(disconnected)],[0,1]);assert.deepEqual(E.route(disconnected),[]);
for(const [n,m] of E.missions.entries()){
 assert.equal(m.path[0],0);assert.equal(m.path.at(-1),24);assert.equal(new Set(m.path).size,m.path.length);
 for(let i=1;i<m.path.length;i++)assert.ok([0,1,2,3].some(d=>E.neighbor(m.path[i-1],d)===m.path[i]),'adjacent path cells');
 const solution=E.solvedBoard(m),start=E.boardFor(n);assert.equal(start.length,25);assert.ok(!E.powered(start).has(24),'mission starts unsolved');
 assert.ok(E.powered(solution).has(24));assert.deepEqual(E.route(solution),m.path);
 // Reach a solution solely by legal clockwise rotations, with distractors intact.
 for(const i of m.path){let turns=0;while(start[i]!==solution[i]&&turns<4){start[i]=E.rotate(start[i]);turns++;}assert.equal(start[i],solution[i]);}
 const route=E.route(start);assert.equal(route[0],0);assert.equal(route.at(-1),24);
 for(let i=1;i<route.length;i++){const a=route[i-1],b=route[i],d=[0,1,2,3].find(d=>E.neighbor(a,d)===b);assert.ok(start[a]&(1<<d));assert.ok(start[b]&(1<<((d+2)%4)));}
 assert.deepEqual(E.boardFor(n),E.boardFor(n),'deterministic restart');
}
for(const file of ['index.html','robot-rescue.html','one-more-clue.html','robot-rescue-lesson.html','one-more-clue-lesson.html']){
 const html=fs.readFileSync(path.join(__dirname,file),'utf8');
 assert.ok(!/<(?:script|img|iframe)[^>]+src=["']https?:/i.test(html));
 assert.ok(!/<link[^>]+href=["']https?:/i.test(html));
 assert.ok(html.includes('id="help"'));assert.ok(html.includes('name="viewport"'));
}
assert.ok(!/\b(fetch|XMLHttpRequest|localStorage|sessionStorage)\s*\(/.test(fs.readFileSync(path.join(__dirname,'app.js'),'utf8')));
console.log(`Passed ${evidenceChecks} evidence subsets, all 12 faults and 6 mysteries, all 6 mission routes, rotation/boundary rules, and offline asset checks.`);
