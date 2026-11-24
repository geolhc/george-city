import {Engine} from '@babylonjs/core/Engines/engine'
import {Scene} from '@babylonjs/core/scene'
import {Vector3,Matrix,Quaternion} from '@babylonjs/core/Maths/math.vector'
import {Color3,Color4} from '@babylonjs/core/Maths/math.color'
import {FreeCamera} from '@babylonjs/core/Cameras/freeCamera'
import {HemisphericLight} from '@babylonjs/core/Lights/hemisphericLight'
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial'
import {DynamicTexture} from '@babylonjs/core/Materials/Textures/dynamicTexture'
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder'
import {TransformNode} from '@babylonjs/core/Meshes/transformNode'
import '@babylonjs/core/Meshes/thinInstanceMesh'
import '@babylonjs/core/Materials/Textures/Loaders/tgaTextureLoader'
import {blocks, starts, sites, park, shop, garage} from './world'
export {Vector3}
const c=Color3.FromHexString
export function createView(canvas:HTMLCanvasElement){
 const engine=new Engine(canvas,true,{alpha:true,stencil:true,preserveDrawingBuffer:false},false)
 engine.setHardwareScalingLevel(Math.max(1,devicePixelRatio/1.4))
 const scene=new Scene(engine)
 scene.clearColor=new Color4(0,0,0,0)
 scene.fogMode=Scene.FOGMODE_EXP2;scene.fogDensity=.009;scene.fogColor=c('#555174')
 const camera=new FreeCamera('follow',new Vector3(0,4,-31),scene)
 camera.minZ=.08;camera.maxZ=330;camera.fov=1.02
 const light=new HemisphericLight('dusk',new Vector3(-.5,1,-.4),scene)
 light.intensity=1.05;light.diffuse=c('#efddff');light.groundColor=c('#53678c')
 const colors=new Map<string,StandardMaterial>()
 function mat(hex:string,lit=false){
  let key=hex+lit,m=colors.get(key)
  if(!m){m=new StandardMaterial(key,scene);m.diffuseColor=c(hex);m.emissiveColor=c(hex).scale(lit?.95:.15);m.specularColor=Color3.Black();colors.set(key,m)}
  return m
 }
 const ink=mat('#172338'),wall=mat('#344659'),ledge=mat('#586578'),glass=mat('#19384b'),cream=mat('#ffe0a7',true),pink=mat('#ff416f',true),mint=mat('#54f8da',true),gold=mat('#ffae56',true),violet=mat('#ab85ff',true)
 const accents=[pink,mint,gold,violet]
 type Kind='box'|'sphere'|'tube'|'ring'
 function shape(kind:Kind,name:string){
  if(kind==='sphere')return MeshBuilder.CreateSphere(name,{diameter:1,segments:10},scene)
  if(kind==='tube')return MeshBuilder.CreateCylinder(name,{height:1,diameter:1,tessellation:16},scene)
  if(kind==='ring')return MeshBuilder.CreateTorus(name,{diameter:1,thickness:.055,tessellation:48},scene)
  return MeshBuilder.CreateBox(name,{size:1},scene)
 }
 const batches=new Map<string,{kind:Kind;m:StandardMaterial;values:number[]}>()
 function staticPart(kind:Kind,x:number,y:number,z:number,w:number,h:number,d:number,m:StandardMaterial,rx=0,ry=0,rz=0){
  const key=kind+m.uniqueId
  if(!batches.has(key))batches.set(key,{kind,m,values:[]})
  const a=batches.get(key)!
  a.values.push(...Matrix.Compose(new Vector3(w,h,d),Quaternion.FromEulerAngles(rx,ry,rz),new Vector3(x,y,z)).asArray())
 }
 const box=(x:number,y:number,z:number,w:number,h:number,d:number,m:StandardMaterial)=>staticPart('box',x,y,z,w,h,d,m)
 function part(parent:TransformNode,kind:Kind,x:number,y:number,z:number,w:number,h:number,d:number,m:StandardMaterial){
  const mesh=shape(kind,'detail');mesh.material=m;mesh.parent=parent;mesh.position.set(x,y,z);mesh.scaling.set(w,h,d);return mesh
 }
 let seed=2099
 function random(){seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296}
 // One repeated window atlas per facade palette. Lit apartments share draw calls.
 function facade(i:number){
  const tx=new DynamicTexture('windows',{width:256,height:512},scene,false),g=tx.getContext()
  g.fillStyle=['#42495e','#414957','#475667'][i];g.fillRect(0,0,256,512)
  for(let row=0;row<16;row++)for(let col=0;col<6;col++){
   const x=col*42+4,y=row*32+4
   g.fillStyle='#172937';g.fillRect(x,y,34,19)
   g.fillStyle=['#546e7d','#718c98','#e1aa78','#aecac4','#cb859f'][Math.floor(random()*5)]
   g.fillRect(x+2,y+2,13,12);g.fillRect(x+18,y+2,12,12)
   g.fillStyle='#29313e';g.fillRect(x-2,y+19,38,3)
  }
  tx.update();const m=new StandardMaterial('apartments',scene);m.diffuseTexture=tx;m.emissiveTexture=tx;m.emissiveColor=new Color3(.38,.38,.38);m.specularColor=Color3.Black();return m
 }
 const facades=[0,1,2].map(facade)
 function sign(x:number,y:number,z:number,w:number,h:number,cn:string,en:string,color:string,angle=0,vertical=false){
  const tex=new DynamicTexture('enamel sign',{width:vertical?160:640,height:vertical?640:192},scene,false),g=tex.getContext() as CanvasRenderingContext2D
  const {width:W,height:H}=tex.getSize()
  g.fillStyle='#142233';g.fillRect(0,0,W,H);g.strokeStyle=color;g.lineWidth=7;g.strokeRect(8,8,W-16,H-16);g.textAlign='center';g.fillStyle=color
  g.shadowColor=color;g.shadowBlur=6
  if(vertical){g.font='bold 101px sans-serif';[...cn].forEach((v,j)=>g.fillText(v,W/2,112+j*(H-95)/cn.length))}
  else{g.font='bold 90px sans-serif';g.fillText(cn,W/2,111,W-40);g.shadowBlur=0;g.font='600 24px monospace';g.fillText(en,W/2,155,W-46)}
  tex.update();const m=new StandardMaterial('sign '+en,scene);m.diffuseTexture=tex;m.emissiveTexture=tex;m.emissiveColor=Color3.White();m.backFaceCulling=false;m.disableLighting=true
  const panel=MeshBuilder.CreatePlane(en,{width:w,height:h},scene);panel.position.set(x,y,z);panel.rotation.y=angle;panel.material=m
 }
 box(0,-.36,0,62,.65,98,mat('#32354b'))
 box(0,-.03,0,12,.08,93,mat('#263143'))
 for(let z=-44;z<46;z+=5){box(0,.025,z,.12,.018,2.6,gold);for(const side of [-1,1])box(side*5.85,.03,z,.08,.02,4.8,cream)}
 for(const z of [-25,7,31])for(let x=-5;x<=5;x+=1.4)box(x,.04,z,.72,.02,2.5,mat('#95a0a6'))
 const names=['潮汐冰室','日輪放映','電氣商行','海星唱片','銀河茶座','港灣車房','魚燈工房','月波機舖','流星麵家']
 const roman=['TIDE CAFE','SOLAR CINEMA','VOLT SUPPLY','STAR RECORDS','GALAXY TEA','HARBOUR MOTORS','LANTERN LAB','LUNAR ARCADE','METEOR NOODLES']
 blocks.forEach((b,i)=>{
  const s=Math.sign(b.x),front=b.x-s*6,accent=accents[i%4]
  box(b.x,2,b.z,12,4,12,ink);box(b.x,(b.h+4)/2,b.z,11.9,b.h-4,11.9,facades[i%3])
  box(b.x,b.h+1,b.z,9,2,9,wall);box(b.x+1,b.h+2.5,b.z-2,4,1.2,3,ledge)
  for(let y=5;y<b.h;y+=4.2)box(b.x,y,b.z,12.2,.28,12.2,ledge)
  for(const j of [-4,0,4]){
   box(front-s*.05,1.5,b.z+j,.16,2.8,3.45,glass);box(front-s*.16,2.7,b.z+j,.18,.12,3.4,cream)
   for(let k=0;k<4;k++)box(front-s*.24,1+k*.33,b.z+j,.12,.08,2.6,ledge)
   box(front-s*.7,3.35,b.z+j,1.5,.24,3.9,accent)
  }
  sign(front-s*.15,4.6,b.z,10.5,2,names[i],roman[i],['#ff7799','#66ffdc','#ffbd73','#d0abff'][i%4],s*Math.PI/2)
  const sx=front-s*1.5,sz=b.z-4;box(sx,8,sz,2,.18,.22,ledge);sign(sx,6.4,sz-.16,1.55,5.5,names[i],roman[i],'#ffbf81',0,true)
  box(front-s*.9,.16,b.z+4,.55,.32,.8,wall)
 })
 for(let i=0;i<95;i++){
  let x=(random()-.5)*200,z=(random()-.5)*200
  if(Math.abs(x)<32&&Math.abs(z)<51||x>60&&x<100&&Math.abs(z)<28)continue
  const h=12+random()*50,w=5+random()*8
  box(x,h/2,z,w,h,w,facades[i%3]);box(x,h+1,z,w*.82,2,w*.82,wall);if(i%3===0){box(x,h+4,z,.22,8,.22,ledge);box(x,h+8,z,.4,.4,.4,pink)}
 }
 // Gateway with layered cantilevered roof, a suspended bilingual sign and lamps.
 for(const z of [-12,27]){
  for(const s of [-1,1]){
   box(s*7.9,3.6,z,.65,7.2,.72,mat('#913d50'));box(s*7.9,.5,z,1,1,1,ledge)
   staticPart('box',s*6.9,6.1,z,3,.32,.56,gold,0,0,s*.48)
   staticPart('sphere',s*5.3,5.4,z,1,1.25,1,pink);box(s*5.3,4.65,z,.11,.32,.11,gold)
  }
  box(0,7.25,z,17.2,.5,1.1,ink);box(0,7.65,z,19,.26,1.5,mint);box(0,7.91,z,15,.17,1.1,wall)
  sign(0,6.6,z-.58,6.4,1.75,z<0?'月潮里':'星光碼頭',z<0?'MOONTIDE LANE':'STARLIGHT PIER','#ffd69b')
 }
 for(let z=-40;z<46;z+=10)for(const s of [-1,1]){
  box(s*6.6,2.2,z,.13,4.4,.13,ledge);box(s*6.35,4.35,z,.7,.1,.3,cream)
  box(s*7.15,.018,z,1.9,.018,2.6,mat(z%20?'#494457':'#36535b'))
 }
 // A street cinema across from the plaza. The painted sail is original key art.
 sign(8.7,3.6,21,4.8,2.2,'潮聲','MIDNIGHT SCREENING','#ffc991')
 for(const x of [6.9,10.5])box(x,1.3,21,.15,2.6,.15,wall)
 for(let z=-39;z<=40;z+=9){
  const x=z%2?7.1:-7.1
  box(x,.48,z,1.6,.19,.55,mat('#866864'));for(const leg of [-.55,.55])box(x+leg,.22,z,.13,.46,.43,ink)
 }
 // Moonwheel plaza and harbour beacon
 staticPart('tube',14,.12,0,14,.24,14,ledge)
 staticPart('ring',14,5.1,0,8,8,8,violet,Math.PI/2)
 staticPart('ring',14,5.1,.3,6.6,6.6,6.6,mint,Math.PI/2)
 for(const s of [-1,1])staticPart('box',14+s*2.8,1.8,0,.4,4,.4,cream,0,0,-s*.35)
 staticPart('tube',-8,2.3,42,1,4.6,1,wall);staticPart('sphere',-8,4.8,42,1.4,1.4,1.4,gold)
 // Isolated banked-light circuit, accessible from arcade.
 box(80,-.1,1,30,.18,42,ink)
 for(const [x,z,w,d] of [[65,1,.3,42],[95,1,.3,42],[80,-20,30,.3],[80,22,30,.3],[80,1,10,22]]){
  box(x,.45,z,w,.9,d,wall);box(x,.96,z,w+.05,.12,d+.05,mint)
 }
 for(const p of sites[3]){box(p.x-2.3,1.9,p.z,.18,3.8,.18,violet);box(p.x+2.3,1.9,p.z,.18,3.8,.18,violet);box(p.x,3.8,p.z,4.8,.15,.15,pink)}
 for(let i=0;i<starts.length;i++){
  const p=starts[i];staticPart('tube',p.x,.08,p.z,1.7,.16,1.7,wall);staticPart('ring',p.x,.18,p.z,1.6,1,1.6,accents[i%4])
 }
 for(const [p,s] of [[shop,'夜市裁縫'],[garage,'港灣車房']] as const){sign(p.x,2.7,p.z,3,1.1,s,'OPEN ALL NIGHT','#83ffe0')}
 for(const {kind,m,values} of batches.values()){
  const mesh=shape(kind,'city');mesh.material=m;mesh.thinInstanceSetBuffer('matrix',new Float32Array(values),16,true);mesh.freezeWorldMatrix()
 }
 function person(color:string){
  const root=new TransformNode('walker',scene),jacket=mat(color)
  part(root,'sphere',0,.025,0,.78,.032,.52,mat('#252c3a'))
  const torso=part(root,'box',0,1.12,0,.64,.65,.38,jacket)
  part(root,'box',0,1.18,-.22,.39,.43,.18,ink);part(root,'box',0,1.29,-.32,.27,.065,.035,mint)
  part(root,'sphere',0,1.73,0,.45,.53,.43,mat('#cd997f'));part(root,'sphere',0,1.9,-.035,.48,.32,.47,ink)
  const limbs=[-1,1].map(s=>{
   const leg=new TransformNode('hip',scene);leg.parent=root;leg.position.set(s*.16,.85,0);part(leg,'box',0,-.32,0,.22,.63,.25,ink);part(leg,'box',0,-.72,.06,.24,.17,.36,mat('#b7cbd0'))
   const arm=new TransformNode('shoulder',scene);arm.parent=root;arm.position.set(s*.38,1.38,0);part(arm,'box',0,-.19,0,.21,.4,.24,jacket);part(arm,'box',0,-.47,0,.17,.22,.18,mat('#cd997f'))
   return {leg,arm}
  })
  return {root,torso,animate(t:number,amp:number){limbs.forEach(({leg,arm},i)=>{leg.rotation.x=Math.sin(t+i*Math.PI)*amp;arm.rotation.x=-leg.rotation.x*.75});torso.position.y=1.12+Math.abs(Math.sin(t))*.04*amp}}
 }
 function vehicle(color:string){
  const root=new TransformNode('street coupe',scene),paint=mat(color)
  part(root,'box',0,.58,0,1.7,.44,3.1,paint);part(root,'sphere',0,.94,-.13,1.55,.76,2.05,glass)
  part(root,'box',0,1.27,-.18,1.07,.1,1,paint);part(root,'box',0,.65,1.57,1.47,.1,.07,mint);part(root,'box',0,.62,-1.57,1.48,.1,.07,pink)
  for(const s of [-1,1])for(const z of [-.99,.99]){const wheel=part(root,'tube',s*.82,.36,z,.61,.16,.61,ink);wheel.rotation.z=Math.PI/2;part(root,'sphere',s*.91,.36,z,.07,.29,.29,cream)}
  return root
 }
 const player=person('#db655c'),car=vehicle('#cf515e');car.position.set(park.x,0,park.z)
 const racer=vehicle('#49adac');racer.position.set(garage.x,0,garage.z)
 const markers=starts.map((p,i)=>{const node=new TransformNode('signal',scene);node.position.set(p.x,1.6,p.z);const ring=part(node,'ring',0,0,0,.8,.8,.8,accents[i%4]);ring.rotation.x=Math.PI/2;return node})
 const lanterns=sites[4].map((p,i)=>{
  const root=new TransformNode('festival lantern',scene);root.position.set(p.x,1.35,p.z)
  const shade=[gold,cream,pink,mint][i]
  part(root,'sphere',0,0,0,i===0?1:.62,i===1?.82:.58,.54,shade)
  if(i===0){const tail=part(root,'box',-.5,0,0,.3,.35,.12,gold);tail.rotation.z=.7;part(root,'sphere',.26,.1,-.23,.09,.09,.09,ink)}
  if(i===2)for(const side of [-1,1])part(root,'sphere',side*.14,.37,0,.13,.42,.15,pink)
  if(i===3)for(let j=0;j<5;j++){const ray=part(root,'box',Math.sin(j*1.257)*.28,Math.cos(j*1.257)*.28,0,.16,.39,.14,mint);ray.rotation.z=-j*1.257}
  part(root,'tube',0,-.47,0,.07,.29,.07,gold);return root
 })
 const target=new TransformNode('destination',scene);const gem=part(target,'box',0,0,0,.48,.48,.48,gold);gem.rotation.z=Math.PI/4;gem.rotation.x=.6
 const bot=new TransformNode('Ah Luk',scene);part(bot,'box',0,.57,0,.7,.63,.75,cream);part(bot,'box',0,.63,.39,.52,.19,.08,glass)
 for(const s of [-1,1])part(bot,'sphere',s*.24,.23,0,.32,.34,.5,ink)
 return {engine,scene,camera,player,person,vehicle,car,racer,markers,lanterns,target,bot,mat,colors:[pink,mint,gold,violet],plazaLight:violet}
}
