const {chromium}=require('playwright')
;(async()=>{
 const browser=await chromium.launch({...(process.env.CITY_BROWSER?{executablePath:process.env.CITY_BROWSER}:{channel:'chrome'}),args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']})
 for(const mobile of [false,true]){
 const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1000,height:600},hasTouch:mobile,isMobile:mobile})
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())})
 await page.goto(process.env.CITY_URL||'http://127.0.0.1:4173');await page.waitForFunction(()=>document.querySelector('#act span')?.textContent==='霓虹街影',{},{timeout:90000})
 await page.waitForTimeout(2500);await page.screenshot({path:mobile?'/tmp/city-mobile.jpg':'dist/moontide-lane.jpg'})
 await page.locator('#act').click();await page.waitForFunction(()=>document.querySelector('#title').textContent==='霓虹街影')
 if(mobile){const client=await page.context().newCDPSession(page),b=await page.locator('#stick').boundingBox();await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x+55,y:b.y+20}]});await page.waitForTimeout(1900);await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})}
 else{await page.keyboard.down('w');await page.waitForTimeout(1900);await page.keyboard.up('w')}
 await page.locator('#journal').click();await page.waitForSelector('#panel[open]');await page.locator('#close').click()
 await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')))
 const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('george-city.v1')))
 if(state.player.z<=-24.9||state.active.id!==0)throw Error('movement or mission failed')
 await page.reload();await page.waitForFunction(()=>document.querySelector('#title').textContent==='霓虹街影')
 if(!mobile){
  // Place a fresh fixture at each location; exercise the same UI actions as a player.
  const fixture={...state,active:null,records:{},credits:0,discovered:[]}
  async function arrive(x,z,seed){
   await page.evaluate(({x,z,seed})=>{
    const save=seed||JSON.parse(localStorage.getItem('george-city.v1'))
    Object.assign(save.player,{x,z,speed:0})
    // An init script is unnecessary: pagehide saves the old session, then the new origin reads this fixture.
    sessionStorage.setItem('city-test-arrival',JSON.stringify(save))
   },{x,z,seed})
   await page.reload()
  }
  await page.addInitScript(()=>{const seed=sessionStorage.getItem('city-test-arrival');if(seed){localStorage.setItem('george-city.v1',seed);sessionStorage.removeItem('city-test-arrival')}})
  const starts=[[0,-22],[-7,9],[11,0],[7,-32],[0,26]]
  const stops=[[[-8,-12],[8,20],[-8,40]],[[-10,25],[-7,9]],[[11,0]],[[70,17],[90,17],[90,-15],[70,-15]],[[4,33],[0,13],[-5,-5],[6,-20]]]
  for(let id=0;id<5;id++){
   await arrive(...starts[id],id===0?fixture:null)
   await page.locator('#act:enabled').click()
   await page.waitForFunction(()=>document.querySelector('#kicker').textContent.includes('委託'))
   for(let i=0;i<stops[id].length;i++){
    await arrive(...stops[id][i])
    if(id===3){
      await page.waitForFunction(stage=>{const a=JSON.parse(localStorage.getItem('george-city.v1')).active;return !a||a.stage>stage},i+1)
    }else{
      await page.locator('#act:enabled').click()
      if(id===2){for(const j of [0,1,1,1,2])await page.locator('.wire').nth(j).click()}
    }
   }
   await page.waitForFunction(id=>JSON.parse(localStorage.getItem('george-city.v1')).records[id]!==undefined,id)
  }
  await arrive(5,-20);await page.locator('#act:enabled').click();await page.waitForFunction(()=>document.querySelector('#act span').textContent==='落車');await page.locator('#act').click()
  await arrive(-8,-31);await page.locator('#act:enabled').click();await page.getByRole('button',{name:'午夜銀',exact:true}).click();await page.locator('#close').click()
  const cleared=await page.evaluate(()=>JSON.parse(localStorage.getItem('george-city.v1')))
  if(cleared.credits!==540||cleared.outfit!==5||cleared.discovered.length!==3)throw Error('progression integration failed')
 }
 console.log(JSON.stringify({mobile,z:state.player.z,errors}));if(errors.some(e=>!e.includes('404')))throw Error(errors.join('\n'));await page.close()
 }await browser.close()
})().catch(e=>{console.error(e);process.exit(1)})
