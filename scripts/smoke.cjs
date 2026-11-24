const {chromium}=require('playwright')
;(async()=>{
 const browser=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']})
 for(const mobile of [false,true]){
 const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1000,height:600},hasTouch:mobile,isMobile:mobile})
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())})
 await page.goto(process.env.CITY_URL||'http://127.0.0.1:4173');await page.waitForFunction(()=>document.querySelector('#act span')?.textContent==='霓虹街影',{},{timeout:90000})
 await page.waitForTimeout(2500);await page.screenshot({path:'/tmp/city-'+mobile+'.jpg'})
 await page.locator('#act').click();await page.waitForFunction(()=>document.querySelector('#title').textContent==='霓虹街影')
 if(mobile){const client=await page.context().newCDPSession(page),b=await page.locator('#stick').boundingBox();await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x+55,y:b.y+20}]});await page.waitForTimeout(1900);await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})}
 else{await page.keyboard.down('w');await page.waitForTimeout(1900);await page.keyboard.up('w')}
 await page.locator('#journal').click();await page.waitForSelector('#panel[open]');await page.locator('#close').click()
 await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')))
 const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('george-city.v1')))
 if(state.player.z<=-24.9||state.active.id!==0)throw Error('movement or mission failed')
 await page.reload();await page.waitForFunction(()=>document.querySelector('#title').textContent==='霓虹街影')
 console.log(JSON.stringify({mobile,z:state.player.z,errors}));if(errors.some(e=>!e.includes('404')))throw Error(errors.join('\n'));await page.close()
 }await browser.close()
})().catch(e=>{console.error(e);process.exit(1)})
