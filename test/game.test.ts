import test from 'node:test'
import assert from 'node:assert/strict'
import {fresh,start,advance,restore,dismount,authored,npcAt} from '../src/game'
import {sites,rewards,step,clear} from '../src/world'
test('all five objectives, save at every stage, fixed first-clear rewards and replay records',()=>{
 let s=fresh()
 for(let round=0;round<2;round++)for(let id=0;id<5;id++){
  assert.ok(start(s,id));assert.ok(!start(s,id))
  while(s.active){
   const a=s.active;Object.assign(s.player,sites[id][a.stage]);a.elapsed+=2
   if(id===2){assert.equal(advance(s),'none');a.wires=[1,1,1]}
   s=restore(JSON.stringify(s));assert.notEqual(advance(s),'none')
  }
 }
 assert.equal(s.credits,rewards.reduce((a,b)=>a+b))
 assert.equal(s.discovered.length,3);assert.equal(Object.keys(s.records).length,5)
})
test('arcade handling, track barrier, safe exit and remembered dialogue',()=>{
 const s=fresh();s.player.driving=true
 for(let i=0;i<60;i++)step(s.player,{side:.4,forward:1,sprint:false},0,1/60)
 assert.ok(s.player.speed>10&&s.player.heading>.1);assert.ok(dismount(s));assert.ok(clear(s.player.x,s.player.z))
 assert.ok(!clear(80,0,1,true));assert.notEqual(authored.reply(s,0),authored.reply(s,0))
 assert.deepEqual(npcAt(1,130),npcAt(1,130));assert.equal(restore('broken').credits,0)
})
