(function(root){'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function daylight(lat,month){const day=15+month*30.4375,dec=23.44*Math.sin(2*Math.PI*(284+day)/365)*Math.PI/180;const p=clamp(lat,-89.999,89.999)*Math.PI/180,q=-Math.tan(p)*Math.tan(dec);return q>=1?0:q<=-1?24:24*Math.acos(q)/Math.PI;}
function seasonal(p,m){return p.base+p.amp*Math.cos((m-(p.lat>=0?6:0))*Math.PI/6);}
function density(t,s){return 1027-.2*(t-10)+.78*(s-35);}
function oceanModel(warm,cold,salt,wind){const contrast=density(cold,salt)-density(warm,35);const sinking=clamp(contrast/6,0,1);const flow=.15+.65*sinking+.2*Math.abs(wind)/10;const heat=flow*Math.max(0,warm-cold)/18;const coastTarget=heat*3;const moisture=Math.exp(.06*(warm-22))*Math.max(0,wind)/10;return {contrast,sinking,flow,heat,coastTarget,moisture};}
function oceanTrace(settings){const m=oceanModel(...settings),base=oceanModel(22,4,35,4);let coast=0;const rows=[0];for(let i=0;i<30;i++){coast+=((m.coastTarget-base.coastTarget)-coast)*.12;rows.push(coast);}return {model:m,rows};}
function cloud(t,rh,h){const a=17.625,b=243.04,g=Math.log(rh/100)+a*t/(b+t),dew=b*g/(a-g),base=Math.max(0,125*(t-dew));const top=t-9.8*Math.min(h,base)/1000-6*Math.max(0,h-base)/1000;return {dew,base,top,forms:h>=base};}
const api={clamp,daylight,seasonal,density,oceanModel,oceanTrace,cloud};if(typeof module!=='undefined')module.exports=api;else root.WeatherScience=api;
})(typeof window==='undefined'?globalThis:window);