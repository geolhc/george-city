import {discoveries,venues} from './city-content'
import {clear,distance,labels,type Point} from './world'
import type {State} from './game'

export const scanRange=8.5

export function scanAt(position:Point,stamps:string[]){
 const signals=discoveries.filter(site=>{
  if(distance(position,site)>scanRange)return false
  for(let fraction=.15;fraction<1;fraction+=.15){
   if(!clear(position.x+(site.x-position.x)*fraction,position.z+(site.z-position.z)*fraction,.05))return false
  }
  return true
 }).sort((a,b)=>distance(position,a)-distance(position,b))
 const earned=signals.filter(site=>!stamps.includes(site.id))
 stamps.push(...earned.map(site=>site.id))
 return {signals,earned}
}

export type GuideMode='open'|'compact'|'off'
type GuideMoment='arrival'|'arcade'|'cafe'|'hint'|'discovery'|'reward'
/** Authored responses read game state. Future providers can use the same moments. */
export interface NovaDialogueProvider {reply(state:Readonly<State>,moment:GuideMoment,subject?:string):string}
export const novaDialogue:NovaDialogueProvider={
 reply(state,moment,subject){
  switch(moment){
   case 'arrival':return '我係 NOVA。招牌亮住就行埋去睇吓，㩒掃描仲會搵到街坊留低嘅故事。'
   case 'arcade':return state.city.records.sync?'機舖仲開緊。今次挑戰吓自己個紀錄？':'聽唔聽到共振機把聲？行埋青色門框，就入到 PLAYVERSE。'
   case 'cafe':return state.city.records.cafe?'夜更仲未完。想幫機械侍應多執幾張單？':'冰室出餐鐘響喇！去櫃檯幫手執奶茶同多士吖。'
   case 'discovery':return '搵到喇！「'+subject+'」已經收錄喺 City OS 嘅掃描手帳。'
   case 'reward':return '做得好！「'+subject+'」已經放入你嘅 City ID 收藏。'
   case 'hint':return state.active?'下一步係「'+labels[state.active.id][state.active.stage]+'」。跟小地圖嗰粒金點行就得。':'想四圍行吓？由南街開始，兩邊有機舖同冰室。'
  }
 },
}

export function guideNearby(state:State):'arcade'|'cafe'|undefined {
 if(distance(state.player,venues.sync)<=6.5)return 'arcade'
 if(distance(state.player,venues.cafe)<=6.5)return 'cafe'
}
