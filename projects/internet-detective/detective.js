"use strict";
function inspect(raw){if(!raw.trim()||raw.length>4096)throw Error("Enter a URL of at most 4096 characters.");const u=new URL(raw);if(!["http:","https:"].includes(u.protocol))throw Error("Only full http:// or https:// URLs are supported.");return {protocol:u.protocol,hostname:u.hostname,port:u.port,credentials:!!(u.username||u.password),encodedHost:u.hostname.includes("xn--"),ip:/^(?:\d{1,3}\.){3}\d{1,3}$/.test(u.hostname)||u.hostname.startsWith("[")};}
if(typeof module!=="undefined")module.exports={inspect};
if(typeof document!=="undefined"){
const $=id=>document.getElementById(id);
const cases=[
["Recovery Desk: We located your lost funds. Pay a $350 release fee today. We know the amount you lost, so you can trust us.","The upfront fee, urgency, and promised recovery are warning signs. Knowing your loss details does not prove identity. Do not pay; verify any claimed agency independently and consult the FTC recovery-scam guide."],
["Parcel Team: Your delivery is on hold. Enter your card at https://parcel.example.evil.test to pay $1.20.","The small fee invites a card disclosure. The hostname is parcel.example.evil.test, not parcel.example. Check your order through the retailer or carrier's independently opened official site."],
["New employer: Deposit this check, buy equipment, and send the leftover money to our supplier immediately.","A check can appear available before the bank discovers it is fake. Sending money onward can leave you owing the bank. Verify the employer and consult the FTC fake-check guidance."],
["Wonder Bargains: A new console for $29. Hurry! Gift-card payments only. Thousands of five-star reviews!","Price, urgency, and payment restrictions deserve scrutiny. Reviews can be fabricated. Verify seller details and payment protections independently; a registered domain alone does not establish trust."],
["A familiar-sounding caller: It's me! Emergency. Send money now and don't tell anyone.","A familiar voice alone does not verify identity. End the call and reach that person through a known number, or check with another trusted contact. Urgency and secrecy interrupt ordinary verification."],
["Library notice: A book may be due. Check your account through your usual library app. No payment link is included.","This message offers a sensible independent route. Open your usual library app or call its known number. You cannot authenticate the sender from this text alone, but you can verify the claim safely."]];
function load(){ $('message').textContent=cases[Number($('case').value)][0];$('case-result').textContent='';$('case-form').reset();}
$('case').addEventListener('change',load);load();
$('case-form').addEventListener('submit',e=>{e.preventDefault();const choice=new FormData(e.target).get('action');$('case-result').textContent=(choice==='verify'?'Good next step. ':choice==='reply'?'The sender can simply claim to be legitimate. ':'Pause before acting on the message. ')+cases[Number($('case').value)][1];});
$('url-form').addEventListener('submit',e=>{e.preventDefault();try{const v=inspect($('url').value);$('url-result').textContent='Actual hostname: '+v.hostname+'. Protocol: '+v.protocol+' '+(v.port?'Explicit port: '+v.port+'. ':'')+(v.credentials?'Warning: text before @ is login information, not the hostname. ':'')+(v.encodedHost?'Internationalized hostname uses xn-- encoding; compare carefully with the real address. ':'')+(v.ip?'This is an IP-address host. It does not establish identity. ':'')+'Verify the exact hostname through a trusted source. No site was visited.';}catch(err){$('url-result').textContent=err.message;}});
$('example').addEventListener('click',()=>{$('url').value='https://your-bank.example@evil.test/login';$('url-result').textContent='Press Examine locally and find which part is the hostname.';});
const tools=[
['Domain registration','https://lookup.icann.org/','Check available domain registration dates and registrar information. Some data is redacted; privacy is normal and age alone proves neither safety nor fraud.'],
['Investment professional','https://www.investor.gov/investment-professionals','Check US licensing, registration, and available disclosures. Impersonators may copy a real professional: match contact details through the official record.'],
['Scam patterns','https://consumer.ftc.gov/scams','Read FTC explanations of common scams and verification steps.'],
['Recovery promises','https://consumer.ftc.gov/articles/refund-and-recovery-scams','Recognize a second scam targeting someone who has already lost money.'],
['Already paid or shared information','https://consumer.ftc.gov/articles/what-do-if-you-were-scammed','Choose FTC next steps by payment method, information exposure, or computer access.'],
['Report fraud to FTC','https://reportfraud.ftc.gov/','Submit a US consumer fraud report. This is not an emergency service or a promise of individual recovery.'],
['Report internet crime to FBI','https://www.ic3.gov/','Report internet-enabled crime to the Internet Crime Complaint Center. Use local emergency services for immediate danger.'],
['Identity theft plan','https://www.identitytheft.gov/','Official US identity-theft reporting and recovery planning.'],
['Fake checks','https://consumer.ftc.gov/articles/how-spot-avoid-and-report-fake-check-scams','Understand why available check funds are not proof that the check is genuine.']];
function render(){const q=$('search').value.toLowerCase();$('resources').replaceChildren();let n=0;for(const [title,url,desc] of tools){if(!(title+' '+desc).toLowerCase().includes(q))continue;n++;const a=document.createElement('article'),h=document.createElement('h3'),l=document.createElement('a'),t=document.createElement('p');l.href=url;l.textContent=title;h.append(l);t.textContent=desc;a.append(h,t);$('resources').append(a);}$('count').textContent=n+' tools found. External links need internet.';}
$('search').addEventListener('input',render);render();
}
