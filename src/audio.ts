export class AudioCity{
 music=false;voice=false;fx=false
 private ctx?:AudioContext
 private timer=0
 private index=0
 private tone(hz:number,duration:number,volume:number,type:OscillatorType){
  if(!this.ctx)this.ctx=new AudioContext()
  if(this.ctx.state==='suspended')void this.ctx.resume()
  const t=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain()
  o.type=type;o.frequency.value=hz;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(volume,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(this.ctx.destination);o.start(t);o.stop(t+duration)
 }
 toggleMusic(){this.music=!this.music;clearInterval(this.timer)
  if(this.music){const beat=()=>{if(document.hidden)return;const n=[62,69,72,76,74,69,65,67,62,67,70,77,74,70,67,69][this.index++%16];this.tone(440*2**((n-69)/12),.45,.027,'triangle');if(this.index%4===1)this.tone(73.42,.8,.045,'sine')};beat();this.timer=window.setInterval(beat,310)}
 }
 chime(){if(this.fx)this.tone(783.99,.28,.05,'sine')}
 say(line:string){if(!this.voice||!('speechSynthesis'in window))return;const v=speechSynthesis.getVoices().find(v=>/yue|zh[-_]HK/i.test(v.lang));if(!v)return;const u=new SpeechSynthesisUtterance(line);u.voice=v;u.lang=v.lang;speechSynthesis.cancel();speechSynthesis.speak(u)}
}
