import {discoveries} from './city-content'
import {validPulse,type PulseRun} from './pulse'

export const challenges = {
 sync: {name:'NOVA SYNC', item:'共振晶片', goal:1600, xp:60},
 cafe: {name:'月潮冰室', item:'夜更茶牌', goal:300, xp:50},
 delivery: {name:'速遞搭把手', item:'速遞紀念章', goal:1, xp:35},
 energy: {name:'光網搶修', item:'光網維修章', goal:1, xp:40},
}
export type Challenge = keyof typeof challenges
export interface ChallengeRecord {runs:number; best:number}
export interface CityProgress {
 stamps:string[]
 pulse:PulseRun|null
 records:Partial<Record<Challenge,ChallengeRecord>>
}
const stampIds=new Set(discoveries.map(site=>site.id))

export const freshProgress = ():CityProgress => ({stamps:[],records:{},pulse:null})

export function validProgress(value:unknown):value is CityProgress {
 if(!value||typeof value!=='object')return false
 const {stamps,records,pulse}=value as CityProgress
 return validPulse(pulse)&&Array.isArray(stamps)&&stamps.every(s=>stampIds.has(s))&&
  new Set(stamps).size===stamps.length&&!!records&&typeof records==='object'&&!Array.isArray(records)&&
  Object.entries(records).every(([id,record])=>Object.prototype.hasOwnProperty.call(challenges,id)&&!!record&&
   Number.isSafeInteger(record.runs)&&record.runs>0&&Number.isSafeInteger(record.best)&&record.best>=0)
}

export function recordCompletion(city:CityProgress,id:Challenge,score:number) {
 const old=city.records[id]
 const best=Math.max(old?.best??0,score)
 city.records[id]={runs:(old?.runs??0)+1,best}
 return {
  personalBest:!old||score>old.best,
  reward:score>=challenges[id].goal&&(old?.best??-1)<challenges[id].goal?challenges[id].item:undefined,
 }
}

export function cityRewards(city:CityProgress) {
 return (Object.keys(challenges) as Challenge[]).filter(id=>(city.records[id]?.best??0)>=challenges[id].goal)
}

export function cityXP(city:CityProgress) {
 return city.stamps.length*15+cityRewards(city).reduce((xp,id)=>xp+challenges[id].xp,0)
}
