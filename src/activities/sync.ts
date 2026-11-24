import {challenges} from '../progression'
import {ActivityClock} from './clock'
import type {ActivityServices} from './portal'
import {duration,lanes,preview,SyncRun,type Judgement,type Note} from './sync-score'

const feedback = {perfect:'正中 · PERFECT',good:'同步 · GOOD',miss:'走拍 · MISS'}
const keys=lanes.map(lane=>lane.code)

export function mountActivity({mount,reducedMotion,best,tone,beginAttempt}:ActivityServices){
 mount.innerHTML=`
  <div class="sync-shell">
   <div class="activity-intro"><strong>PLAYVERSE · 共振室</strong><p>光點抵達白線嗰刻撳光鍵。<span class="keyboard-hint"> 鍵盤用 D F J K。</span></p></div>
   <dl class="activity-metrics"><div><dt>分數</dt><dd data-score>0</dd></div><div><dt>連擊</dt><dd data-combo>0</dd></div><div><dt>個人最佳</dt><dd data-best>—</dd></div><div><dt>時間</dt><dd data-time>0:48</dd></div></dl>
   <div class="sync-deck">
    <div class="sync-track" aria-hidden="true">${lanes.map(()=>'<div class="sync-rail"></div>').join('')}</div>
    <div class="sync-line" aria-hidden="true"></div>
    <div class="sync-pads">${lanes.map(({key,symbol})=>`<button type="button" aria-label="節點 ${key}"><span aria-hidden="true">${symbol}</span><kbd>${key}</kbd></button>`).join('')}</div>
   </div>
   <div class="activity-toolbar"><p data-feedback>達到 ${challenges.sync.goal.toLocaleString('en-HK')} 分可收藏${challenges.sync.item}。</p><button data-play>開始挑戰</button><button data-restart hidden>重新開始</button></div>
   <div class="activity-result" data-result role="status" hidden></div>
  </div>`
 const read=<T extends HTMLElement=HTMLElement>(selector:string)=>mount.querySelector<T>(selector)!
 const pads=[...mount.querySelectorAll<HTMLButtonElement>('.sync-pads button')]
 const rails=[...mount.querySelectorAll<HTMLElement>('.sync-rail')]
 const score=read('[data-score]'),combo=read('[data-combo]'),bestText=read('[data-best]'),time=read('[data-time]')
 const status=read('[data-feedback]'),play=read<HTMLButtonElement>('[data-play]'),restart=read<HTMLButtonElement>('[data-restart]'),result=read('[data-result]')
 const lights=new Map<Note,HTMLElement>()
 let run:SyncRun|undefined
 let highScore=best
 let complete:ReturnType<ActivityServices['beginAttempt']>
 let flashUntil=0
 let paused=false
 const clock=new ActivityClock(update)
 bestText.textContent=highScore?.toLocaleString()??'—'

 function clearLights(){
  for(const node of lights.values())node.remove()
  lights.clear()
  pads.forEach(pad=>pad.removeAttribute('data-ready'))
 }

 function showJudgement(judgement:Judgement){
  status.textContent=feedback[judgement]
  status.dataset.judgement=judgement
  flashUntil=clock.time+550
  if(judgement==='miss')tone(147,.12)
 }

 function press(lane:number){
  if(!run||!clock.running)return
  run.strike(lane,clock.time)
  if(status.dataset.judgement!=='miss')tone(lanes[lane].pitch*2,.2)
 }

 function update(elapsed:number){
  const session=run!
  session.expire(elapsed)
  score.textContent=String(session.score)
  combo.textContent=String(session.streak)
  time.textContent='0:'+String(Math.max(0,Math.ceil((duration-elapsed)/1_000))).padStart(2,'0')
  if(elapsed>=duration){finish(session);return}
  if(elapsed>=flashUntil){
   status.textContent=elapsed<1_600?'預備 · READY':elapsed<16_000?'暖身 · WARM UP':elapsed<32_000?'加速 · ACCELERATE':'共振 · RESONANCE'
   delete status.dataset.judgement
  }
  const ready=new Set<number>()
  for(const [note,node] of lights){
   if(note.result){node.remove();lights.delete(note)}
  }
  for(const note of session.notes){
   const until=note.time-elapsed
   if(until>preview)break
   if(note.result)continue
   if(until<=0&&!note.cued){
    note.cued=true
    if(-until<=note.window)tone(lanes[note.lane].pitch,.1)
   }
   if(Math.abs(until)<=note.window)ready.add(note.lane)
   let light=lights.get(note)
   if(!light){
    light=document.createElement('i')
    light.textContent=lanes[note.lane].symbol
    rails[note.lane].append(light)
    lights.set(note,light)
   }
   const progress=Math.min(1,1-until/preview)
   light.style.top=reducedMotion?(progress>=.78?'100%':'42%'):`${progress*100}%`
   light.toggleAttribute('data-onbeat',until<=0)
  }
  pads.forEach((pad,index)=>pad.toggleAttribute('data-ready',ready.has(index)))
 }

 function finish(session:SyncRun){
  clock.pause()
  clearLights()
  const earned=complete(session.score)
  highScore=Math.max(highScore??0,session.score)
  bestText.textContent=highScore.toLocaleString()
  status.textContent='回合完成 · SESSION COMPLETE'
  delete status.dataset.judgement
  result.hidden=false
  result.textContent=`同步 ${session.hits}/${session.notes.length} · 最長連擊 ${session.longest}${earned?.personalBest?' · 個人新紀錄':''}${earned?.reward?' · 已收藏 '+earned.reward:''}`
  play.hidden=true
  restart.focus()
  run=undefined
  tone(658,.28)
 }

 function start(){
  clock.reset()
  complete=beginAttempt()
  clearLights()
  run=new SyncRun(showJudgement)
  paused=false
  flashUntil=0
  result.hidden=true
  play.hidden=true
  restart.hidden=false
  clock.play()
  update(0)
  pads[0].focus()
  tone(220,.16)
 }

 function pause(){
  if(!clock.running)return
  clock.pause()
  paused=true
  play.textContent='繼續挑戰'
  play.hidden=false
  status.textContent='挑戰已暫停'
  delete status.dataset.judgement
 }

 function resume(){
  if(!paused){start();return}
  paused=false
  play.hidden=true
  pads[0].focus()
  clock.play()
 }

 const input=new AbortController()
 document.addEventListener('keydown',event=>{
  const lane=keys.indexOf(event.code)
  if(lane<0||!clock.running)return
  event.preventDefault()
  if(!event.repeat)press(lane)
 },{signal:input.signal})
 pads.forEach((pad,lane)=>pad.onclick=()=>press(lane))
 play.onclick=resume
 restart.onclick=start
 play.focus()
 return {pause,dispose(){clock.pause();input.abort();clearLights()}}
}
