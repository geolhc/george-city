import './style.css'
import {createView,Vector3} from './view'
import {blocks,starts,sites,titles,english,labels,rewards,outfits,shop,distance,step,cameraDistance,clear,type Point} from './world'
import {fresh,restore,start,advance,leave,inRace,dismount,citizens,npcAt,authored} from './game'
import {AudioCity} from './audio'
const el=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T
const canvas=el<HTMLCanvasElement>('world'),panel=el<HTMLDialogElement>('panel'),act=el<HTMLButtonElement>('act')
const audio=new AudioCity(),key='george-city.v1'
let s=fresh()
try{s=restore(localStorage.getItem(key))}catch{}
function save(){try{localStorage.setItem(key,JSON.stringify(s))}catch{}}
function message(text:string,voice=false){el('toast').textContent=text;el('toast').classList.add('show');clearTimeout(timer);timer=window.setTimeout(()=>el('toast').classList.remove('show'),4200);if(voice)audio.say(text)}
let timer=0
function open(title:string){panel.querySelector('h2')!.textContent=title;el('content').replaceChildren();if(!panel.open)panel.showModal();resetInput()}
function para(t:string){const p=document.createElement('p');p.textContent=t;el('content').append(p)}
function button(t:string,fn:()=>void){const b=document.createElement('button');b.textContent=t;b.onclick=fn;el('content').append(b);return b}
el('close').onclick=()=>panel.close()
const keys=new Set<string>();let jx=0,jz=0,run=false,stickId=-1,cameraId=-1,lastX=0,yaw=s.player.heading,manual=0
function resetInput(){keys.clear();jx=jz=0;stickId=cameraId=-1;el('stick').firstElementChild!.setAttribute('style','')}
const stick=el('stick')
function joystick(e:PointerEvent){const b=stick.getBoundingClientRect(),dx=e.clientX-b.left-b.width/2,dy=e.clientY-b.top-b.height/2,n=Math.max(33,Math.hypot(dx,dy));jx=dx/n;jz=-dy/n;stick.firstElementChild!.setAttribute('style','transform:translate('+jx*33+'px,'+(-jz*33)+'px)')}
stick.onpointerdown=e=>{stickId=e.pointerId;stick.setPointerCapture(stickId);joystick(e)}
stick.onpointermove=e=>{if(e.pointerId===stickId)joystick(e)}
stick.onlostpointercapture=()=>{jx=jz=0;stickId=-1;stick.firstElementChild!.setAttribute('style','')}
canvas.onpointerdown=e=>{cameraId=e.pointerId;lastX=e.clientX;canvas.setPointerCapture(cameraId)}
canvas.onpointermove=e=>{if(e.pointerId===cameraId){yaw+=(e.clientX-lastX)*.008;lastX=e.clientX;manual=2}}
canvas.onlostpointercapture=()=>{cameraId=-1}
el('sprint').onclick=()=>{run=!run;el('sprint').classList.toggle('on',run)}
window.addEventListener('blur',()=>{resetInput();save()});document.addEventListener('visibilitychange',()=>{resetInput();save()});window.addEventListener('pagehide',save)
function soundMenu(){open('街頭電台');para('月潮里 FM · 原創夜行電子樂');button('配樂 '+(audio.music?'開':'關'),()=>{audio.toggleMusic();soundMenu()});button('提示音 '+(audio.fx?'開':'關'),()=>{audio.fx=!audio.fx;audio.chime();soundMenu()});button('廣東話廣播 '+(audio.voice?'開':'關'),()=>{audio.voice=!audio.voice;message('各位街坊，歡迎嚟到月潮里。',true);soundMenu()});para('語音會使用裝置上嘅廣東話聲線。')}
el('sound').onclick=soundMenu
function boot(){
 const v=createView(canvas),p=s.player
 const residents=Array.from({length:8},(_,i)=>v.person(citizens[i%4].color))
 const cars=[v.car,v.racer],traffic=[v.vehicle('#c8a362'),v.vehicle('#7199ad')]
 const skin=['#df665c','#ff7d71','#af83df','#dfab56','#7dd9b5','#b4cfdf']
 let selected=-1
 function dress(){v.player.torso.material=v.mat(skin[s.outfit]||skin[0])}
 dress()
 function journal(){
  open('城市手帳');para('月潮里　·　'+s.credits+' 港幣點數　·　地標 '+s.discovered.length+'/3')
  para('成就　'+(s.discovered.length===3?'街影收藏家　':'')+(s.records[3]!==undefined?'午夜車手　':'')+(Object.keys(s.records).length===5?'月潮里街坊':'已完成 '+Object.keys(s.records).length+'/5 個委託'))
  titles.forEach((t,i)=>button((s.records[i]!==undefined?'✓ ':'◇ ')+t+(s.records[i]!==undefined?'　'+s.records[i].toFixed(1)+'s':''),()=>{if(s.active){message('你有進行中嘅委託。');return}selected=i;panel.close();message('已標示 '+t+' 嘅起點。')}))
  if(s.active)button('離開目前委託',()=>{leave(s);save();panel.close()})
  para('WASD／方向鍵移動，Shift 跑，E 互動。手機用左搖桿，右邊拖曳轉鏡頭。駕車時向上加速、向下倒車，左右轉向。')
 }
 el('journal').onclick=journal
 function tailor(){open('夜市裁縫 · 茶檔');outfits.forEach((n,i)=>{if(!i||s.records[i-1]!==undefined)button((s.outfit===i?'✓ ':'')+n,()=>{s.outfit=i;dress();save();tailor()})});button('凍檸茶　15 點',()=>{if(s.credits<15){para('儲夠 15 點再嚟吖。');return}s.credits-=15;s.teaUntil=s.clock+60;save();panel.close();message('夠晒凍！一分鐘內自動快跑。')})}
 function complete(){const id=s.active?.id;if(id===undefined)return;const first=s.records[id]===undefined,result=advance(s);if(result==='none')return
  audio.chime();if(result==='finish'){selected=-1;message('委託完成！ '+(first?'＋'+rewards[id]+' 點 · 解鎖'+outfits[id+1]:'個人紀錄已更新'),true)}else message(id===1?'阿轆跟住你喇！':'收到！下一站已標示。');save()
 }
 function puzzle(){open('月輪配電盤');para('電源喺左邊。轉動三個接頭，令電流一路向右流入月輪。')
  const a=s.active!;a.wires.forEach((n,i)=>{let b=button(['↑','→','↓','←'][n],()=>{a.wires[i]=(n+1)%4;save();if(a.wires.every(v=>v===1)){panel.close();complete()}else puzzle()});b.className='wire';b.setAttribute('aria-label','轉動接頭 '+(i+1))})
 }
 function mission(i:number){if(!start(s,i))return;selected=-1;message(i===3?'起步！順序穿過四道光閘。':labels[i][0],true);save()}
 type Interaction={label:string;do:()=>void}
 function nearby():Interaction|null{
  if(inRace(s))return {label:'離開賽道',do:journal}
  if(p.driving)return {label:'落車',do:()=>{if(dismount(s))save()}}
  const a=s.active
  if(a&&distance(p,sites[a.id][a.stage])<3.25)return {label:a.id===2?'駁電':labels[a.id][a.stage],do:a.id===2?puzzle:complete}
  const options:{d:number;action:Interaction}[]=[]
  function offer(at:Point,label:string,fn:()=>void,r=3){let d=distance(p,at);if(d<=r)options.push({d,action:{label,do:fn}})}
  if(!a)starts.forEach((pos,i)=>offer(pos,titles[i],()=>mission(i),3.3))
  offer(shop,'逛茶檔／換衫',tailor)
  cars.forEach((_,i)=>offer(s.cars[i],i?'月潮 GT':'上車',()=>{if(i&&s.records[3]===undefined){message('跑完午夜飛圈，車房就會交匙。');return}s.ride=i;Object.assign(p,s.cars[i],{speed:0,driving:true,heading:cars[i].rotation.y});save()}))
  residents.forEach((n,i)=>offer(n.root.position,'同'+citizens[i%4].name+'傾偈',()=>{const who=citizens[i%4];message(who.name+' · '+who.job+'：「'+authored.reply(s,i%4)+'」',true);save()},2.1))
  return options.sort((a,b)=>a.d-b.d)[0]?.action||null
 }
 function action(){if(!panel.open)nearby()?.do()}
 act.onclick=action
 window.onkeydown=e=>{if(panel.open)return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyE'].includes(e.code))e.preventDefault();keys.add(e.code);if(e.repeat)return;if(e.code==='KeyE'||e.code==='Space')action();if(e.code==='KeyM')journal()}
 window.onkeyup=e=>keys.delete(e.code)
 const map=el<HTMLCanvasElement>('map').getContext('2d')!
 function radar(){
  const race=inRace(s),scale=race?2.9:1.6
  const project=(a:Point)=>[80+(a.x-(race?80:0))*scale,80-(a.z-(race?1:0))*scale]
  map.fillStyle='#122834';map.fillRect(0,0,160,160)
  map.fillStyle='#53616a';for(const b of blocks){const [x,y]=project(b);map.fillRect(x-b.w*scale/2,y-b.d*scale/2,b.w*scale,b.d*scale)}
  const dot=(a:Point,color:string,r:number)=>{const [x,y]=project(a);map.fillStyle=color;map.beginPath();map.arc(x,y,r,0,7);map.fill()}
  if(race){map.strokeStyle='#75b6ac';map.lineWidth=9;map.strokeRect(51,33,58,93)}
  else starts.forEach((a,i)=>dot(a,s.records[i]===undefined?'#ffab9b':'#77b2a4',3))
  const dest=s.active?sites[s.active.id][s.active.stage]:selected>=0?starts[selected]:null
  if(dest)dot(dest,'#ffef79',5)
  const [x,y]=project(p);map.save();map.translate(x,y);map.rotate(p.heading);map.fillStyle='#bdffac';map.beginPath();map.moveTo(0,-7);map.lineTo(5,5);map.lineTo(0,3);map.lineTo(-5,5);map.fill();map.restore()
  map.fillStyle='white';map.font='bold 12px monospace';map.fillText('N',76,15)
 }
 const sign=(a:string,b:string)=>+(keys.has(a)||keys.has(b))
 let tick=0,hudTime=0,saveTime=0,phase=0,npcTime=0,qualityTime=0,slow=0,frames=0
 let eyeDistance=5.5
 function hud(){
  const a=s.active,dest=a?sites[a.id][a.stage]:selected>=0?starts[selected]:undefined,near=nearby()
  el('kicker').textContent=a?'委託　/　'+english[a.id].toUpperCase():'DISTRICT 01　/　月潮里'
  el('title').textContent=a?titles[a.id]:'Moontide Lane'
  el('objective').textContent=(a?labels[a.id][a.stage]:selected>=0?'前往 '+titles[selected]:'行近發光標記，探索街坊委託。')+(dest?'　'+Math.round(distance(p,dest))+' m':'')+(inRace(s)?'　'+a!.elapsed.toFixed(1)+' s':'')
  act.disabled=!near;act.querySelector('span')!.textContent=near?.label||'互動'
  const minutes=Math.floor(1200+s.clock*2)%1440;el('clock').textContent=String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0')
  radar()
 }
 hud()
 v.engine.runRenderLoop(()=>{
  const real=v.engine.getDeltaTime()/1000,dt=Math.min(.065,real)
  if(document.hidden)return
  const paused=panel.open
  if(!paused){
   s.clock+=dt;if(s.active)s.active.elapsed+=dt
   const cmd={forward:jz+sign('KeyW','ArrowUp')-sign('KeyS','ArrowDown'),side:jx+sign('KeyD','ArrowRight')-sign('KeyA','ArrowLeft'),sprint:run||keys.has('ShiftLeft')||keys.has('ShiftRight')||s.clock<s.teaUntil}
   manual-=dt;if(p.driving&&manual<=0)yaw+=Math.atan2(Math.sin(p.heading-yaw),Math.cos(p.heading-yaw))*(1-Math.exp(-4*dt))
   for(let left=dt;left>.00001;left-=1/60)step(p,cmd,yaw,Math.min(left,1/60),inRace(s),s.ride===1)
   if(inRace(s)&&distance(p,sites[3][s.active!.stage])<3)complete()
  }
  tick+=dt;phase+=Math.abs(p.speed)*dt*2.4
  v.player.root.setEnabled(!p.driving);v.player.root.position.set(p.x,0,p.z);v.player.root.rotation.y=p.heading;v.player.animate(phase,paused?0:Math.min(.85,p.speed*.13))
  cars.forEach((car,i)=>{const driving=p.driving&&(inRace(s)?i===1:i===s.ride);const pos=driving?p:s.cars[i];car.position.set(pos.x,0,pos.z);if(driving)car.rotation.y=p.heading})
  npcTime+=dt;if(npcTime>.1){npcTime=0;residents.forEach((n,i)=>{const at=npcAt(i,s.clock);n.root.position.set(at.x,0,at.z);n.root.rotation.y=at.heading;n.animate(s.clock*5+i,at.walking?.38:0)})}
  traffic.forEach((car,i)=>{const cycle=(s.clock*3+i*48)%144;car.position.set(i?3:-3,0,cycle<72?cycle-36:108-cycle);car.rotation.y=cycle<72?0:Math.PI})
  v.markers.forEach((m,i)=>{m.position.y=1.68+.16*Math.sin(tick*2+i);m.rotation.y=tick*.8;m.setEnabled(!s.active)})
  const a=s.active,pos=a?sites[a.id][a.stage]:selected>=0?starts[selected]:undefined
  v.target.setEnabled(!!pos);if(pos){v.target.position.set(pos.x,1.55+.18*Math.sin(tick*3),pos.z);v.target.rotation.y=tick}
  const bot=a?.id===1&&a.stage===1?{x:p.x-1.2*Math.sin(p.heading),z:p.z-1.2*Math.cos(p.heading)}:sites[1][0]
  v.bot.position.set(bot.x,.06*Math.sin(tick*3),bot.z);v.bot.rotation.y=a?.id===1?p.heading:tick*.2
  v.plazaLight.alpha=s.records[2]!==undefined?1:.48+.12*Math.sin(tick*3)
  const desired=p.driving?7.3:5.3,available=cameraDistance(p,yaw,desired,inRace(s))
  eyeDistance=Math.min(available,eyeDistance+(desired-eyeDistance)*(1-Math.exp(-5*dt)))
  const cx=p.x-Math.sin(yaw)*eyeDistance,cz=p.z-Math.cos(yaw)*eyeDistance
  v.camera.position.set(cx,1.72+eyeDistance*.29,cz);v.camera.setTarget(new Vector3(p.x+Math.sin(yaw)*1.2,1.35,p.z+Math.cos(yaw)*1.2))
  if(!clear(cx,cz,.08,inRace(s)))v.camera.position.set(p.x,2.2,p.z)
  hudTime+=dt;if(hudTime>.12){hudTime=0;hud()}
  saveTime+=dt;if(saveTime>2){saveTime=0;save()}
  qualityTime+=real;frames++;if(real>.046)slow++
  if(qualityTime>4&&frames>15){if(slow/frames>.45)v.engine.setHardwareScalingLevel(Math.min(2.4,v.engine.getHardwareScalingLevel()+.25));qualityTime=frames=slow=0}
  v.scene.render()
 })
 window.addEventListener('resize',()=>v.engine.resize())
}
try{boot()}catch(e){console.error(e);open('未能開啟 3D 城市');para('請使用支援 WebGL 嘅瀏覽器，開啟硬件加速後再試。');button('重新載入',()=>location.reload())}
