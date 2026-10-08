// Temporary preview-only diagnostics; do not log credentials or Cloudinary response bodies.
const name = process.env.CLOUDINARY_CLOUD_NAME ?? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const key = process.env.CLOUDINARY_API_KEY;
const secret = process.env.CLOUDINARY_API_SECRET;
console.log('[Cloudinary credentials] FORMAT='+JSON.stringify({
  cloudNameFormat: /^[a-z0-9_-]+$/i.test(name??''),
  keyNumeric: /^[0-9]{12,20}$/.test(key??''),
  keyLength: key?.length??0,
  keyContainsWhitespace: /\\s/.test(key??''),
  secretAlphanumeric: /^[a-zA-Z0-9_-]+$/.test(secret??''),
  keyTrimmed: key === key?.trim(),
  secretTrimmed: secret === secret?.trim(),
  looksLikeUrl: /cloudinary:|http|<|>|api_key|api_secret/i.test(key??'') || /cloudinary:|http|<|>|api_key|api_secret/i.test(secret??''),
}));
if(!name || !key || !secret) {
 console.log('[Cloudinary credentials] NOT_CONFIGURED');
} else {
 try {
   const url = 'https://api.cloudinary.com/v1_1/' + encodeURIComponent(name) + '/ping';
   const controller = new AbortController();
   const timer = setTimeout(() => controller.abort(), 8000);
   const resp = await fetch(url, {
     method: 'GET',
     headers: {'Authorization':'Basic '+ Buffer.from(key+':'+secret).toString('base64')},
     signal:controller.signal,
   });
   clearTimeout(timer);
   console.log('[Cloudinary credentials] PING_HTTP_STATUS='+resp.status);
 } catch(err) {
   console.log('[Cloudinary credentials] NETWORK_OR_TIMEOUT='+(err?.name??'error'));
 }
}

// Additional READ-ONLY diagnostics with sanitized statuses; no credentials or response bodies logged.
if (name && key && secret) {
  const auth = 'Basic ' + Buffer.from(key + ':' + secret).toString('base64');
  const cloudBase = 'https://api.cloudinary.com/v1_1/' + encodeURIComponent(name);
  const classify = async (response) => {
    const data = await response.json().catch(() => ({}));
    const msg = String(data?.error?.message ?? '').toLowerCase();
    const error = msg.includes('signature') ? 'invalid_signature'
      : msg.includes('api key') || msg.includes('api_key') ? 'invalid_api_key'
      : msg.includes('authorization') || msg.includes('unauthorized') ? 'auth_rejected'
      : msg.includes('file') ? 'file_validation'
      : msg.includes('resource') ? 'resource_validation' : 'other';
    return {status:response.status, category:error};
  };
  const perform = async (label,fn) => {
    try {
      const result = await fn();
      console.log('[Cloudinary deep check] '+label+'='+JSON.stringify(await classify(result)));
    } catch (err) {
      console.log('[Cloudinary deep check] '+label+'=NETWORK_OR_TIMEOUT_'+(err?.name??'Unknown'));
    }
  };
  await perform('ADMIN_RESOURCES_BASIC',()=>fetch(cloudBase+'/resources/image?max_results=1',{headers:{Authorization:auth},signal:AbortSignal.timeout(12000)}));
  const emptyBasic = new FormData();
  await perform('UPLOAD_BASIC_MISSING_FILE',()=>fetch(cloudBase+'/image/upload',{method:'POST',headers:{Authorization:auth},body:emptyBasic,signal:AbortSignal.timeout(12000)}));
  const {createHash}=await import('node:crypto');
  const stamp = Math.floor(Date.now()/1000).toString();
  const signed = new FormData();
  signed.append('api_key',key);
  signed.append('timestamp',stamp);
  signed.append('signature',createHash('sha1').update('timestamp='+stamp+secret).digest('hex'));
  // Intentionally do not send a file: this verifies signature/authentication without creating any asset.
  await perform('UPLOAD_SHA1_MISSING_FILE',()=>fetch(cloudBase+'/image/upload',{method:'POST',body:signed,signal:AbortSignal.timeout(12000)}));
}
