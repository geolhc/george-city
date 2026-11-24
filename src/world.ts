export interface Point {x:number; z:number}
export interface Block extends Point {w:number; d:number; h:number}
export const blocks:Block[]=[]
for(const side of [-1,1]) for(const row of [-2,-1,0,1,2]){
  if(side===1 && row===0) continue
  blocks.push({x:side*17,z:row*17,w:12,d:12,h:12+((row+3)*7+(side+1)*4)%21})
}
export const starts=[{x:0,z:-22},{x:-7,z:9},{x:11,z:0},{x:7,z:-32},{x:0,z:26}]
export const titles=['霓虹街影','阿轆去咗邊？','廣場再亮燈','午夜飛圈','燈籠巡遊']
export const english=['Neon postcards','Lost in transit','Light the plaza','Midnight circuit','Lantern walk']
export const rewards=[80,100,120,150,90]
export const outfits=['海鹽藍','珊瑚紅','霓虹紫','琥珀金','薄荷綠','午夜銀']
export const sites:Point[][]=[
 [{x:-8,z:-12},{x:8,z:20},{x:-8,z:40}],
 [{x:-10,z:25},{x:-7,z:9}],
 [{x:11,z:0}],
 [{x:70,z:-15},{x:70,z:17},{x:90,z:17},{x:90,z:-15},{x:70,z:-15}],
 [{x:4,z:33},{x:0,z:13},{x:-5,z:-5},{x:6,z:-20}]
]
export const labels=[['影低霓虹牌樓','影低露天戲院','影低碼頭燈塔'],['去北面電器舖搵阿轆','帶阿轆返速遞站'],['將電力駁到月輪'],['出發','北閘','東閘','南閘','衝線'],['收集魚仔燈','收集月亮燈','收集兔仔燈','收集星星燈']]
export const park={x:5,z:-20}
export const shop={x:-8,z:-31}
export const garage={x:8,z:37}
export const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.z-b.z)
export function clear(x:number,z:number,r=0.45,race=false){
 if(race)return x>=65+r&&x<=95-r&&z>=-20+r&&z<=22-r&&!(x>75-r&&x<85+r&&z>-10-r&&z<12+r)
 return Math.abs(x)<=28-r&&Math.abs(z)<=46-r&&!blocks.some(b=>Math.abs(x-b.x)<b.w/2+r&&Math.abs(z-b.z)<b.d/2+r)
}
export interface InputCommand {side:number; forward:number; sprint:boolean}
export interface Player extends Point {heading:number; speed:number; driving:boolean}
export function step(p:Player,c:InputCommand,yaw:number,dt:number,race=false,boost=false){
 const limit= p.driving?(boost?18:15):c.sprint?8.4:4.5
 let dx=0,dz=0
 if(p.driving){
   p.speed+=(c.forward*limit-p.speed)*(1-Math.exp(-3*dt))
   p.heading+=c.side*2.25*Math.min(1,Math.abs(p.speed)/2.5)*Math.sign(p.speed)*dt
   dx=Math.sin(p.heading)*p.speed; dz=Math.cos(p.heading)*p.speed
 }else{
   let length=Math.max(1,Math.hypot(c.side,c.forward))
   dx=(c.side*Math.cos(yaw)+c.forward*Math.sin(yaw))/length*limit
   dz=(c.forward*Math.cos(yaw)-c.side*Math.sin(yaw))/length*limit
   p.speed=Math.hypot(dx,dz)
   if(p.speed>.05)p.heading+=Math.atan2(Math.sin(Math.atan2(dx,dz)-p.heading),Math.cos(Math.atan2(dx,dz)-p.heading))*(1-Math.exp(-17*dt))
 }
 const r=p.driving?1.25:.45
 const xok=clear(p.x+dx*dt,p.z,r,race)
 if(xok)p.x+=dx*dt
 const zok=clear(p.x,p.z+dz*dt,r,race)
 if(zok)p.z+=dz*dt
 if(p.driving&&(!xok||!zok))p.speed*=.7
}
export function cameraDistance(p:Point,yaw:number,max:number,race:boolean){
 let safe=.3
 for(let d=.4;d<=max;d+=.2){
  if(!clear(p.x-Math.sin(yaw)*d,p.z-Math.cos(yaw)*d,.2,race))break
  safe=d
 }
 return safe
}
