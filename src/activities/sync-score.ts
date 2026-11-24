export const duration=48_000
export const leadIn=1_600
export const preview=900
export const lanes=[
 {key:'D',code:'KeyD',symbol:'◈',pitch:261.63},
 {key:'F',code:'KeyF',symbol:'●',pitch:329.63},
 {key:'J',code:'KeyJ',symbol:'▲',pitch:392},
 {key:'K',code:'KeyK',symbol:'✦',pitch:523.25},
]
const phrases=[
 {until:16_000,step:600,pattern:[0,-1,1,-1,2,-1,3,-1,1,-1,0,-1,3,-1,2,-1],window:245},
 {until:32_000,step:500,pattern:[0,1,-1,2,3,-1,3,2,-1,1,0,-1,0,2,-1,1,3,-1],window:205},
 {until:47_500,step:430,pattern:[0,2,1,-1,3,3,1,-1,2,0,3,-1,1,2,0,-1],window:175},
]
export type Judgement='perfect'|'good'|'miss'
export interface Note {time:number; lane:number; window:number; result?:Judgement; cued?:boolean}

export function makeChart():Note[]{
 const chart:Note[]=[]
 let beat=leadIn
 for(const phrase of phrases){
  let step=0
  for(;beat<phrase.until;beat+=phrase.step){
   const lane=phrase.pattern[step++%phrase.pattern.length]
   if(lane>=0)chart.push({time:beat,lane,window:phrase.window})
  }
 }
 return chart
}

export class SyncRun {
 readonly notes=makeChart()
 score=0
 streak=0
 longest=0
 hits=0
 constructor(private readonly onJudgement:(result:Judgement)=>void=()=>{}){}

 expire(time:number){
  for(const note of this.notes){
   if(note.time>time)break
   if(!note.result&&time>note.time+note.window){
    note.result='miss'
    this.judge('miss')
   }
  }
 }

 strike(lane:number,time:number){
  this.expire(time)
  let target:Note|undefined
  for(const note of this.notes){
   if(note.time>time+245)break
   const error=Math.abs(note.time-time)
   if(note.lane===lane&&!note.result&&error<=note.window&&(!target||error<Math.abs(target.time-time)))target=note
  }
  if(!target){this.judge('miss');return}
  target.result=Math.abs(target.time-time)<=target.window*.38?'perfect':'good'
  this.judge(target.result)
 }

 private judge(result:Judgement){
  if(result==='miss'){
   this.streak=0
   this.score=Math.max(0,this.score-15)
  }else{
   this.streak++
   this.hits++
   this.longest=Math.max(this.longest,this.streak)
   this.score+=(result==='perfect'?100:60)+Math.min(this.streak-1,20)*2
  }
  this.onJudgement(result)
 }
}
