(function(root){'use strict';
const pairs=[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
function integer(value,min,max){if(typeof value==='string'&&!/^\d+$/.test(value.trim()))return null;const n=Number(value);return Number.isSafeInteger(n)&&n>=min&&n<=max?n:null;}
function romanParts(value){let n=integer(value,1,3999);if(n===null)return null;const parts=[];for(const [v,s] of pairs)while(n>=v){parts.push({symbol:s,value:v});n-=v;}return parts;}
function toRoman(n){const parts=romanParts(n);return parts?parts.map(p=>p.symbol).join(''):null;}
function fromRoman(text){if(typeof text!=='string')return null;const s=text.trim().toUpperCase();if(!s||s.length>15||!/^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/.test(s))return null;const map={I:1,V:5,X:10,L:50,C:100,D:500,M:1000};let n=0;for(let i=0;i<s.length;i++)n+=map[s[i]]<(map[s[i+1]]||0)?-map[s[i]]:map[s[i]];return toRoman(n)===s?n:null;}
function clock(start,hours){const a=integer(start,1,12),b=integer(hours,0,1000);if(a===null||b===null)return null;const total=a+b,remainder=total%12;return {total,remainder,turns:Math.floor(total/12),hour:remainder||12};}
function factors(n){const f=[];for(let i=1;i<=n;i++)if(n%i===0)f.push(i);return f;}
function packs(a,b){a=integer(a,1,200);b=integer(b,1,200);if(a===null||b===null)return null;let x=a,y=b;while(y){const r=x%y;x=y;y=r;}return {count:x,stickers:a/x,pencils:b/x,factorsA:factors(a),factorsB:factors(b),common:factors(x)};}
function recipe(servings){const n=integer(servings,1,40);return n===null?null:{servings:n,grams:n*75,factor:n/4};}
const api={integer,romanParts,toRoman,fromRoman,clock,packs,recipe};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MathWild=api;
})(typeof window==='undefined'?this:window);
