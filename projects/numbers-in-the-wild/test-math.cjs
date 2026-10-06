const assert=require('node:assert/strict'),m=require('./math.js');
for(const [n,r] of [[1,'I'],[4,'IV'],[9,'IX'],[49,'XLIX'],[94,'XCIV'],[944,'CMXLIV'],[2026,'MMXXVI'],[3999,'MMMCMXCIX']]){assert.equal(m.toRoman(n),r);assert.equal(m.fromRoman(r),n);}
for(let n=1;n<=3999;n++)assert.equal(m.fromRoman(m.toRoman(n)),n);
for(const value of [0,-1,1.5,4000,Infinity,NaN,1e12,'','  ','abc','1e3'])assert.equal(m.toRoman(value),null);
for(const value of ['','IIII','IL','IIV','VX','MMMM','<script>','IX IX'])assert.equal(m.fromRoman(value),null);
assert.equal(m.fromRoman(' xlix '),49);assert.equal(m.clock(10,5).hour,3);assert.equal(m.clock(12,0).hour,12);assert.equal(m.clock(11,25).hour,12);assert.equal(m.clock('',5),null);
assert.deepEqual(m.packs(24,18).common,[1,2,3,6]);assert.equal(m.packs(17,12).count,1);assert.equal(m.packs(200,200).count,200);assert.equal(m.packs(0,3),null);
assert.equal(m.recipe(6).grams,450);assert.equal(m.recipe(2).grams,150);assert.equal(m.recipe(40).grams,3000);assert.equal(m.recipe(0),null);
console.log('Math checks passed: 3999 Roman round trips, known values, invalid/oversized inputs, clock wrapping, equal packs, and recipe scaling.');
