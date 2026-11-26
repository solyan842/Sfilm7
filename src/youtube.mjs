// SFilm7 — public YouTube channel metadata only; no media extraction.
export const VIDEO_ID=/^[a-zA-Z0-9_-]{11}$/;
export const CHANNEL_ID=/^UC[a-zA-Z0-9_-]{22}$/;
export function decodeEntities(s=''){
  return String(s).replace(/&(#x[0-9a-f]+|#[0-9]+|amp|lt|gt|quot|apos);/gi,(_,e)=>{
    if(e[0]==='#'){const n=e[1]?.toLowerCase()==='x'?parseInt(e.slice(2),16):parseInt(e.slice(1),10);return n>0&&n<=0x10ffff?String.fromCodePoint(n):'';}
    return {amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"}[e]||'';
  });
}
export function textOf(node){
  if(!node)return '';if(typeof node==='string')return node;
  return node.simpleText||(Array.isArray(node.runs)?node.runs.map(x=>x.text||'').join(''):'');
}
export function cleanTitle(raw,channelName=''){
  const parts=String(raw||'').split('|').map(x=>x.trim()).filter(x=>x&&!x.toLowerCase().includes('vietsub')&&x.toLowerCase()!==channelName.toLowerCase());
  return parts.join(' · ').trim()||String(raw||'').trim();
}
export function parseInitialData(html){
  const m=/(?:var\s+ytInitialData\s*=|window\[\s*["']ytInitialData["']\s*\]\s*=|ytInitialData\s*=)\s*/.exec(html);
  if(!m)return null;
  const start=html.indexOf('{',m.index+m[0].length);
  if(start<0||start-(m.index+m[0].length)>80)return null;
  let depth=0,quoted=false,escaped=false;
  for(let i=start;i<html.length;i++){
    const c=html[i];
    if(quoted){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;continue;}
    if(c==='"')quoted=true;
    else if(c==='{')depth++;
    else if(c==='}'&&--depth===0){try{return JSON.parse(html.slice(start,i+1));}catch{return null;}}
  }
  return null;
}
export function extractVideoRenderers(tree,limit=120){
  const out=[],seen=new Set(),stack=[tree];let count=0;
  while(stack.length&&out.length<limit&&count++<200000){
    const v=stack.pop();if(!v||typeof v!=='object')continue;
    const x=v.videoRenderer||v.gridVideoRenderer||v.reelItemRenderer;
    if(x&&VIDEO_ID.test(x.videoId||'')&&!seen.has(x.videoId)){
      const title=textOf(x.title)||textOf(x.headline);
      if(title){seen.add(x.videoId);out.push({id:x.videoId,t:decodeEntities(title),len:textOf(x.lengthText),views:textOf(x.viewCountText),ago:textOf(x.publishedTimeText),published:''});}
    }
    if(Array.isArray(v))for(let i=v.length-1;i>=0;i--)stack.push(v[i]);
    else for(const y of Object.values(v))if(y&&typeof y==='object')stack.push(y);
  }
  return out;
}
function xmlValue(xml,name){
  const re=new RegExp('<'+name+'(?:\\s[^>]*)?>([\\s\\S]*?)<\\/'+name+'>','i');
  const m=String(xml).match(re);return m?decodeEntities(m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1')):'';
}
export function parseAtomFeed(xml,limit=50){
  const out=[],seen=new Set();
  for(const m of String(xml).matchAll(/<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/g)){
    const raw=m[1],id=xmlValue(raw,'yt:videoId');
    if(!VIDEO_ID.test(id)||seen.has(id))continue;
    const title=xmlValue(raw,'title')||xmlValue(raw,'media:title');if(!title)continue;
    seen.add(id);out.push({id,t:title,published:xmlValue(raw,'published'),len:'',views:'',ago:''});if(out.length>=limit)break;
  }
  return out;
}
export function videoTime(x){
  const date=Date.parse(x.published||'');if(Number.isFinite(date))return date;
  const m=String(x.ago||'').match(/(\d+)\s*(phút|giờ|ngày|tuần|tháng|năm|minute|hour|day|week|month|year)/i);
  if(!m)return 0;
  const unit={phút:1,giờ:60,ngày:1440,tuần:10080,tháng:43200,năm:525600,minute:1,hour:60,day:1440,week:10080,month:43200,year:525600}[m[2].toLowerCase()]||0;
  return Date.now()-Number(m[1])*unit*60000;
}
async function readText(fetchImpl,url,timeoutMs){
  const r=await fetchImpl(url,{headers:{accept:'text/html,application/atom+xml,application/xml,*/*'},signal:AbortSignal.timeout(timeoutMs),redirect:'follow'});
  if(!r.ok)throw Error('youtube_http_'+r.status);return r.text();
}
export async function fetchChannelVideos(id,fetchImpl=fetch,options={}){
  if(!CHANNEL_ID.test(id))throw Error('invalid_channel_id');
  const timeout=options.timeoutMs??8500;
  let firstError;
  try{
    const html=await readText(fetchImpl,'https://www.youtube.com/channel/'+id+'/videos?hl=vi&gl=VN',timeout);
    const json=parseInitialData(html),videos=json?extractVideoRenderers(json):[];
    if(videos.length)return {videos,source:'youtube_channel_html'};
    firstError=Error('youtube_initial_data_empty');
  }catch(e){firstError=e;}
  try{
    const xml=await readText(fetchImpl,'https://www.youtube.com/feeds/videos.xml?channel_id='+id,timeout);
    const videos=parseAtomFeed(xml);if(videos.length)return {videos,source:'youtube_atom_feed'};
    throw Error('youtube_feed_empty');
  }catch(e){throw Error('youtube_channel_unavailable: '+String(firstError?.message||firstError)+' / '+String(e?.message||e));}
}
