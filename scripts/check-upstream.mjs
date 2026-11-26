import { catalog } from '../src/catalog.mjs';
import { fetchChannelVideos } from '../src/youtube.mjs';
const selected=[catalog.channels.find(c=>c.group==='phim'),catalog.channels.find(c=>c.group==='hh')];
let passed=0;
for(const c of selected){
  try{const r=await fetchChannelVideos(c.id,fetch,{timeoutMs:10000});console.log('SFILM7_YOUTUBE_PROBE',JSON.stringify({group:c.group,channel:c.id,source:r.source,count:r.videos.length,status:'PASS'}));if(r.videos.length)passed++;}
  catch(e){console.log('SFILM7_YOUTUBE_PROBE',JSON.stringify({group:c.group,channel:c.id,status:'FAIL',reason:String(e?.message||e)}));}
}
if(passed!==selected.length)process.exitCode=1;
