import {challenges} from '../progression'
import {ActivityClock} from './clock'
import {CafeRun,dishes,drinks,ticketTime,ticketsPerShift,type Dish,type Drink} from './cafe-score'
import type {ActivityServices} from './portal'
import './cafe.css'

export function mountActivity({mount,best,runs,tone,beginAttempt}:ActivityServices){
 mount.innerHTML=`
  <div class="activity-intro"><strong>MOONTIDE CAFÉ · 機械侍應夜更</strong><p>睇清楚張餐紙，揀一份食物同一杯嘢飲，再撳「出餐」。</p></div>
  <dl class="activity-metrics"><div><dt>餐紙</dt><dd data-order-count>—</dd></div><div><dt>分數</dt><dd data-score>0</dd></div><div><dt>個人最佳</dt><dd data-best>—</dd></div><div><dt>限時</dt><dd data-time>12s</dd></div></dl>
  <div class="cafe-counter">
   <div class="cafe-ticket">
    <div class="cafe-bot" aria-hidden="true"><i></i></div>
    <div><strong data-guest>機械侍應 · 阿叮</strong><p data-dialogue role="status">今晚碼頭收工，實多人嚟。幫手接五張單吖！</p></div>
   </div>
   <div class="cafe-menu" aria-label="餐牌">
    <div role="group" aria-label="食物">${dishes.map(item=>itemButton(item,'dish')).join('')}</div>
    <div role="group" aria-label="飲品">${drinks.map(item=>itemButton(item,'drink')).join('')}</div>
   </div>
  </div>
  <div class="activity-toolbar"><p data-feedback role="status">達到 ${challenges.cafe.goal.toLocaleString('en-HK')} 分可收藏${challenges.cafe.item}。</p><button data-play>開檔</button><button data-restart hidden>重新開始</button><button class="serve" hidden>出餐</button></div>
  <div class="activity-result" data-result role="status" hidden></div>`
 function itemButton(item:{id:string;name:string},group:string){
  return `<button type="button" data-${group}="${item.id}" aria-pressed="false" disabled><i class="cafe-icon ${item.id}" aria-hidden="true"></i><span>${item.name}</span></button>`
 }
 const read=<T extends HTMLElement=HTMLElement>(selector:string)=>mount.querySelector<T>(selector)!
 const score=read('[data-score]'),bestText=read('[data-best]'),timer=read('[data-time]'),orderCount=read('[data-order-count]')
 const guest=read('[data-guest]'),dialogue=read('[data-dialogue]'),status=read('[data-feedback]'),result=read('[data-result]')
 const play=read<HTMLButtonElement>('[data-play]'),restart=read<HTMLButtonElement>('[data-restart]'),serve=read<HTMLButtonElement>('.serve')
 const dishButtons=[...mount.querySelectorAll<HTMLButtonElement>('[data-dish]')]
 const drinkButtons=[...mount.querySelectorAll<HTMLButtonElement>('[data-drink]')]
 const clock=new ActivityClock(update)
 let shift:CafeRun|undefined,dish:Dish|undefined,drink:Drink|undefined
 let highScore=best
 let complete:ReturnType<ActivityServices['beginAttempt']>
 let nextShift=runs
 let paused=false
 let previousFeedback=''
 bestText.textContent=highScore?.toLocaleString()??'—'

 function select(){
  const disabled=!clock.running||!!shift?.nextAt
  for(const button of dishButtons){
   button.setAttribute('aria-pressed',String(button.dataset.dish===dish))
   button.disabled=disabled
  }
  for(const button of drinkButtons){
   button.setAttribute('aria-pressed',String(button.dataset.drink===drink))
   button.disabled=disabled
  }
  serve.disabled=disabled||!drink||!dish
 }

 function order(){
  const session=shift!
  dish=drink=undefined
  orderCount.textContent=(session.index+1)+'/'+ticketsPerShift
  guest.textContent=session.order.guest
  dialogue.textContent='「'+session.order.line+'」'
  status.textContent='揀食物同飲品'
  delete status.dataset.judgement
  select()
 }

 function finish(){
  const session=shift!
  clock.pause()
  const earned=complete(session.score)
  highScore=Math.max(highScore??0,session.score)
  bestText.textContent=highScore.toLocaleString()
  status.textContent='收檔 · 多謝幫手！'
  delete status.dataset.judgement
  result.hidden=false
  result.textContent=`出餐 ${session.served}/${ticketsPerShift}${earned?.personalBest?' · 個人新紀錄':''}${earned?.reward?' · 已收藏 '+earned.reward:''}`
  serve.hidden=true
  select()
  restart.focus()
  tone(698,.32)
 }

 function update(elapsed:number){
  const session=shift!
  const change=session.update(elapsed)
  const remaining=session.nextAt?0:Math.max(0,session.deadline-elapsed)
  timer.textContent=Math.ceil(remaining/1_000)+'s'
  timer.toggleAttribute('data-urgent',remaining>0&&remaining<=3_000)
  if(change==='finished'){finish();return}
  if(change==='order')order()
  if(change==='late'){
   status.textContent='超時喇，準備接下一張單。'
   status.dataset.judgement='miss'
   select()
   tone(155,.24)
  }
 }

 function deliver(){
  const judgement=shift?.deliver(dish,drink,clock.time)
  if(!judgement)return
  if(judgement==='served'){
   score.textContent=String(shift!.score)
   status.textContent='叮！啱單，多謝晒。'
   status.dataset.judgement='perfect'
   tone(587,.25)
  }else{
   status.textContent='呢張單唔啱，對一對餐紙再出。'
   status.dataset.judgement='miss'
   tone(185,.16)
  }
  select()
 }

 function start(){
  clock.reset()
  complete=beginAttempt()
  paused=false
  shift=new CafeRun(nextShift++)
  score.textContent='0'
  timer.textContent=ticketTime/1_000+'s'
  play.hidden=true
  restart.hidden=false
  result.hidden=true
  serve.hidden=false
  clock.play()
  order()
  dishButtons[0].focus()
  tone(440,.2)
 }

 function pause(){
  if(!clock.running)return
  clock.pause()
  paused=true
  play.textContent='繼續當值'
  play.hidden=false
  previousFeedback=status.textContent??''
  status.textContent='暫停接單'
  delete status.dataset.judgement
  select()
 }

 play.onclick=()=>{
  if(!paused){start();return}
  paused=false
  play.hidden=true
  status.textContent=previousFeedback
  clock.play()
  select()
  restart.focus()
 }
 restart.onclick=start
 serve.onclick=deliver
 for(const choice of dishButtons)choice.onclick=()=>{dish=choice.dataset.dish as Dish;select()}
 for(const choice of drinkButtons)choice.onclick=()=>{drink=choice.dataset.drink as Drink;select()}
 play.focus()
 return {pause,dispose(){clock.pause()}}
}
