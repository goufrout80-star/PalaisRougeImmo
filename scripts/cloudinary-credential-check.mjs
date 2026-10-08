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
