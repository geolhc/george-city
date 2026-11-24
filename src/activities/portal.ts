import type {AudioCity} from '../audio'
import type {CityProgress, recordCompletion} from '../progression'
import './activity.css'

export type ActivityId = 'sync'|'cafe'
type CompletionReporter=(score:number)=>ReturnType<typeof recordCompletion>|undefined
export interface ActivityServices {
 mount:HTMLElement
 reducedMotion:boolean
 best:number|undefined
 runs:number
 tone:(frequency:number, duration?:number)=>void
 beginAttempt:()=>CompletionReporter
}
export interface ActivitySession {
 pause():void
 dispose():void
}
interface ActivityModule {mountActivity(services:ActivityServices):ActivitySession}

const loaders:Record<ActivityId,()=>Promise<ActivityModule>> = {
 sync:()=>import('./sync'),
 cafe:()=>import('./cafe'),
}

/** A portal owns one lazy module and its resources. The city owns its own state. */
export class ActivityPortal {
 private current?:{session?:ActivitySession; focus:HTMLElement|null}
 private readonly body:HTMLElement
 private readonly sound:HTMLButtonElement

 constructor(
  private readonly dialog:HTMLDialogElement,
  private readonly audio:AudioCity,
  private readonly city:CityProgress,
  private readonly resumeCity:(playing:boolean)=>void,
  private readonly onCompletion:(id:ActivityId,score:number)=>ReturnType<typeof recordCompletion>,
 ){
  this.body=dialog.querySelector('main')!
  this.sound=dialog.querySelector('[data-sound]')!
  dialog.querySelector<HTMLButtonElement>('[data-exit]')!.onclick=()=>this.exit()
  this.sound.onclick=()=>{
   audio.fx=!audio.fx
   this.updateSound()
   if(audio.fx)audio.chime()
   else audio.silence()
  }
  dialog.addEventListener('cancel',event=>{event.preventDefault();this.exit()})
  window.addEventListener('blur',()=>this.pause())
  document.addEventListener('visibilitychange',()=>{if(document.hidden)this.pause()})
 }

 get active(){return !!this.current}

 async enter(id:ActivityId,title:string,reducedMotion:boolean) {
  if(this.current)return
  const entry={session:undefined as ActivitySession|undefined,focus:document.activeElement as HTMLElement|null}
  this.current=entry
  this.resumeCity(false)
  this.audio.setActivity(true)
  this.dialog.querySelector('h2')!.textContent=title
  this.dialog.className=id
  this.dialog.toggleAttribute('data-reduced',reducedMotion)
  this.updateSound()
  this.body.textContent='載入中…'
  this.dialog.showModal()
  try {
   const module=await loaders[id]()
   if(this.current!==entry)return
   let attempt=0
   entry.session=module.mountActivity({
    mount:this.body,reducedMotion,best:this.city.records[id]?.best,runs:this.city.records[id]?.runs??0,
    tone:(hz,duration)=>{if(this.current===entry)this.audio.effect(hz,duration)},
    beginAttempt:()=>{
     const started=++attempt
     let reported=false
     return score=>{
      if(this.current!==entry||started!==attempt||reported||!Number.isSafeInteger(score)||score<0)return
      reported=true
      return this.onCompletion(id,score)
     }
    },
   })
  } catch(error) {
   if(this.current!==entry)return
   console.error(error)
   this.body.textContent='未能開啟活動。返返街上，行近入口再試吖。'
  }
 }

 private updateSound(){
  this.sound.textContent=this.audio.fx?'音效 開':'音效 關'
  this.sound.setAttribute('aria-pressed',String(this.audio.fx))
 }

 private pause(){
  if(!this.current)return
  this.current.session?.pause()
  this.audio.silence()
 }

 private exit(){
  const entry=this.current
  if(!entry)return
  this.current=undefined
  try{entry.session?.dispose()}finally{
   this.body.replaceChildren()
   this.dialog.close()
   this.audio.setActivity(false)
   this.resumeCity(true)
   const focus=entry.focus===document.body?document.querySelector<HTMLElement>('#act'):entry.focus
   focus?.focus({preventScroll:true})
  }
 }
}
