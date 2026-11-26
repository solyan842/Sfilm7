import { catalog } from './catalog.mjs';
import { VIDEO_ID, fetchChannelVideos, cleanTitle, videoTime } from './youtube.mjs';
export const VERSION='0.1.0';
export const ADDON_ID='com.solyan.sfilm7';
const GROUPS=[{id:'sfilm7-phim',group:'phim',name:'SFilm7 · Phim truyện'},{id:'sfilm7-hoat-hinh',group:'hh',name:'SFilm7 · Hoạt hình'}];
const CHUNK=8,CACHE_TTL=7200,MAX_ITEMS=40;
const CORS={'access-control-allow-origin':'*','access-control-allow-methods':'GET,HEAD,OPTIONS','access-control-allow-headers':'*'};
export const manifest={
  id:ADDON_ID,version:VERSION,name:'SFilm7 · Cinema AI',
  description:'Danh mục phim và hoạt hình từ các kênh YouTube công khai của Cinema AI.',
  resources:['catalog','meta','stream'],types:['movie'],idPrefixes:['sfilm7:'],
  catalogs:GROUPS.map(g=>({type:'movie',id:g.id,name:g.name,extra:[
    {name:'search',isRequired:false},
    {name:'genre',isRequired:false,options:catalog.genres.filter(x=>x.group===g.group).map(x=>x.name)},
    {name:'skip',isRequired:false}
  ]})),behaviorHints:{adult:false}
};
function json(body,status=200,extra={}){
  return new Response(JSON.stringify(body),{status,headers:{...CORS,'content-type':'application/json; charset=utf-8','cache-control':'no-store',...extra}});
}
function dec(s){try{return decodeURIComponent(s);}catch{return s;}}
export function parseId(raw){
  const v=dec(String(raw||''));if(!v.startsWith('sfilm7:'))return null;
  return VIDEO_ID.test(v.slice(7))?v.slice(7):null;
}
export function genresFor(item,channel){
  const lower=String(item.t||'').toLocaleLowerCase('vi'),group=channel.group||'phim';
  const options=catalog.genres.filter(g=>g.group===group);
  const selected=options.filter(g=>g.keywords.some(k=>lower.includes(k.toLocaleLowerCase('vi')))).map(g=>g.name);
  if(!selected.length&&channel.genre){const d=options.find(g=>g.id===channel.genre);if(d)selected.push(d.name);}
  return selected;
}
export function toMeta(item,channel){
  const thumb='https://i.ytimg.com/vi/'+item.id+'/hqdefault.jpg';
  return {id:'sfilm7:'+item.id,type:'movie',name:cleanTitle(item.t,channel.name),
    poster:thumb,background:thumb,description:'Kênh YouTube: '+channel.name,
    genres:genresFor(item,channel),releaseInfo:channel.name,
    _sort:videoTime(item)};
}
function cacheOf(ctx){try{return ctx?.cache||globalThis.caches?.default||null;}catch{return null;}}
async function oneChannel(ch,ctx){
  const cache=cacheOf(ctx),key=new Request('https://sfilm7.cache.invalid/channel/'+encodeURIComponent(ch.id));
  if(cache)try{
    const hit=await cache.match(key);
    if(hit?.ok){const payload=await hit.json();if(Array.isArray(payload?.videos)&&payload.videos.length)return payload.videos;}
  }catch{}
  const result=await fetchChannelVideos(ch.id,ctx?.fetchImpl||fetch,{timeoutMs:ctx?.timeoutMs??8500});
  if(cache&&result.videos.length)try{
    const p=cache.put(key,json({videos:result.videos},200,{'cache-control':'public, max-age='+CACHE_TTL}));
    if(ctx?.waitUntil)ctx.waitUntil(p);else await p;
  }catch{}
  return result.videos;
}
export async function mapConcurrent(items,n,fn){
  const out=new Array(items.length);let cursor=0;
  await Promise.all(Array.from({length:Math.min(items.length,n)},async()=>{
    while(cursor<items.length){
      const i=cursor++;try{out[i]=await fn(items[i],i);}catch(e){out[i]={error:String(e?.message||e)};}
    }
  }));
  return out;
}
function extras(path,query){
  const p=new URLSearchParams(query);
  for(const part of String(path||'').split('&')){
    const i=part.indexOf('=');if(i!==-1)p.set(dec(part.slice(0,i)),dec(part.slice(i+1)));
  }
  return p;
}
async function browse(url,category,catId,extra,ctx){
  const group=GROUPS.find(g=>g.id===catId);
  if(category!=='movie'||!group)return json({metas:[]});
  const params=extras(extra,url.searchParams);
  const search=String(params.get('search')||'').toLocaleLowerCase('vi').trim().slice(0,100);
  const genre=String(params.get('genre')||'').toLocaleLowerCase('vi').trim();
  const val=Number(params.get('skip')||0);
  const skip=Number.isInteger(val)?Math.max(0,Math.min(10000,val)):0;
  const selected=catalog.channels.filter(c=>c.group===group.group);
  const fetched=await mapConcurrent(selected,CHUNK,ch=>oneChannel(ch,ctx));
  const metas=[],seen=new Set();let success=0;
  for(let i=0;i<fetched.length;i++){
    const videos=fetched[i];if(!Array.isArray(videos))continue;success++;
    for(const item of videos){
      if(!VIDEO_ID.test(item.id)||seen.has(item.id))continue;seen.add(item.id);
      const m=toMeta(item,selected[i]);
      if(search&&!String(m.name+' '+selected[i].name).toLocaleLowerCase('vi').includes(search))continue;
      if(genre&&!m.genres.some(g=>g.toLocaleLowerCase('vi')===genre))continue;
      metas.push(m);
    }
  }
  if(!success)return json({error:'youtube_catalog_unavailable',retryable:true,channels:selected.length},503);
  metas.sort((a,b)=>(Number.isFinite(b._sort)?b._sort:0)-(Number.isFinite(a._sort)?a._sort:0));
  return json({metas:metas.slice(skip,skip+MAX_ITEMS).map(({_sort,...meta})=>meta)},200,{
    'cache-control':'public, max-age=120','x-sfilm7-channel-count':String(success)
  });
}
async function detail(raw,ctx){
  const id=parseId(raw);if(!id)return json({meta:{}},404);
  let name='YouTube · '+id,author='Cinema AI',poster='https://i.ytimg.com/vi/'+id+'/hqdefault.jpg';
  try{
    const u=new URL('https://www.youtube.com/oembed');u.searchParams.set('url','https://www.youtube.com/watch?v='+id);u.searchParams.set('format','json');
    const r=await (ctx?.fetchImpl||fetch)(u,{signal:AbortSignal.timeout(7000)});
    if(r.ok){const data=await r.json();name=String(data.title||name);author=String(data.author_name||author);
      if(String(data.thumbnail_url||'').startsWith('https://'))poster=data.thumbnail_url;}
  }catch{}
  return json({meta:{id:'sfilm7:'+id,name,type:'movie',poster,background:poster,
    description:'Video YouTube · '+author,releaseInfo:author}},200,{'cache-control':'public, max-age=300'});
}
export function streamRoute(raw){
  const id=parseId(raw);
  // ytId is supported by Nuvio TV #3693 and Nuvio Mobile #2115.
  // A YouTube watch URL is NOT a direct video/HLS URL.
  return json({streams:id?[{name:'SFilm7 · YouTube',title:'YouTube · Phát chính thức',ytId:id}]:[]});
}
export async function route(request,env={},ctx={}){
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:CORS});
  const url=new URL(request.url),path=url.pathname;
  if(path==='/'||path==='/manifest.json')return json(manifest,200,{'cache-control':'public, max-age=600'});
  if(path==='/health')return json({ok:true,name:'SFilm7',version:VERSION,
    channels:catalog.channels.length,genres:catalog.genres.length,source:'youtube-channel-html-atom-fallback',
    playback:'ytId',cron:false});
  const cat=path.match(/^\/catalog\/(movie|series)\/(sfilm7-[^/.]+)(?:\/(.+))?\.json$/);
  if(cat)return browse(url,cat[1],cat[2],cat[3]||'',ctx);
  const meta=path.match(/^\/meta\/(movie|series)\/(.+)\.json$/);
  if(meta)return detail(meta[2],ctx);
  const stream=path.match(/^\/stream\/(movie|series)\/(.+)\.json$/);
  if(stream)return streamRoute(stream[2]);
  return json({error:'not_found'},404);
}
export default {fetch(request,env,ctx){
  return route(request,env,ctx).catch(e=>json({error:'sfilm7_error',message:String(e?.message||e)},502));
}};
