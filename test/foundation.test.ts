import test from 'node:test'
import assert from 'node:assert/strict'
import {decode,fresh,start,boostedVehicle} from '../src/game'
import {SimulationClock} from '../src/runtime'
import {load,persist,saveKey} from '../src/storage'
import {step} from '../src/world'
test('reject malformed nested saves and retain valid V0.1 saves',()=>{
 assert.ok(decode(JSON.stringify(fresh())))
 for(const mutate of [(s:any)=>s.records={0:'bad'},(s:any)=>delete s.player.speed,(s:any)=>s.cars=[null,null],(s:any)=>s.ride=8]){
  const s=fresh();mutate(s);assert.equal(decode(JSON.stringify(s)),null)
 }
})
test('recover backup and protect future versions',()=>{
 const values=new Map<string,string>(),store={getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>{values.set(k,v)}}
 const s=fresh();s.credits=80;persist(store,s);s.credits=100;persist(store,s)
 values.set(saveKey,'broken');assert.equal(load(store).state.credits,80)
 values.set(saveKey,JSON.stringify({version:2}));assert.equal(load(store).writable,false)
})
test('fixed steps preserve elapsed time at 10, 30 and 60 FPS and bound stalls',()=>{
 for(const fps of [10,30,60]){
  const clock=new SimulationClock();let elapsed=0
  for(let i=0;i<fps;i++)clock.advance(1/fps,dt=>elapsed+=dt)
  assert.ok(Math.abs(elapsed-1)<1e-8)
 }
 const clock=new SimulationClock();let steps=0;clock.advance(10,()=>steps++);assert.equal(steps,15)
})
test('mixed driving devices cannot exceed normal input',()=>{
 const a=fresh().player,b=fresh().player;a.driving=b.driving=true
 for(let i=0;i<60;i++){step(a,{forward:2,side:2,sprint:false},0,1/60);step(b,{forward:1,side:1,sprint:false},0,1/60)}
 assert.deepEqual(a,b)
})

test('race configuration is independent of previous street vehicle',()=>{
 for(const ride of [0,1]){
  const s=fresh();s.ride=ride;assert.ok(start(s,3))
  assert.equal(boostedVehicle(s),true);assert.equal(s.ride,ride)
 }
})
