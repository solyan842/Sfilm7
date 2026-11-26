import test from 'node:test';
import assert from 'node:assert/strict';
import { catalog } from '../src/catalog.mjs';
import { manifest,route,streamRoute,parseId,mapConcurrent } from '../src/index.mjs';
import { VIDEO_ID,CHANNEL_ID,parseInitialData,extractVideoRenderers,fetchChannelVideos,parseAtomFeed,decodeEntities } from '../src/youtube.mjs';
const a='dQw4w9WgXcQ',b='aqz-KE-bpKQ';
const url=p=>new Request('https://sfilm7.example'+p);
const html='<script>var ytInitialData = '+JSON.stringify({contents:[{richItemRenderer:{content:{videoRenderer:{videoId:a,title:{runs:[{text:'Tổng tài bí mật | Vietsub'}]},publishedTimeText:{simpleText:'1 ngày trước'}}}}},{richItemRenderer:{content:{videoRenderer:{videoId:b,title:{simpleText:'Tổng tài bất ngờ'}}}}}]})+';</script>';
const response=async input=>new Response(html,{status:200});
test('41 APK channels split exactly 24 films / 17 anime, 15 genres',()=>{
  assert.equal(catalog.channels.length,41);assert.equal(catalog.genres.length,15);
  assert.equal(catalog.channels.filter(x=>x.group==='phim').length,24);
  assert.equal(catalog.channels.filter(x=>x.group==='hh').length,17);
  for(const c of catalog.channels)assert.ok(CHANNEL_ID.test(c.id));
});
test('manifest declares Nuvio resources and two catalogs',async()=>{
  assert.deepEqual(manifest.resources,['catalog','meta','stream']);assert.equal(manifest.id,'com.solyan.sfilm7');
  const r=await route(url('/manifest.json'));assert.equal(r.status,200);assert.equal((await r.json()).catalogs.length,2);
});
test('YouTube page parser finds real video IDs',()=>{
  const data=parseInitialData(html);assert.ok(data);
  assert.deepEqual(extractVideoRenderers(data).map(x=>x.id),[a,b]);
  assert.equal(decodeEntities('&amp;'),'&');assert.ok(VIDEO_ID.test(a));
});
test('Atom fallback is used when channel page has no ytInitialData',async()=>{
  const xml='<entry><yt:videoId>'+a+'</yt:videoId><title>Film &amp; Animation</title><published>2026-11-25T00:00:00Z</published></entry>';
  assert.equal(parseAtomFeed(xml)[0].t,'Film & Animation');
  let calls=0;
  const result=await fetchChannelVideos(catalog.channels[0].id,async()=>{calls++;return new Response(calls===1?'blocked':xml,{status:200});});
  assert.equal(result.source,'youtube_atom_feed');assert.equal(calls,2);
});
test('stream uses ytId, no fake media URL',async()=>{
  const r=streamRoute('sfilm7%3A'+a),d=await r.json();
  assert.equal(d.streams[0].ytId,a);assert.equal(d.streams[0].url,undefined);
  assert.equal(parseId('sfilm7:bad'),null);
});
test('catalog search, genre and dedup work with 24 channels',async()=>{
  const ctx={fetchImpl:response};
  const full=await route(url('/catalog/movie/sfilm7-phim.json'),{},ctx);
  assert.equal(full.status,200);
  const v=(await full.json()).metas;assert.equal(v.length,2);
  assert.deepEqual(new Set(v.map(x=>x.id)),new Set(['sfilm7:'+a,'sfilm7:'+b]));
  const only=await route(url('/catalog/movie/sfilm7-phim/search=b%C3%AD%20m%E1%BA%ADt.json'),{},ctx);
  assert.equal((await only.json()).metas.length,1);
  const genre=await route(url('/catalog/movie/sfilm7-phim/genre=T%E1%BB%95ng%20t%C3%A0i.json'),{},ctx);
  assert.equal((await genre.json()).metas.length,2);
});
test('meta uses public YouTube oEmbed',async()=>{
  const r=await route(url('/meta/movie/sfilm7%3A'+a+'.json'),{}, {fetchImpl:async()=>new Response(JSON.stringify({title:'Test',author_name:'Cinema'}),{status:200})});
  assert.equal((await r.json()).meta.name,'Test');
});
test('unavailable YouTube never returns misleading empty catalog success',async()=>{
  const r=await route(url('/catalog/movie/sfilm7-phim.json'),{}, {fetchImpl:async()=>new Response('Forbidden',{status:403})});
  assert.equal(r.status,503);assert.equal((await r.json()).error,'youtube_catalog_unavailable');
});
test('bounded concurrent worker preserves valid results',async()=>{
  const r=await mapConcurrent([1,2,3],2,async x=>{if(x===2)throw Error('blocked');return x;});
  assert.equal(r[0],1);assert.match(r[1].error,/blocked/);assert.equal(r[2],3);
});
test('invalid metadata video IDs are rejected before network',async()=>{
  let calls=0;const r=await route(url('/meta/movie/sfilm7%3Ainvalid.json'),{}, {fetchImpl:async()=>{calls++;throw Error('network');}});
  assert.equal(r.status,404);assert.equal(calls,0);
});
