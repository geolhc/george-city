import test from 'node:test'
import assert from 'node:assert/strict'
import {decode,fresh,start} from '../src/game'
import {cityRewards,cityXP,recordCompletion} from '../src/progression'
import {duration,makeChart,SyncRun} from '../src/activities/sync-score'

test('legacy saves retain their missions, cars, outfits and discoveries',()=>{
 const {city,...legacy}=fresh()
 legacy.credits=150
 legacy.records[3]=23
 legacy.outfit=4
 legacy.discovered=['landmark-0']
 start({...legacy,city},0)
 legacy.active={id:0,stage:1,elapsed:8,wires:[0,2,0]}
 assert.deepEqual(decode(JSON.stringify(legacy)),{...legacy,city})
 assert.equal(decode(JSON.stringify({...legacy,city:{stamps:[],records:{sync:{runs:0,best:200}}}})),null)
})

test('activity completion counts attempts and awards a collectible once',()=>{
 const {city}=fresh()
 assert.deepEqual(recordCompletion(city,'sync',400),{personalBest:true,reward:undefined})
 assert.equal(recordCompletion(city,'sync',1600).reward,'共振晶片')
 assert.equal(recordCompletion(city,'sync',2100).reward,undefined)
 assert.equal(recordCompletion(city,'sync',10).personalBest,false)
 assert.deepEqual(city.records.sync,{runs:4,best:2100})
 assert.deepEqual(cityRewards(city),['sync'])
 assert.equal(cityXP(city),60)
})

test('NOVA SYNC progresses through distinct phrases and scores precise hits',()=>{
 const notes=makeChart()
 const run=new SyncRun()
 for(const note of notes)run.strike(note.lane,note.time)
 run.expire(duration)
 assert.equal(run.hits,notes.length)
 assert.equal(run.longest,notes.length)
 assert.ok(run.score>1600)
 assert.ok(notes[0].window>notes.at(-1)!.window)
 assert.equal(new Set(notes.map(note=>note.lane)).size,4)

 const errors=new SyncRun()
 const first=notes[0]
 errors.strike(first.lane,first.time+first.window)
 assert.equal(errors.score,60)
 errors.strike(first.lane,first.time+first.window)
 assert.equal(errors.hits,1)
 assert.equal(errors.streak,0)
 errors.expire(duration)
 assert.equal(errors.score,0)
})

test('City Scan uncovers nearby signals once and preserves authored clues',async()=>{
 const {scanAt}=await import('../src/exploration')
 const {discoveries,venues}=await import('../src/city-content')
 const {city}=fresh()
 const scan=scanAt(venues.sync,city.stamps)
 assert.equal(scan.earned[0].id,'playverse')
 assert.equal(scanAt(venues.sync,city.stamps).earned.length,0)
 assert.equal(cityXP(city),15)
 for(const site of discoveries)scanAt(site,city.stamps)
 assert.equal(city.stamps.length,8)
})

test('café orders reject incorrect selections, advance on timeout and score successful service',async()=>{
 const {CafeRun,serviceBreak,ticketTime}=await import('../src/activities/cafe-score')
 const shift=new CafeRun(0)
 assert.notEqual(shift.order.guest,new CafeRun(1).order.guest)
 assert.equal(shift.deliver('bun','lemon-tea',200),'wrong')
 assert.equal(shift.deliver('toast','milk-tea',300),'served')
 assert.equal(shift.deliver('toast','milk-tea',400),undefined)
 let time=300+serviceBreak
 assert.equal(shift.update(time),'order')
 time+=ticketTime
 assert.equal(shift.update(time),'late')
 time+=serviceBreak
 assert.equal(shift.update(time),'order')
 for(let i=2;i<5;i++){
  assert.equal(shift.deliver(shift.order.dish,shift.order.drink,time),'served')
  time+=serviceBreak
  assert.equal(shift.update(time),i===4?'finished':'order')
 }
 assert.equal(shift.served,4)
 assert.ok(shift.score>=300)
 assert.ok(shift.done)
})

test('City Pulse coexists with a commission, persists stages and replays with a fixed award',async()=>{
 const {startPulse,advancePulse,targetFrequency}=await import('../src/pulse')
 const {pulseRoutes}=await import('../src/city-content')
 const state=fresh()
 start(state,0)
 for(const id of ['delivery','energy'] as const){
  const {start,stops}=pulseRoutes[id]
  for(let run=0;run<2;run++){
   assert.equal(startPulse(state.city,id,{x:0,z:0}),false)
   assert.equal(startPulse(state.city,id,start),true)
   assert.equal(advancePulse(state.city,start),'none')
   stops.forEach((point,index)=>{
    const restored=decode(JSON.stringify(state))!
    assert.equal(restored.active?.id,0)
    assert.equal(restored.city.pulse?.stage,index)
    const frequency=targetFrequency(restored.city)
    if(id==='energy')assert.equal(advancePulse(restored.city,point,(frequency+1)%3),'mismatch')
    assert.equal(advancePulse(restored.city,point,frequency),index===stops.length-1?'finish':'next')
    Object.assign(state,restored)
   })
   const completion=recordCompletion(state.city,id,1)
   assert.equal(!!completion.reward,run===0)
  }
 }
 assert.equal(cityXP(state.city),75)
})

test('resident schedules stay walkable and continuous across the district day',async()=>{
 const {npcAt}=await import('../src/game')
 const {clear,distance}=await import('../src/world')
 for(let citizen=0;citizen<4;citizen++){
  const places=new Set<number>()
  let walked=false
  for(let time=0;time<720;time++){
   const at=npcAt(citizen,time)
   assert.ok(clear(at.x,at.z))
   assert.ok(distance(at,npcAt(citizen,time+1))<=1.251)
   if(at.walking)walked=true
   else places.add(at.z)
  }
  assert.ok(walked)
  assert.ok(places.size>=3)
 }
})
