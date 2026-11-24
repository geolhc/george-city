export const dishes=[
 {id:'toast',name:'西多士'},
 {id:'bun',name:'菠蘿油'},
 {id:'tart',name:'蛋撻'},
] as const
export const drinks=[
 {id:'milk-tea',name:'熱奶茶'},
 {id:'lemon-tea',name:'凍檸茶'},
 {id:'yuenyeung',name:'熱鴛鴦'},
] as const
export type Dish=typeof dishes[number]['id']
export type Drink=typeof drinks[number]['id']
const menu=[
 {guest:'電車車長',line:'唔該，西多士加熱奶茶，我夠鐘開車喇。',dish:'toast',drink:'milk-tea'},
 {guest:'碼頭學生',line:'凍檸茶照落冰，配個蛋撻就啱啱好。',dish:'tart',drink:'lemon-tea'},
 {guest:'放映師',line:'我要菠蘿油同熱鴛鴦，陣間搬菲林先有力。',dish:'bun',drink:'yuenyeung'},
 {guest:'花燈學徒',line:'唔該一份西多士、一杯凍檸茶，今晚要趕起花燈。',dish:'toast',drink:'lemon-tea'},
 {guest:'渡輪工程師',line:'啱啱埋岸，想食個蛋撻，飲杯熱鴛鴦暖吓。',dish:'tart',drink:'yuenyeung'},
 {guest:'夜更郵差',line:'仲有菠蘿油呀？加杯熱奶茶吖，唔該晒。',dish:'bun',drink:'milk-tea'},
] as const

export const ticketsPerShift=5
export const ticketTime=12_000
export const serviceBreak=1_150

export class CafeRun {
 index=0
 served=0
 score=0
 deadline=ticketTime
 nextAt=0
 private errors=0
 constructor(private readonly offset:number){}

 get order(){return menu[(this.offset+this.index)%menu.length]}
 get done(){return this.index>=ticketsPerShift}

 deliver(dish:Dish|undefined,drink:Drink|undefined,time:number){
  if(this.done||this.nextAt||time>=this.deadline||!drink||!dish)return
  if(dish!==this.order.dish||drink!==this.order.drink){
   this.errors++
   return 'wrong'
  }
  this.score+=Math.max(40,100+Math.floor(40*(this.deadline-time)/ticketTime)-this.errors*25)
  this.served++
  this.nextAt=time+serviceBreak
  return 'served'
 }

 update(time:number){
  if(this.done)return
  if(!this.nextAt&&time>=this.deadline){
   this.nextAt=time+serviceBreak
   return 'late'
  }
  if(this.nextAt&&time>=this.nextAt){
   this.index++
   this.nextAt=0
   this.errors=0
   this.deadline=time+ticketTime
   return this.done?'finished':'order'
  }
 }
}
