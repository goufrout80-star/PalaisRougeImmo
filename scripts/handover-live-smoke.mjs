// Read-only check of the live Kamar Immob route permissions after handover fix.
const root='https://kamarimmob.com';
const checks=[
 ['public agents','/agents',200],
 ['public home','/',200],
 ['public listings','/properties',200],
 ['public FAQs','/faq',200],
 ['public blog','/resources',200],
 ['public valuation','/valuation',200],
 ['public contact','/contact',200],
 ['anonymous admin protection','/admin/dashboard',307],
 ['anonymous agent protection','/agent/dashboard',307],
];
let passed=0;
for(const [name,path,expected] of checks){
 try{
  const resp=await fetch(root+path,{redirect:'manual',signal:AbortSignal.timeout(15000)});
  const ok=resp.status===expected;
  console.log('[Handover routes] '+name+' status='+resp.status+' '+(ok?'PASS':'FAIL (expected '+expected+')'));
  if(ok)passed++;
 }catch(err){console.log('[Handover routes] '+name+' ERROR '+(err?.name??'Unknown'))}
}
console.log('[Handover routes] SUMMARY='+passed+'/'+checks.length);
if(passed!==checks.length)process.exitCode=1;
