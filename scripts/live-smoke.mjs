const base=process.env.BASE;
if(!base)throw Error('BASE missing');
async function get(path,timeout=40000){
  const r=await fetch(base+path,{signal:AbortSignal.timeout(timeout),cache:'no-store'});
  let data=null;try{data=await r.json()}catch{}
  return {r,data};
}
const health=await get('/health');
if(!health.r.ok||health.data?.version!=='0.1.0')throw Error('SFilm7 health mismatch');
console.log('SFILM7_HEALTH_PASS',health.data.version);
const manifest=await get('/manifest.json');
if(!manifest.r.ok||manifest.data?.id!=='com.solyan.sfilm7')throw Error('Manifest mismatch');
console.log('SFILM7_MANIFEST_PASS');
let videoId=null;
for(const id of ['sfilm7-phim','sfilm7-hoat-hinh']){
  const res=await get('/catalog/movie/'+id+'.json?live='+Date.now(),100000);
  const metas=res.data?.metas||[];
  console.log('SFILM7_CATALOG',JSON.stringify({id,status:res.r.status,count:metas.length}));
  if(!res.r.ok||!metas.length)throw Error('SFilm7 catalog unavailable '+id);
  videoId=metas[0].id;
}
const stream=await get('/stream/movie/'+encodeURIComponent(videoId)+'.json');
const ytId=stream.data?.streams?.[0]?.ytId;
console.log('SFILM7_STREAM',JSON.stringify({status:stream.r.status,ytId}));
if(!stream.r.ok||!ytId||!/^[-_A-Za-z0-9]{11}$/.test(ytId))throw Error('SFilm7 ytId stream invalid');
const meta=await get('/meta/movie/'+encodeURIComponent(videoId)+'.json');
if(!meta.r.ok||meta.data?.meta?.id!==videoId)throw Error('SFilm7 metadata invalid');
console.log('SFILM7_CATALOG_META_YTID_PASS');
