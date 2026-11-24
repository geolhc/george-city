import {freshProgress,validProgress,type CityProgress} from './progression'
import {clear,park,garage,sites,starts,rewards,distance,type Player,type Point} from './world'
export interface Run {id:number; stage:number; elapsed:number; wires:number[]}
export interface State {
 version:1; player:Player; clock:number; credits:number; records:Record<number,number>;
 active:Run|null; outfit:number; discovered:string[]; talks:Record<string,number>;
 cars:Point[]; ride:number; teaUntil:number; city:CityProgress
}
export const fresh=():State=>({version:1,player:{x:0,z:-25,heading:0,speed:0,driving:false},clock:0,credits:0,records:{},active:null,outfit:0,discovered:[],talks:{},cars:[{...park},{...garage}],ride:0,teaUntil:0,city:freshProgress()})
export const inRace=(s:State)=>s.active?.id===3
export const boostedVehicle=(s:State)=>inRace(s)||s.ride===1
export function decode(raw:string|null):State|null{
 try{
  const s=JSON.parse(raw||'null') as State
  if(!s||s.version!==1||!s.player||!s.records||!s.talks||!Array.isArray(s.discovered)||!Array.isArray(s.cars)||s.cars.length!==2||!Number.isFinite(s.clock)||!Number.isFinite(s.credits))return null
  const a=s.active
  if(a&&(!sites[a.id]||!sites[a.id][a.stage]||!Array.isArray(a.wires)||a.wires.length!==3||!Number.isFinite(a.elapsed)))return null
  if(!clear(s.player.x,s.player.z,.19,inRace(s))||!Number.isFinite(s.player.heading))return null
  const nonnegative=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v)&&v>=0
  const record=(v:unknown)=>!!v&&typeof v==='object'&&!Array.isArray(v)
  if((s.active!==null&&!record(s.active))||!Number.isFinite(s.player.x)||!Number.isFinite(s.player.z)||!record(s.records)||!record(s.talks)||!nonnegative(s.clock)||!nonnegative(s.credits)||
    !Number.isFinite(s.player.speed)||typeof s.player.driving!=='boolean'||
    ![0,1].includes(s.ride)||!Number.isInteger(s.outfit)||s.outfit<0||s.outfit>5||
    !nonnegative(s.teaUntil)||!s.discovered.every(v=>typeof v==='string')||
    !s.cars.every(v=>v&&Number.isFinite(v.x)&&Number.isFinite(v.z)&&clear(v.x,v.z,.19))||
    !Object.entries(s.records).every(([k,v])=>/^[0-4]$/.test(k)&&nonnegative(v))||
    !Object.values(s.talks).every(nonnegative)||
    (a&&(!Number.isInteger(a.id)||!Number.isInteger(a.stage)||!nonnegative(a.elapsed)||
      !a.wires.every(v=>Number.isInteger(v)&&v>=0&&v<=3)))||
    (inRace(s)&&!s.player.driving))return null
  if(s.city===undefined)s.city=freshProgress()
  if(!validProgress(s.city))return null
  return s
 }catch{return null}
}
export const restore=(raw:string|null):State=>decode(raw)??fresh()
export function start(s:State,id:number){
 if(s.active||!sites[id])return false
 s.active={id,stage:id===3?1:0,elapsed:0,wires:[0,2,0]}
 if(id===3)Object.assign(s.player,sites[3][0],{heading:0,speed:0,driving:true})
 return true
}
export function leave(s:State){
 if(inRace(s))Object.assign(s.player,starts[3],{heading:0,speed:0,driving:false})
 s.active=null
}
export function advance(s:State):'none'|'step'|'finish'{
 const a=s.active
 if(!a||distance(s.player,sites[a.id][a.stage])>(a.id===3?3:3.25))return 'none'
 if(a.id===2&&!a.wires.every(n=>n===1))return 'none'
 if(a.id===0&&!s.discovered.includes('landmark-'+a.stage))s.discovered.push('landmark-'+a.stage)
 if(++a.stage<sites[a.id].length)return 'step'
 if(s.records[a.id]===undefined)s.credits+=rewards[a.id]
 s.records[a.id]=Math.min(s.records[a.id]??Infinity,a.elapsed)
 leave(s);return 'finish'
}
export function dismount(s:State){
 const p=s.player
 if(inRace(s))return false
 for(let i=0;i<12;i++){
  const ang=p.heading+Math.PI/2+i*Math.PI/6,x=p.x+2*Math.sin(ang),z=p.z+2*Math.cos(ang)
  if(clear(x,z)){s.cars[s.ride]={x:p.x,z:p.z};Object.assign(p,{x,z,speed:0,driving:false});return true}
 }
 return false
}
export const citizens=[
 {name:'阿晴',job:'菲林修復師',color:'#d47b7d',line:'影招牌記得企後兩步，連埋騎樓先夠味。',again:'你又嚟喇！碼頭嗰盞燈，我細個已經喺度。'},
 {name:'肥波',job:'速遞站長',color:'#d69f4d',line:'阿轆一聽到電器舖播歌，就會兜路去聽㗎。',again:'辛苦晒，得閒過嚟飲杯凍檸茶。'},
 {name:'小滿',job:'花燈師傅',color:'#6cb8ac',line:'今晚行花燈呀，第一盞魚仔就喺北街。',again:'你睇下個燈影，隻魚好似識游咁。'},
 {name:'阿澄',job:'車房學徒',color:'#9392d3',line:'入彎鬆一鬆油門，架車就聽話好多。',again:'你又落場？今次試下早少少轉彎。'}
]
export interface DialogueProvider {reply(s:State,index:number):string}
export const authored:DialogueProvider={reply(s,i){
 const person=citizens[i];const met=s.talks[person.name]||0;s.talks[person.name]=met+1
 if(i===1&&s.active?.id===1)return s.active.stage?'阿轆！你返嚟喇，快啲帶佢去站頭。':'試吓去北面電器舖，佢鍾意聽收音機。'
 if(i===0&&s.city.stamps.includes('cinema-reel'))return '你搵到潮聲嗰盒菲林呀？聽晚落雨，我哋會再放一次。'
 if(i===0&&s.city.records.cafe?.runs)return '多得你頂住冰室夜更，我先趕得切修完最後一卷菲林。'
 if(i===1&&s.city.records.delivery?.runs)return '個包裹收到喇。你熟路過我嗰班速遞機械人添！'
 if(i===2&&s.city.records.energy?.runs)return '你校準咗光網？睇下，啲魚燈連尾都著返晒。'
 if(i===2&&s.records[2]!==undefined)return '月輪著返喇，今晚啲花燈襯到絕！'
 if(i===3&&s.city.records.sync?.runs)return '共振機舖嗰套光鍵好考手勢呀。你下次試吓跟耳仔打拍子。'
 return met?person.again:person.line
}}
// Hours are Hong Kong district time. Each resident walks the last portion of
// a leg and spends the rest of the shift at their current stop.
const schedules=[
 {x:-8.2,stops:[[0,-17],[8,-25],[14,-16],[18,-22],[21,-10],[23,-17]]},
 {x:8.6,stops:[[0,-3],[6,-14],[12,1],[18,-13],[20.5,-4],[22,8],[23.7,-3]]},
 {x:-9,stops:[[0,13],[7,23],[14,18],[19,-4],[20.6,6],[22,14],[23.8,13]]},
 {x:8.2,stops:[[0,13],[8,19],[14,6],[18,14],[20.8,24],[22,18],[23.7,13]]},
]
export function npcAt(index:number,time:number){
 const {x,stops}=schedules[index]
 const hour=(20+time/30)%24
 let current=stops.length-1
 while(hour<stops[current][0])current--
 const [,z]=stops[current]
 const [nextHour,destination]=stops[current+1]??[24,stops[0][1]]
 const left=(nextHour-hour)*30
 const reach=Math.min(1,Math.max(0,1-left*1.25/Math.abs(destination-z)))
 const walking=reach>0
 return {x,z:z+(destination-z)*reach,walking,heading:walking?(destination>z?0:Math.PI):(x>0?-Math.PI/2:Math.PI/2)}
}
