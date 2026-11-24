import {advancePulse,frequencies,pulseRange,startPulse,targetFrequency} from './pulse'
import {guideNearby,novaDialogue,scanAt,scanRange,type GuideMode} from './exploration'
import {ActivityPortal} from './activities/portal'
import {challenges,cityRewards,cityXP,recordCompletion} from './progression'
import {discoveries,pulseRoutes,venues,type PulseId} from './city-content'
import {SimulationClock} from './runtime'
import {load,persist} from './storage'
import './style.css'
import {createView,Vector3} from './view'
import {blocks,starts,sites,titles,english,labels,rewards,outfits,shop,distance,step,cameraDistance,clear,type Point} from './world'
import {fresh,boostedVehicle,start,advance,leave,inRace,dismount,citizens,npcAt,authored} from './game'
import {AudioCity} from './audio'
const el=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T
const canvas=el<HTMLCanvasElement>('world'),panel=el<HTMLDialogElement>('panel'),act=el<HTMLButtonElement>('act')
const audio=new AudioCity(),simulation=new SimulationClock()
let s=fresh(),writable=true,storageNotice=''
try{const loaded=load(localStorage);s=loaded.state;writable=loaded.writable;storageNotice=loaded.notice}catch{storageNotice='無法儲存進度；本次可繼續遊玩。'}
function save(){if(!writable)return;try{persist(localStorage,s)}catch{if(!storageNotice){storageNotice='無法儲存進度；請保留此頁。';message(storageNotice)}}}
function message(text:string,voice=false){el('toast').textContent=text;el('toast').classList.add('show');clearTimeout(timer);timer=window.setTimeout(()=>el('toast').classList.remove('show'),4200);if(voice)audio.say(text)}
let timer=0
function open(title:string){panel.querySelector('h2')!.textContent=title;el('content').replaceChildren();if(!panel.open)panel.showModal();resetInput()}
function para(t:string){const p=document.createElement('p');p.textContent=t;el('content').append(p)}
function button(t:string,fn:()=>void){const b=document.createElement('button');b.textContent=t;b.onclick=fn;el('content').append(b);return b}
el('close').onclick=()=>panel.close()
const keys=new Set<string>();let jx=0,jz=0,run=false,stickId=-1,cameraId=-1,lastX=0,yaw=s.player.heading,manual=0
function resetInput(){simulation.reset();keys.clear();jx=jz=0;stickId=cameraId=-1;el('stick').firstElementChild!.setAttribute('style','')}
const stick=el('stick')
function joystick(e:PointerEvent){const b=stick.getBoundingClientRect(),dx=e.clientX-b.left-b.width/2,dy=e.clientY-b.top-b.height/2,n=Math.max(33,Math.hypot(dx,dy));jx=dx/n;jz=-dy/n;stick.firstElementChild!.setAttribute('style','transform:translate('+jx*33+'px,'+(-jz*33)+'px)')}
stick.onpointerdown=e=>{stickId=e.pointerId;stick.setPointerCapture(stickId);joystick(e)}
stick.onpointermove=e=>{if(e.pointerId===stickId)joystick(e)}
stick.onlostpointercapture=()=>{jx=jz=0;stickId=-1;stick.firstElementChild!.setAttribute('style','')}
canvas.onpointerdown=e=>{cameraId=e.pointerId;lastX=e.clientX;canvas.setPointerCapture(cameraId)}
canvas.onpointermove=e=>{if(e.pointerId===cameraId){yaw+=(e.clientX-lastX)*.008;lastX=e.clientX;manual=2}}
canvas.onlostpointercapture=()=>{cameraId=-1}
el('sprint').onclick=()=>{run=!run;el('sprint').classList.toggle('on',run)}
window.addEventListener('blur',()=>{resetInput();save()});document.addEventListener('visibilitychange',()=>{resetInput();audio.visibilityChanged();save()});window.addEventListener('pagehide',save)
const guide=el('nova'),guideToggle=el<HTMLButtonElement>('nova-toggle')
let guideMode:GuideMode='open'
try{
 const preference=localStorage.getItem('george-city.nova')
 if(preference==='compact'||preference==='off')guideMode=preference
}catch{/* Session preferences still work. */}
function updateGuide(){
 guide.hidden=guideMode==='off'
 el('nova-copy').hidden=guideMode!=='open'
 guideToggle.setAttribute('aria-expanded',String(guideMode==='open'))
}
function setGuide(mode:GuideMode){
 guideMode=mode
 try{localStorage.setItem('george-city.nova',mode)}catch{/* Session preferences still work. */}
 updateGuide()
}
guideToggle.onclick=()=>setGuide(guideMode==='open'?'compact':'open')
updateGuide()
let reduced=matchMedia('(prefers-reduced-motion: reduce)').matches
try{const pref=localStorage.getItem('george-city.motion');if(pref!==null)reduced=pref==='reduced'}catch{/* Session preferences still work. */}
function soundMenu(){open('設定 · Settings');button('減少動態 '+(reduced?'開':'關'),()=>{
 reduced=!reduced
 try{localStorage.setItem('george-city.motion',reduced?'reduced':'full')}catch{/* Session only. */}
 soundMenu()
});button('NOVA 嚮導 '+{open:'開',compact:'收起',off:'關'}[guideMode],()=>{
 setGuide({open:'compact',compact:'off',off:'open'}[guideMode] as GuideMode)
 soundMenu()
});para('月潮里 FM · 原創夜行電子樂');button('配樂 '+(audio.music?'開':'關'),()=>{audio.toggleMusic();soundMenu()});button('提示音 '+(audio.fx?'開':'關'),()=>{audio.fx=!audio.fx;audio.chime();soundMenu()});button('廣東話廣播 '+(audio.voice?'開':'關'),()=>{audio.voice=!audio.voice;message('各位街坊，歡迎嚟到月潮里。',true);soundMenu()});para('語音會使用裝置上嘅廣東話聲線。')}
el('sound').onclick=soundMenu
function boot(){
 const v=createView(canvas),p=s.player
 let scanStarted=-Infinity
 let scanSignals=new Set<string>()
 const metGuidance=new Set<string>()
 const speakNova=(line:string,voice=false)=>{
  el('nova-line').textContent=line
  if(voice&&guideMode==='open')audio.say(line)
 }
 speakNova(novaDialogue.reply(s,'arrival'))
 el('nova-hint').onclick=()=>speakNova(novaDialogue.reply(s,'hint'),true)
 function scan(){
  if(panel.open||portal.active)return
  if(p.driving){message('落車先可以用城市掃描。');return}
  if(s.clock-scanStarted<1.1)return
  scanStarted=s.clock
  const {signals,earned}=scanAt(p,s.city.stamps)
  scanSignals=new Set(signals.map(site=>site.id))
  audio.effect(signals.length?610:365)
  if(earned.length){
   message('掃描發現 · '+earned.map(site=>site.name).join('、')+'　+'+(15*earned.length)+' XP')
   speakNova(novaDialogue.reply(s,'discovery',earned[0].name),true)
   save()
  }else if(signals.length)message(signals[0].name+' · '+signals[0].story)
  else message('附近未有訊號。City OS 掃描手帳有地區線索。')
 }
 el('scan').onclick=scan
 let freshFrame=false
 const portal=new ActivityPortal(el<HTMLDialogElement>('activity'),audio,s.city,playing=>{
  resetInput()
  if(playing){
   freshFrame=true
   v.engine.resize()
   v.engine.runRenderLoop(render)
   hud()
  }else{
   save()
   v.engine.stopRenderLoop(render)
  }
 },(id,score)=>{
  const result=recordCompletion(s.city,id,score)
  if(result.reward)speakNova(novaDialogue.reply(s,'reward',result.reward))
  save()
  return result
 })
 const residents=citizens.map((who,i)=>{
  const resident=v.person(who.color,i+1)
  const at=npcAt(i,s.clock)
  resident.root.position.set(at.x,0,at.z)
  resident.root.rotation.y=at.heading
  return resident
 })
 const cars=[v.car,v.racer],traffic=[v.vehicle('#c8a362'),v.vehicle('#7199ad')]
 const skin=['#df665c','#ff7d71','#af83df','#dfab56','#7dd9b5','#b4cfdf']
 let selected=-1
 function dress(){v.player.dress(skin[s.outfit]||skin[0])}
 dress()
 function cityId(){
  open('City ID')
  para('Tidewalker　/　月潮里街坊')
  para('港幣點數　'+s.credits+'　 ·　委託 '+Object.keys(s.records).length+'/5')
  const landmarks=['霓虹牌樓','露天戲院','碼頭燈塔']
  para('城市發現　'+landmarks.filter((_,i)=>s.discovered.includes('landmark-'+i)).join('　'))
  para('服飾收藏　'+outfits.filter((_,i)=>i===0||s.records[i-1]!==undefined).join('　'))
  const earned=[s.discovered.length===3?'街影收藏家':'',s.records[3]!==undefined?'午夜車手':'',Object.keys(s.records).length===5?'月潮里街坊':''].filter(Boolean)
  para('成就　'+(earned.join('　')||'探索地標、完成委託即可獲得'))
  const rewards=cityRewards(s.city)
  para('City XP　'+cityXP(s.city)+'　·　掃描印章 '+s.city.stamps.length+'/'+discoveries.length)
  para('收藏徽章　'+(rewards.map(id=>challenges[id].item).join('　')||'—')+(s.city.stamps.length===discoveries.length?'　月潮探路員':''))
  for(const [id,challenge] of Object.entries(challenges)){
   const record=s.city.records[id as keyof typeof challenges]
   if(record)para(challenge.name+'　完成 '+record.runs+' 次'+(id==='sync'||id==='cafe'?'　·　個人最佳 '+record.best.toLocaleString():''))
  }
  button('‹ City OS',cityOS)
 }
 function scanLog(){
  open('城市掃描 · City Scan')
  para('街上㩒 ⌖ 或 Q，掃描八米內嘅訊號。沿住地區線索行，尋找 '+discoveries.length+' 枚印章。')
  para('已收錄 '+s.city.stamps.length+'/'+discoveries.length)
  const log=document.createElement('dl')
  log.className='scan-log'
  for(const site of discoveries){
   const title=document.createElement('dt'),story=document.createElement('dd')
   const found=s.city.stamps.includes(site.id)
   title.textContent=found?site.name:'未辨識訊號 · '+site.area
   story.textContent=found?site.story:site.area
   log.append(title)
   if(found)log.append(story)
  }
  el('content').append(log)
  button('‹ City OS',cityOS)
 }
 function pulseMenu(){
  open('城市脈搏 · City Pulse')
  para('到街上搵速遞站或月輪光網。完成咗可以再接，紀念章每款只派一次。')
  for(const [id,route] of Object.entries(pulseRoutes)){
   const runs=s.city.records[id as PulseId]?.runs??0
   para(route.name+'　·　'+(id==='delivery'?'西街速遞站':'月輪廣場北面')+(runs?'　·　完成 '+runs+' 次':''))
  }
  if(s.city.pulse){
   para(pulseRoutes[s.city.pulse.id].stops[s.city.pulse.stage].label)
   button('停止城市事件',()=>{
    s.city.pulse=null
    save()
    pulseMenu()
   })
  }
  button('‹ City OS',cityOS)
 }
 function beginPulse(id:PulseId){
  if(!startPulse(s.city,id,p))return
  message(id==='delivery'?'肥波 · 北閘部機械人卡住咗，幫佢接手個包裹吖。':'光網唔穩定。跟住藍色訊號，逐個校準三座發射器。',true)
  audio.effect(550)
  save()
 }
 function completePulse(frequency?:number){
  const id=s.city.pulse?.id
  if(!id)return
  const result=advancePulse(s.city,p,frequency)
  if(result==='none')return
  if(result==='mismatch'){
   el('relay-feedback').textContent='頻率唔啱。睇返接收器顯示嘅符號。'
   audio.effect(145)
   return
  }
  if(panel.open)panel.close()
  audio.effect(result==='finish'?810:570)
  if(result==='finish'){
   const earned=recordCompletion(s.city,id,1)
   if(earned.reward)speakNova(novaDialogue.reply(s,'reward',earned.reward))
   message(pulseRoutes[id].name+'完成！'+(earned.reward?'　已收藏 '+earned.reward+'　+'+challenges[id].xp+' XP':''),true)
  }else message(id==='delivery'?'包裹上手。跟住藍點過對面睇更亭。':'訊號穩定。跟住藍點去下一座發射器。')
  save()
 }
 function tuneRelay(){
  open('光網發射器')
  para('接收器訊號　'+frequencies[targetFrequency(s.city)])
  para('揀相同頻率，將光束接返入月輪。')
  frequencies.forEach((frequency,i)=>button(frequency,()=>completePulse(i)))
  const feedback=document.createElement('p')
  feedback.id='relay-feedback'
  feedback.setAttribute('role','status')
  el('content').append(feedback)
 }
 function cityOS(){
  open('City OS')
  para('NOVA HARBOUR　/　新港')
  button('城市地圖',()=>{open('月潮里 · Map');radar()
   const chart=document.createElement('canvas');chart.width=chart.height=160;chart.className='district-map'
   chart.setAttribute('aria-label','月潮里北向地圖');chart.getContext('2d')!.drawImage(el<HTMLCanvasElement>('map'),0,0)
   el('content').append(chart)
   para('三角形係你嘅位置。粉紅點係委託，金色點係委託目的地，藍色點係城市脈搏。')
   para('淺藍入口 · 東邊 PLAYVERSE，西邊月潮冰室。')
   button('‹ City OS',cityOS)})
  button('街坊委託 · Activities',journal)
  button('城市掃描 · City Scan',scanLog)
  button('城市脈搏 · City Pulse',pulseMenu)
  if(s.active)para(titles[s.active.id]+'　/　'+labels[s.active.id][s.active.stage])
  button('City ID',cityId);button('設定',soundMenu)
 }
 function journal(){
  open('城市手帳');para('月潮里　·　'+s.credits+' 港幣點數　·　地標 '+s.discovered.length+'/3')
  para('成就　'+(s.discovered.length===3?'街影收藏家　':'')+(s.records[3]!==undefined?'午夜車手　':'')+(Object.keys(s.records).length===5?'月潮里街坊':'已完成 '+Object.keys(s.records).length+'/5 個委託'))
  titles.forEach((t,i)=>button((s.records[i]!==undefined?'✓ ':'◇ ')+t+(s.records[i]!==undefined?'　'+s.records[i].toFixed(1)+'s':''),()=>{if(s.active){message('你有進行中嘅委託。');return}selected=i;panel.close();message('已標示 '+t+' 嘅起點。')}))
  if(s.active)button('離開目前委託',()=>{leave(s);save();panel.close()})
  para('WASD／方向鍵移動，Shift 跑，E 互動。手機用左搖桿，右邊拖曳轉鏡頭。駕車時向上加速、向下倒車，左右轉向。')
 }
 el('journal').onclick=cityOS
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
  offer(venues.sync,venues.sync.label,()=>void portal.enter('sync',venues.sync.title,reduced),2.7)
  offer(venues.cafe,venues.cafe.label,()=>void portal.enter('cafe',venues.cafe.title,reduced),2.7)
  const pulse=s.city.pulse
  if(pulse){
   const stop=pulseRoutes[pulse.id].stops[pulse.stage]
   offer(stop,stop.action,pulse.id==='energy'?tuneRelay:()=>completePulse(),pulseRange)
  }else{
   for(const id of ['delivery','energy'] as const)offer(pulseRoutes[id].start,pulseRoutes[id].offer,()=>beginPulse(id),pulseRange)
  }
  offer(shop,'逛茶檔／換衫',tailor)
  cars.forEach((_,i)=>offer(s.cars[i],i?'月潮 GT':'上車',()=>{if(i&&s.records[3]===undefined){message('跑完午夜飛圈，車房就會交匙。');return}s.ride=i;Object.assign(p,s.cars[i],{speed:0,driving:true,heading:cars[i].rotation.y});save()}))
  residents.forEach((n,i)=>offer(n.root.position,'同'+citizens[i%4].name+'傾偈',()=>{const who=citizens[i%4];message(who.name+' · '+who.job+'：「'+authored.reply(s,i%4)+'」',true);save()},2.1))
  return options.sort((a,b)=>a.d-b.d)[0]?.action||null
 }
 function action(){if(!panel.open&&!portal.active)nearby()?.do()}
 act.onclick=action
 window.onkeydown=e=>{if(panel.open||portal.active)return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyE'].includes(e.code))e.preventDefault();keys.add(e.code);if(e.repeat)return;if(e.code==='KeyE'||e.code==='Space')action();if(e.code==='KeyM')cityOS();if(e.code==='KeyQ')scan()}
 window.onkeyup=e=>keys.delete(e.code)
 const map=el<HTMLCanvasElement>('map').getContext('2d')!
 function radar(){
  const race=inRace(s),scale=race?2.9:1.6
  const project=(a:Point)=>[80+(a.x-(race?80:0))*scale,80-(a.z-(race?1:0))*scale]
  map.fillStyle='#122834';map.fillRect(0,0,160,160)
  map.fillStyle='#53616a';for(const b of blocks){const [x,y]=project(b);map.fillRect(x-b.w*scale/2,y-b.d*scale/2,b.w*scale,b.d*scale)}
  const dot=(a:Point,color:string,r:number)=>{const [x,y]=project(a);map.fillStyle=color;map.beginPath();map.arc(x,y,r,0,7);map.fill()}
  if(race){map.strokeStyle='#75b6ac';map.lineWidth=9;map.strokeRect(51,33,58,93)}
  else {
   Object.values(venues).forEach(venue=>dot(venue,'#bbebff',3))
   starts.forEach((at,i)=>dot(at,s.records[i]===undefined?'#ffab9b':'#77b2a4',3))
   const pulse=s.city.pulse
   if(pulse)dot(pulseRoutes[pulse.id].stops[pulse.stage],'#64bdff',4)
   else Object.values(pulseRoutes).forEach(route=>dot(route.start,'#64bdff',2.5))
  }
  const dest=s.active?sites[s.active.id][s.active.stage]:selected>=0?starts[selected]:null
  if(dest)dot(dest,'#ffef79',5)
  const [x,y]=project(p);map.save();map.translate(x,y);map.rotate(p.heading);map.fillStyle='#bdffac';map.beginPath();map.moveTo(0,-7);map.lineTo(5,5);map.lineTo(0,3);map.lineTo(-5,5);map.fill();map.restore()
  map.fillStyle='white';map.font='bold 12px monospace';map.fillText('N',76,15)
 }
 const sign=(a:string,b:string)=>+(keys.has(a)||keys.has(b))
 let tick=0,hudTime=0,saveTime=0,phase=0,npcTime=0,qualityTime=0,slow=0,frames=0
 let eyeDistance=5.5
 function hud(){
  guide.classList.toggle('in-vehicle',p.driving)
  const context=!p.driving&&guideMode==='open'?guideNearby(s):undefined
  if(context&&!metGuidance.has(context)){
   metGuidance.add(context)
   speakNova(novaDialogue.reply(s,context))
  }
  const a=s.active,dest=a?sites[a.id][a.stage]:selected>=0?starts[selected]:undefined,near=nearby()
  el('kicker').textContent=a?'委託　/　'+english[a.id].toUpperCase():'NOVA HARBOUR　/　新港'
  el('title').textContent=a?titles[a.id]:'Moontide 月潮里'
  el('objective').textContent=(a?labels[a.id][a.stage]:selected>=0?'前往 '+titles[selected]:(Object.keys(s.records).length?'行近光環，探索街坊委託。':'試影第一張街影 · 左邊街坊阿晴識路。'))+(dest?'　'+Math.round(distance(p,dest))+' m':'')+(inRace(s)?'　'+a!.elapsed.toFixed(1)+' s':'')
  act.disabled=!near;act.querySelector('span')!.textContent=near?.label||'互動'
  const pulse=s.city.pulse,stage=pulse&&!inRace(s)?pulseRoutes[pulse.id].stops[pulse.stage]:null
  el('pulse-objective').hidden=!stage
  if(stage)el('pulse-objective').textContent='◈ '+stage.label+'　'+Math.round(distance(p,stage))+' m'
  const minutes=Math.floor(1200+s.clock*2)%1440;el('clock').textContent=String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0')
  radar()
 }
 hud()
 if(storageNotice)message(storageNotice)
 function render(){
  const real=freshFrame?0:v.engine.getDeltaTime()/1000,dt=Math.min(.065,real)
  freshFrame=false
  if(document.hidden)return
  const paused=panel.open
  if(!paused){
   simulation.advance(real,dt=>{
   s.clock+=dt;if(s.active)s.active.elapsed+=dt
   const cmd={forward:jz+sign('KeyW','ArrowUp')-sign('KeyS','ArrowDown'),side:jx+sign('KeyD','ArrowRight')-sign('KeyA','ArrowLeft'),sprint:run||keys.has('ShiftLeft')||keys.has('ShiftRight')||s.clock<s.teaUntil}
   manual-=dt;if(p.driving&&manual<=0)yaw+=Math.atan2(Math.sin(p.heading-yaw),Math.cos(p.heading-yaw))*(1-Math.exp(-4*dt))
   step(p,cmd,yaw,dt,inRace(s),boostedVehicle(s))
   if(inRace(s)&&distance(p,sites[3][s.active!.stage])<3)complete()
   })
  }
  if(paused)simulation.reset()
  if(!reduced)tick+=dt;v.display.rotation.y=reduced?0:Math.sin(tick)*.45;phase+=Math.abs(p.speed)*dt*2.4
  v.player.root.setEnabled(!p.driving);v.player.root.position.set(p.x,0,p.z);v.player.root.rotation.y=p.heading;v.player.animate(phase,paused?0:Math.min(.85,p.speed*.13))
  cars.forEach((car,i)=>{const driving=p.driving&&(inRace(s)?i===1:i===s.ride);const pos=driving?p:s.cars[i];car.position.set(pos.x,0,pos.z);if(driving)car.rotation.y=p.heading})
  npcTime+=dt
  if(npcTime>.1){
   npcTime=0
   residents.forEach((resident,i)=>{
    const at=npcAt(i,s.clock)
    resident.root.position.set(at.x,0,at.z)
    const idle=at.walking||reduced?0:Math.sin(s.clock*.9+i)*.16
    resident.root.rotation.y=at.heading+idle
    resident.animate(s.clock*5+i,at.walking?.38:0)
   })
  }
  traffic.forEach((car,i)=>{const cycle=(s.clock*3+i*48)%144;car.position.set(i?3:-3,0,cycle<72?cycle-36:108-cycle);car.rotation.y=cycle<72?0:Math.PI})
  v.markers.forEach((m,i)=>{m.position.y=1.68+.16*Math.sin(tick*2+i);m.rotation.y=tick*.8;m.setEnabled(!s.active)})
  v.lanterns.forEach((m,i)=>{m.setEnabled(s.active?.id===4&&i>=s.active.stage);m.position.y=1.25+.16*Math.sin(tick*2+i);m.rotation.y=Math.sin(tick+i)*.4})
  const a=s.active,pos=a?sites[a.id][a.stage]:selected>=0?starts[selected]:undefined
  v.target.setEnabled(!!pos);if(pos){v.target.position.set(pos.x,1.55+.18*Math.sin(tick*3),pos.z);v.target.rotation.y=tick}
  const bot=a?.id===1&&a.stage===1?{x:p.x-1.2*Math.sin(p.heading),z:p.z-1.2*Math.cos(p.heading)}:sites[1][0]
  v.bot.position.set(bot.x,.06*Math.sin(tick*3),bot.z);v.bot.rotation.y=a?.id===1?p.heading:tick*.2
  const pulse=s.city.pulse,stage=pulse&&!inRace(s)?pulseRoutes[pulse.id].stops[pulse.stage]:null
  v.pulseTarget.setEnabled(!!stage)
  if(stage){
   v.pulseTarget.position.set(stage.x,1.84+(reduced?0:Math.sin(tick*2.6)*.12),stage.z)
   v.pulseTarget.rotation.y=tick
  }
  const parcelAt=pulse?.id==='delivery'&&pulse.stage===0?pulseRoutes.delivery.stops[0]:pulseRoutes.delivery.start
  v.deliveryBot.position.set(parcelAt.x,0,parcelAt.z)
  v.relayLights.forEach((lamp,i)=>{
   if(pulse?.id==='energy')lamp.setEnabled(i<pulse.stage||(i===pulse.stage&&(reduced||Math.sin(tick*4)>.05)))
   else lamp.setEnabled(!!s.city.records.energy?.runs)
  })
  const scanAge=s.clock-scanStarted
  v.scanPulse.setEnabled(scanAge<1.1&&!p.driving)
  if(v.scanPulse.isEnabled()){
   const radius=reduced?scanRange:Math.max(.35,scanRange*scanAge/1.1)
   v.scanPulse.position.set(p.x,.2,p.z)
   v.scanPulse.scaling.set(radius*2,.2,radius*2)
   v.scanGlow.alpha=.42*(1-scanAge/1.1)
  }
  v.scanMarks.forEach((mark,i)=>{
   const site=discoveries[i]
   mark.setEnabled(scanAge<8&&scanSignals.has(site.id)&&!p.driving)
   if(mark.isEnabled())mark.rotation.y=reduced?0:tick*.7
  })
  const novaX=p.x+1.43*Math.cos(yaw)+.85*Math.sin(yaw),novaZ=p.z-1.43*Math.sin(yaw)+.85*Math.cos(yaw)
  const canFollow=guideMode!=='off'&&!p.driving&&clear(novaX,novaZ,.34)
  v.nova.setEnabled(canFollow)
  if(canFollow){
   v.nova.position.set(novaX,1.43+(reduced?0:Math.sin(tick*2.7)*.09),novaZ)
   v.nova.rotation.y=yaw+Math.PI
  }
  v.plazaLight.alpha=s.records[2]!==undefined?1:.48+.12*Math.sin(tick*3)
  const desired=p.driving?7.3:5.3,available=cameraDistance(p,yaw,desired,inRace(s))
  eyeDistance=Math.min(available,eyeDistance+(desired-eyeDistance)*(1-Math.exp(-5*dt)))
  const cx=p.x-Math.sin(yaw)*eyeDistance,cz=p.z-Math.cos(yaw)*eyeDistance
  v.camera.position.set(cx,1.72+eyeDistance*.29,cz);v.camera.setTarget(new Vector3(p.x+Math.sin(yaw)*1.2,p.driving?1.35:2.64,p.z+Math.cos(yaw)*1.2))
  if(!clear(cx,cz,.08,inRace(s)))v.camera.position.set(p.x,2.2,p.z)
  hudTime+=dt;if(hudTime>.12){hudTime=0;hud()}
  saveTime+=dt;if(saveTime>2){saveTime=0;save()}
  qualityTime+=real;frames++;if(real>.046)slow++
  if(qualityTime>4&&frames>15){if(slow/frames>.45)v.engine.setHardwareScalingLevel(Math.min(2.4,v.engine.getHardwareScalingLevel()+.25));qualityTime=frames=slow=0}
  v.scene.render()
 }
 v.engine.runRenderLoop(render)
 window.addEventListener('resize',()=>{if(!portal.active)v.engine.resize()})
}
async function launch(){try{await document.fonts.load('16px DistrictHK','月潮里');boot()}catch(e){console.error(e);open('未能開啟 3D 城市');para('請使用支援 WebGL 嘅瀏覽器，開啟硬件加速後再試。');button('重新載入',()=>location.reload())}

}
void launch()
