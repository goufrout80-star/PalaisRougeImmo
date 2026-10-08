// One-off production HTTP smoke tests from Vercel build network.
// No secrets, account sessions, image files, or persistent test source files used.
const root='https://kamarimmob.com';
const marker='kamar-handover-audit-20261008-v1';
const cases=[];
async function check(label,path,options={},allowed=[200]) {
  try {
    const response=await fetch(root+path,{...options,redirect:'manual',signal:AbortSignal.timeout(15000)});
    const passed=allowed.includes(response.status);
    cases.push({name:label,status:response.status,passed});
  } catch(err) {cases.push({name:label,status:'NET_'+(err?.name??'ERROR'),passed:false})}
}
for(const page of ['/', '/login','/properties','/contact','/valuation','/resources','/faq','/agents','/sell','/calculator'])
  await check('GET '+page,page,{},[200,301,302,307,308]);
const json=x=>({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(x)});
await check('POST contact invalid','/api/contact',json({name:'',message:''}),[400]);
await check('POST valuation invalid','/api/valuation',json({name:''}),[400]);
await check('POST newsletter invalid','/api/newsletter',json({email:'bad'}),[400]);
await check('POST admin unauthorized','/api/admin/mutations',json({action:'insert',table:'faq_items',data:{}}),[401]);
await check('POST blog unauthorized','/api/admin/blog',json({title_fr:'blocked'}),[401]);
await check('POST property unauthorized','/api/properties',json({title_fr:'blocked'}),[401]);
await check('POST upload unauthorized','/api/upload',{method:'POST'},[401]);
await check('GET agents unauthorized','/api/admin/agents',{},[401]);
await check('POST contact valid','/api/contact',json({name:'Kamar QA',email:marker+'-contact@example.invalid',message:marker}),[200]);
await check('POST valuation valid','/api/valuation',json({name:'Kamar QA',email:marker+'-valuation@example.invalid',property_type:'villa',location:'Marrakech',area_sqm:110,message:marker}),[200]);
await check('POST newsletter valid','/api/newsletter',json({email:marker+'-newsletter@example.invalid'}),[200]);
const passed=cases.filter(c=>c.passed).length;
for(const x of cases)console.log('[Handover smoke] '+x.name+' status='+x.status+' '+(x.passed?'PASS':'FAIL'));
console.log('[Handover smoke] SUMMARY='+passed+'/'+cases.length);
if(passed!==cases.length)process.exitCode=1;
