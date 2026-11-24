import {decode,fresh,type State} from './game'
export const saveKey='george-city.v1'
type Store=Pick<Storage,'getItem'|'setItem'>
export function load(store:Store):{state:State;notice:string;writable:boolean}{
 let notice=''
 try{
  const raw=store.getItem(saveKey)
  if(raw){
   const version=JSON.parse(raw)?.version
   if(typeof version==='number'&&version>1)return {state:fresh(),notice:'存檔版本較新；本次遊玩不會覆寫。',writable:false}
  }
  if(raw)notice='存檔未能讀取，已開始新旅程。'
  const state=decode(raw)
  if(state)return {state,notice:'',writable:true}
 }catch{notice='存檔未能讀取；請檢查瀏覽器儲存設定。'}
 try{
  const backup=decode(store.getItem(saveKey+'.backup'))
  if(backup)return {state:backup,notice:'已從備份還原進度。',writable:true}
 }catch{}
 return {state:fresh(),notice,writable:true}
}
export function persist(store:Store,state:State){
 const raw=JSON.stringify(state)
 if(!decode(raw))throw Error('Invalid game state')
 const old=store.getItem(saveKey)
 if(decode(old))store.setItem(saveKey+'.backup',old!)
 store.setItem(saveKey,raw)
}
