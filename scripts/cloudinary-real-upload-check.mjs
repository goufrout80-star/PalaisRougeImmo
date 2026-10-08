// Isolated, one-time preview-only validation of actual Cloudinary upload and cleanup.
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const cloudinary=require('cloudinary').v2;
const name=process.env.CLOUDINARY_CLOUD_NAME??process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const key=process.env.CLOUDINARY_API_KEY;
const secret=process.env.CLOUDINARY_API_SECRET;
if(!name||!key||!secret) {
  console.log('[Cloudinary upload test] NOT_CONFIGURED');
  process.exit(1);
}
cloudinary.config({cloud_name:name,api_key:key,api_secret:secret,secure:true});
const tinyPng='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l/wAAAAASUVORK5CYII=';
let id=null;
try {
  const uploaded=await cloudinary.uploader.upload(tinyPng,{
    folder:'kamarimmob/diagnostics',
    public_id:'test_'+Date.now(),
    resource_type:'image',
    transformation:[{quality:'auto:good'},{fetch_format:'auto'}],
  });
  id=uploaded.public_id;
  console.log('[Cloudinary upload test] UPLOAD_OK='+Boolean(uploaded.secure_url&&id&&uploaded.resource_type==='image'));
} catch(err) {
  console.log('[Cloudinary upload test] UPLOAD_FAILED_HTTP='+(err?.http_code??'unknown')+' CODE='+(err?.name??'Error'));
  process.exitCode=1;
} finally {
  if(id){
    try {
      const deleted=await cloudinary.uploader.destroy(id,{resource_type:'image'});
      console.log('[Cloudinary upload test] CLEANUP='+String(deleted?.result??'unknown'));
      if(deleted?.result!=='ok')process.exitCode=1;
    }catch(err){
      console.log('[Cloudinary upload test] CLEANUP_FAILED_HTTP='+(err?.http_code??'unknown'));
      process.exitCode=1;
    }
  }
}
