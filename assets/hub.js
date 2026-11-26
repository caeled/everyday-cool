(()=>{'use strict';
const cards=[...document.querySelectorAll('.project')],search=document.getElementById('search'),buttons=[...document.querySelectorAll('[data-filter]')];
let topic='all',offline='all',trailOnly=false;
let trail={};try{trail=JSON.parse(localStorage.getItem('ec-trail-v1')||'{}');}catch(e){trail={};}
const trailLine=document.getElementById('trail');
function saveTrail(){try{localStorage.setItem('ec-trail-v1',JSON.stringify(trail));}catch(e){}}
function marked(card){const m=trail[card.dataset.id];return m&&(m.t||m.b);}
function update(){
 const terms=search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);let count=0;
 for(const card of cards){
  const show=(topic==='all'||card.dataset.topic===topic)&&(offline==='all'||card.dataset.offline===offline)&&(!trailOnly||marked(card))&&terms.every(term=>card.dataset.search.includes(term));
  card.hidden=!show;if(show)count++;}
 document.getElementById('results').textContent=count+' '+(count===1?'project':'projects')+' shown';
 document.getElementById('empty').hidden=count>0;
 let tried=0,back=0;for(const id in trail){if(trail[id].t)tried++;if(trail[id].b)back++;}
 if(trailLine)trailLine.textContent='My Trail — tried '+tried+' · saved '+back+' · kept only in this browser, never sent anywhere.';
}
search.addEventListener('input',update);
for(const b of buttons)b.addEventListener('click',()=>{topic=b.dataset.filter;for(const o of buttons)o.setAttribute('aria-pressed',String(o===b));update();});
const obuttons=[...document.querySelectorAll('[data-offline-filter]')];
for(const b of obuttons)b.addEventListener('click',()=>{offline=b.dataset.offlineFilter;for(const o of obuttons)o.setAttribute('aria-pressed',String(o===b));update();});
for(const card of cards){
 const id=card.dataset.id;if(!id)continue;const m=trail[id]||{};
 for(const btn of card.querySelectorAll('[data-trail]')){
  const kind=btn.dataset.trail==='tried'?'t':'b';
  btn.setAttribute('aria-pressed',String(!!m[kind]));
  btn.addEventListener('click',()=>{
   trail[id]=trail[id]||{};trail[id][kind]=!trail[id][kind];
   if(!trail[id].t&&!trail[id].b)delete trail[id];
   btn.setAttribute('aria-pressed',String(!!(trail[id]&&trail[id][kind])));
   saveTrail();update();});
 }
}
const tf=document.getElementById('trailFilter');
if(tf)tf.addEventListener('click',()=>{trailOnly=!trailOnly;tf.setAttribute('aria-pressed',String(trailOnly));update();});
const surprise=document.getElementById('surprise');
if(surprise)surprise.addEventListener('click',()=>{
 const open=cards.map(c=>c.querySelector('a.open')).filter(Boolean);
 if(open.length)location.href=open[Math.floor(Math.random()*open.length)].getAttribute('href');
});
const prefix=document.getElementById('prefix');
if(prefix){
 const out=document.getElementById('prefixOut'),ts=document.getElementById('tSubnets'),tz=document.getElementById('tSize'),th=document.getElementById('tHosts'),note=document.getElementById('tasteNote');
 const render=()=>{const p=+prefix.value,n=p-24,subnets=Math.pow(2,n),size=Math.pow(2,32-p);
  out.textContent='/'+p;ts.textContent=subnets;tz.textContent=size;th.textContent=size-2;
  ts.nextElementSibling.textContent=n===0?'subnet — the whole block':'subnets you can carve';
  note.textContent=n===0?'At /24 the block is whole: one network, every address in it.':'Carving the /24 into /'+p+'s: '+subnets+' networks of '+size+' addresses each. The count doubled '+n+(n===1?' time':' times')+', the size halved the same — that trade is subnetting.';};
 prefix.addEventListener('input',render);render();
}
update();
})();
