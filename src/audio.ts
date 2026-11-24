export class AudioCity {
 music=false
 voice=false
 fx=false
 private ctx?:AudioContext
 private timer=0
 private index=0
 private activity=false
 private playing=new Set<OscillatorNode>()

 private tone(hz:number,duration:number,volume:number,type:OscillatorType){
  if(document.hidden)return
  if(!this.ctx)this.ctx=new AudioContext()
  if(this.ctx.state==='suspended')void this.ctx.resume().catch(()=>{})
  const t=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain()
  o.type=type
  o.frequency.value=hz
  g.gain.setValueAtTime(.0001,t)
  g.gain.exponentialRampToValueAtTime(volume,t+.02)
  g.gain.exponentialRampToValueAtTime(.0001,t+duration)
  o.connect(g)
  g.connect(this.ctx.destination)
  this.playing.add(o)
  o.onended=()=>{this.playing.delete(o);o.disconnect();g.disconnect()}
  o.start(t)
  o.stop(t+duration)
 }

 private beat(){
  if(this.activity||document.hidden)return
  const notes=[62,69,72,76,74,69,65,67,62,67,70,77,74,70,67,69]
  const note=notes[this.index++%notes.length]
  this.tone(440*2**((note-69)/12),.45,.027,'triangle')
  if(this.index%4===1)this.tone(73.42,.8,.045,'sine')
 }

 private updateMusic(){
  clearInterval(this.timer)
  if(this.music&&!this.activity&&!document.hidden)this.timer=window.setInterval(()=>this.beat(),310)
 }

 toggleMusic(){
  this.music=!this.music
  this.updateMusic()
  if(this.music)this.beat()
 }

 silence(){
  for(const oscillator of this.playing)oscillator.stop()
  this.playing.clear()
  if('speechSynthesis' in window)speechSynthesis.cancel()
 }

 setActivity(active:boolean){
  this.activity=active
  this.silence()
  this.updateMusic()
 }

 visibilityChanged(){
  if(document.hidden)this.silence()
  this.updateMusic()
 }

 effect(hz:number,duration=.18){if(this.fx)this.tone(hz,duration,.07,'sine')}

 chime(){if(this.fx)this.tone(783.99,.28,.05,'sine')}

 say(line:string){
  if(!this.voice||this.activity||document.hidden||!('speechSynthesis' in window))return
  const voice=speechSynthesis.getVoices().find(v=>/yue|zh[-_]HK/i.test(v.lang))
  if(!voice)return
  const utterance=new SpeechSynthesisUtterance(line)
  utterance.voice=voice
  utterance.lang=voice.lang
  speechSynthesis.cancel()
  speechSynthesis.speak(utterance)
 }
}
