// Bound catch-up after stalls; never advance hidden or paused sessions.
export class SimulationClock {
 private remainder=0
 reset(){this.remainder=0}
 advance(seconds:number,update:(dt:number)=>void){
  this.remainder+=Math.max(0,Math.min(.25,seconds))
  while(this.remainder+1e-9>=1/60){update(1/60);this.remainder-=1/60}
 }
}
