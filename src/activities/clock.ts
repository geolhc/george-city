/** A foreground-only monotonic clock. Resuming never counts time spent paused. */
export class ActivityClock {
 private elapsed=0
 private startedAt=0
 private frame=0
 running=false

 constructor(private readonly update:(elapsed:number)=>void){}

 get time(){return this.elapsed+(this.running?performance.now()-this.startedAt:0)}

 play(){
  if(this.running)return
  this.startedAt=performance.now()
  this.running=true
  const frame=()=>{
   this.update(this.time)
   if(this.running)this.frame=requestAnimationFrame(frame)
  }
  this.frame=requestAnimationFrame(frame)
 }

 pause(){
  this.elapsed=this.time
  this.running=false
  cancelAnimationFrame(this.frame)
 }

 reset(){
  this.pause()
  this.elapsed=0
 }
}
