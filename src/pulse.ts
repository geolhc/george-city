import {pulseRoutes,type PulseId} from './city-content'
import type {CityProgress} from './progression'
import {distance,type Point} from './world'

export interface PulseRun {id:PulseId;stage:number}
export const frequencies=['低頻　●','中頻　▲','高頻　◆']
export const pulseRange=2.7

export function validPulse(value:unknown):value is PulseRun|null {
 if(value===null)return true
 if(!value||typeof value!=='object')return false
 const {id,stage}=value as PulseRun
 return (id==='delivery'||id==='energy')&&Number.isInteger(stage)&&stage>=0&&stage<pulseRoutes[id].stops.length
}

export function startPulse(city:CityProgress,id:PulseId,at:Point){
 if(city.pulse||distance(at,pulseRoutes[id].start)>pulseRange)return false
 city.pulse={id,stage:0}
 return true
}

export function targetFrequency(city:CityProgress){
 return ((city.pulse?.stage??0)+(city.records.energy?.runs??0)+1)%frequencies.length
}

export function advancePulse(city:CityProgress,at:Point,frequency?:number){
 const run=city.pulse
 if(!run||distance(at,pulseRoutes[run.id].stops[run.stage])>pulseRange)return 'none'
 if(run.id==='energy'&&frequency!==targetFrequency(city))return 'mismatch'
 if(++run.stage<pulseRoutes[run.id].stops.length)return 'next'
 city.pulse=null
 return 'finish'
}
