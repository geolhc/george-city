import test from 'node:test'
import assert from 'node:assert/strict'
import {step,clear,cameraDistance} from '../src/world'
test('walk, sprint, camera wall clearance and sliding',()=>{
 const p={x:0,z:0,heading:0,speed:0,driving:false}
 for(let i=0;i<60;i++)step(p,{side:0,forward:1,sprint:false},0,1/60)
 assert.ok(Math.abs(p.z-4.5)<.001)
 p.x=-10;p.z=0
 assert.ok(cameraDistance(p,Math.PI/2,7,false)<1.1)
 for(let i=0;i<30;i++)step(p,{side:-1,forward:1,sprint:true},0,1/60)
 assert.ok(clear(p.x,p.z)&&p.x>=-10.55&&p.z>2)
})
