const assert=require('node:assert/strict')
const {chromium}=require('playwright')
const {makeChart,duration,lanes}=require('../src/activities/sync-score.ts')
const {CafeRun,serviceBreak,ticketsPerShift}=require('../src/activities/cafe-score.ts')
const {pulseRoutes,venues}=require('../src/city-content.ts')
const {frequencies}=require('../src/pulse.ts')
const {fresh}=require('../src/game.ts')
const url=process.env.CITY_URL||'http://127.0.0.1:4173'
const state=page=>page.evaluate(()=>{
 window.dispatchEvent(new Event('pagehide'))
 return JSON.parse(localStorage.getItem('george-city.v1'))
})

async function walk(page,key,axis,bound,greater){
 await page.keyboard.down(key)
 try{
  await page.waitForFunction(({axis,bound,greater})=>{
   window.dispatchEvent(new Event('pagehide'))
   const position=JSON.parse(localStorage.getItem('george-city.v1')).player[axis]
   return greater?position>=bound:position<=bound
  },{axis,bound,greater},{timeout:35000,polling:100})
 }finally{await page.keyboard.up(key)}
}

async function installArrivals(page){
 await page.addInitScript(()=>{
  const seed=sessionStorage.getItem('motion-test-arrival')
  if(seed){
   localStorage.setItem('george-city.v1',seed)
   sessionStorage.removeItem('motion-test-arrival')
  }
 })
}

async function arrive(page,at,label,seed){
 seed=seed||await state(page)
 Object.assign(seed.player,{x:at.x,z:at.z,heading:0,driving:false,speed:0})
 await page.evaluate(seed=>sessionStorage.setItem('motion-test-arrival',JSON.stringify(seed)),seed)
 await page.reload()
 await page.locator('#act').filter({hasText:label}).waitFor({timeout:90000})
}

async function freezeClock(page){
 const then=new Date('2026-11-25T12:00:00Z')
 await page.clock.install({time:then})
 await page.clock.pauseAt(new Date(+then+2000))
}

async function arcade(page,screens){
 await page.locator('#act').click()
 await walk(page,'d','x',8.7,true)
 await walk(page,'s','z',-34,false)
 const entrance=page.locator('#act').filter({hasText:'入 PLAYVERSE'})
 await entrance.waitFor()
 await page.keyboard.press('q')
 await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('掃描發現'))
 if(screens)await page.screenshot({path:screens+'/playverse-entrance.jpg',quality:84})
 await page.getByRole('button',{name:'聲音設定'}).click()
 await page.getByRole('button',{name:'配樂 關'}).click()
 await page.getByRole('button',{name:'關閉'}).click()
 await page.waitForFunction(()=>window.motionProbe.music>=2,{},{timeout:15000})
 await page.keyboard.press('e')
 const scene=page.locator('#activity[open]')
 await scene.getByRole('button',{name:'開始挑戰'}).waitFor()
 const before=await state(page)
 assert.equal(before.active.id,0)
 assert.ok(before.city.stamps.includes('playverse'))

 const lobby=await page.evaluate(()=>({...window.motionProbe}))
 await page.waitForTimeout(500)
 assert.deepEqual(await page.evaluate(()=>window.motionProbe),lobby)
 await freezeClock(page)
 await scene.getByRole('button',{name:'音效 關'}).click()
 await scene.getByRole('button',{name:'開始挑戰'}).click()
 await page.clock.runFor(800)
 if(screens)await page.screenshot({path:screens+'/nova-sync.jpg',quality:86})
 const metronome=await page.evaluate(()=>({...window.motionProbe}))
 assert.ok(metronome.effects>lobby.effects)
 assert.equal(metronome.draws,lobby.draws)
 assert.equal(metronome.music,lobby.music)

 await page.evaluate(()=>window.dispatchEvent(new Event('blur')))
 await scene.getByRole('button',{name:'繼續挑戰'}).waitFor()
 const pausedTime=await scene.locator('[data-time]').textContent()
 await page.clock.fastForward(7000)
 assert.equal(await scene.locator('[data-time]').textContent(),pausedTime)
 await scene.getByRole('button',{name:'繼續挑戰'}).click()
 const notes=makeChart()
 let elapsed=800
 for(const note of notes){
  await page.clock.runFor(note.time-elapsed)
  elapsed=note.time
  await page.keyboard.press(lanes[note.lane].code)
 }
 await page.clock.runFor(duration-elapsed+50)
 const result=scene.locator('[data-result]')
 await result.waitFor()
 assert.match(await result.textContent(),/共振晶片/)
 const recorded=await state(page)
 assert.deepEqual(recorded.player,before.player)
 assert.deepEqual(recorded.active,before.active)
 assert.equal(recorded.clock,before.clock)
 assert.equal(recorded.city.records.sync.runs,1)
 assert.ok(recorded.city.records.sync.best>=1600)

 await scene.getByRole('button',{name:'重新開始'}).click()
 await page.clock.runFor(1_800)
 await page.keyboard.press('Escape')
 await scene.waitFor({state:'hidden'})
 await page.clock.runFor(500)
 const resumed=await page.evaluate(()=>({...window.motionProbe}))
 assert.ok(resumed.draws>lobby.draws)
 assert.ok(resumed.music>lobby.music)
 const after=await state(page)
 assert.equal(after.city.records.sync.runs,1)
 assert.equal(after.player.x,before.player.x)
 assert.equal(after.player.z,before.player.z)
 assert.equal(after.active.id,0)
 assert.ok(after.clock>before.clock)
 await entrance.waitFor()
 await page.clock.resume()
 await page.reload()
 await page.locator('#act').filter({hasText:'入 PLAYVERSE'}).waitFor({timeout:90000})
 await page.getByRole('button',{name:'City OS',exact:true}).click()
 await page.getByRole('button',{name:'城市掃描 · City Scan'}).click()
 await page.getByText('共振機舖',{exact:true}).waitFor()
 await page.getByRole('button',{name:'‹ City OS'}).click()
 await page.getByRole('button',{name:'City ID',exact:true}).click()
 await page.getByText(/收藏徽章.*共振晶片/).waitFor()
 await page.getByText(/City XP.*75/).waitFor()
 if(screens)await page.screenshot({path:screens+'/city-id.jpg',quality:84})
 await page.getByRole('button',{name:'關閉'}).click()
 await page.getByRole('button',{name:'NOVA',exact:true}).click()
 assert.equal(await page.locator('#nova-toggle').getAttribute('aria-expanded'),'false')
 await page.getByRole('button',{name:'聲音設定'}).click()
 await page.getByRole('button',{name:'NOVA 嚮導 收起'}).click()
 await page.getByRole('button',{name:'關閉'}).click()
 await page.locator('#nova').waitFor({state:'hidden'})
}

async function cityPulse(page){
 let progress
 for(const [id,route] of Object.entries(pulseRoutes)){
  await arrive(page,route.start,route.offer)
  await page.locator('#act').click()
  assert.deepEqual((await state(page)).city.pulse,{id,stage:0})
  for(const [index,stop] of route.stops.entries()){
   await arrive(page,stop,stop.action)
   await page.locator('#act').click()
   if(id==='energy'){
    const frequency=(index+1)%frequencies.length
    await page.getByRole('button',{name:frequencies[(frequency+1)%frequencies.length]}).click()
    await page.getByText('頻率唔啱',{exact:false}).waitFor()
    await page.getByRole('button',{name:frequencies[frequency]}).click()
   }
  }
  progress=await state(page)
  assert.equal(progress.city.pulse,null)
  assert.equal(progress.city.records[id].runs,1)
  assert.equal(progress.active.id,0)
 }
 assert.equal(progress.city.records.energy.best,1)
 await arrive(page,{x:8.6,z:-13},'同肥波傾偈',{...progress,clock:0})
 await page.locator('#act').click()
 await page.getByText('個包裹收到喇',{exact:false}).waitFor()
}

async function mobileCafe(browser,portrait,screens){
 const page=await browser.newPage({viewport:portrait?{width:390,height:844}:{width:844,height:390},hasTouch:true,isMobile:true})
 const errors=[]
 page.on('pageerror',error=>errors.push(String(error)))
 page.on('console',entry=>{if(entry.type()==='error')errors.push(entry.text())})
 await installArrivals(page)
 await page.goto(url)
 const seed=fresh()
 delete seed.city
 seed.credits=150
 seed.discovered=['landmark-0']
 seed.records[3]=21
 seed.outfit=4
 await arrive(page,venues.cafe,venues.cafe.label,seed)
 assert.equal((await state(page)).credits,150)
 if(portrait){
  await page.getByRole('button',{name:'City Scan 掃描'}).tap()
  await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('冰室落單鐘'))
 }
 if(screens&&portrait)await page.screenshot({path:screens+'/moontide-cafe-entrance.jpg',quality:83})
 await page.locator('#act').tap()
 const scene=page.locator('#activity[open]')
 await scene.getByRole('button',{name:'開檔'}).waitFor()
 await freezeClock(page)
 await scene.getByRole('button',{name:'開檔'}).tap()
 assert.equal(await scene.evaluate(dialog=>dialog.scrollHeight<=dialog.clientHeight+1),true)
 if(screens)await page.screenshot({path:screens+(portrait?'/cafe-portrait.jpg':'/cafe-landscape.jpg'),quality:85})
 if(portrait){
  const expected=new CafeRun(0)
  await scene.locator('[data-dish=bun]').tap()
  await scene.locator('[data-drink=lemon-tea]').tap()
  await scene.getByRole('button',{name:'出餐',exact:true}).tap()
  await scene.getByText('呢張單唔啱',{exact:false}).waitFor()
  for(let order=0;order<ticketsPerShift;order++){
   await scene.locator('[data-dish='+expected.order.dish+']').tap()
   await scene.locator('[data-drink='+expected.order.drink+']').tap()
   await scene.getByRole('button',{name:'出餐',exact:true}).tap()
   await scene.getByText('叮！啱單，多謝晒。').waitFor()
   expected.index++
   await page.clock.runFor(serviceBreak+35)
  }
  await scene.getByText(/出餐 5\/5.*夜更茶牌/).waitFor()
 }
 await scene.getByRole('button',{name:'返月潮里'}).tap()
 await scene.waitFor({state:'hidden'})
 const after=await state(page)
 assert.equal(after.credits,150)
 assert.equal(after.outfit,4)
 assert.deepEqual(after.discovered,['landmark-0'])
 assert.equal(after.city.records.cafe?.runs,portrait?1:undefined)
 await page.close()
 assert.deepEqual(errors,[])
}

;(async()=>{
 const browser=await chromium.launch({...(process.env.CITY_BROWSER?{executablePath:process.env.CITY_BROWSER}:{channel:'chrome'}),args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']})
 try{
  const page=await browser.newPage({viewport:{width:1080,height:680}})
  const errors=[]
  page.on('pageerror',error=>errors.push(String(error)))
  page.on('console',entry=>{if(entry.type()==='error')errors.push(entry.text())})
  await installArrivals(page)
  await page.addInitScript(()=>{
   const probe=window.motionProbe={draws:0,music:0,effects:0}
   for(const prototype of [WebGLRenderingContext.prototype,WebGL2RenderingContext.prototype]){
    for(const name of ['drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced']){
     if(!Object.hasOwn(prototype,name))continue
     const draw=prototype[name]
     prototype[name]=function(...args){probe.draws++;return draw.apply(this,args)}
    }
   }
   const start=OscillatorNode.prototype.start
   OscillatorNode.prototype.start=function(...args){
    probe[this.type==='triangle'?'music':'effects']++
    return start.apply(this,args)
   }
  })
  await page.goto(url)
  await page.locator('#act').filter({hasText:'霓虹街影'}).waitFor({timeout:90000})
  await arcade(page,process.env.CITY_SCREENS)
  await cityPulse(page)
  await page.close()
  assert.deepEqual(errors,[])
  console.log('Passed desktop arcade, City Scan, City ID, guide settings, City Pulse and resident dialogue')
  for(const portrait of [true,false]){
   await mobileCafe(browser,portrait,process.env.CITY_SCREENS)
   console.log('Passed emulated touch café in '+(portrait?'portrait':'landscape'))
  }
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1})
