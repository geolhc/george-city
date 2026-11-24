export const venues={
 sync:{x:9.25,z:-36,title:'NOVA SYNC',name:'PLAYVERSE',label:'入 PLAYVERSE'},
 cafe:{x:-9.25,z:-37,title:'月潮冰室',name:'MOONTIDE CAFÉ',label:'入月潮冰室'},
}

export const discoveries = [
 {id:'ferry-signal',x:5.7,z:-18,y:3.1,color:'#a9fff2',name:'渡輪引路燈',area:'南閘東邊',story:'舊渡輪靠三短一長嘅燈號認路。新港將節奏留喺呢盞引路燈度。'},
 {id:'playverse',...venues.sync,y:2.6,color:'#bfa5ff',name:'共振機舖',area:'南街東面',story:'PLAYVERSE 用退役電車嘅報站鐘砌成第一部共振機。行近門口就入得。'},
 {id:'cafe-ticket',...venues.cafe,y:2.55,color:'#ffce8e',name:'冰室落單鐘',area:'南街西面',story:'枱號由手寫紙單傳到機械侍應，但出餐照舊叮一聲。呢個鐘係冰室第一代嘅。'},
 {id:'cinema-reel',x:8.7,z:21,y:3.9,color:'#ffb49a',name:'潮聲菲林盒',area:'北街東面',story:'街坊趁落雨入嚟睇戲，戲院用船帆遮雨，後來仲攞同一塊帆做銀幕。'},
 {id:'wind-archive',x:-9.4,z:2.8,y:1.45,color:'#76dffc',name:'風聲匣',area:'西街近廣場',story:'晒衫竹、電車鈴、風掠過簷篷——錄音師將消失咗嘅街聲封存喺匣入面。'},
 {id:'pier-lens',x:-8,z:42,y:5.4,color:'#ffdf86',name:'碼頭透鏡',area:'北碼頭西面',story:'工程師換咗光源，但保留舊航標嘅玻璃。每一圈刻痕都對準一條入港線。'},
 {id:'lantern-spool',x:8.8,z:29.2,y:1.65,color:'#ff98ae',name:'小滿嘅光線轆',area:'北閘東側',story:'小滿用同一卷光纖補過三代魚燈。佢話最靚嘅路，都要有人一手一腳照住。'},
 {id:'moonwheel',x:14,z:1,y:4.9,color:'#c9a4fa',name:'月輪嘅第二個月亮',area:'月輪廣場',story:'入夜望埋地面，綠色外環會同雨水倒影砌成第二個月亮。'},
]

export const pulseRoutes={
 delivery:{
  name:'速遞搭把手',start:{x:-8.7,z:15.1},offer:'幫速遞機械人',
  stops:[
   {x:-8.2,z:30.8,label:'喺北閘攞包裹',action:'攞包裹'},
   {x:8.2,z:11.6,label:'過對面送去睇更亭',action:'交包裹'},
  ],
 },
 energy:{
  name:'光網搶修',start:{x:14,z:5.5},offer:'接光網搶修',
  stops:[
   {x:19.2,z:7.5,label:'校準廣場東面光網',action:'校準東面光網'},
   {x:21,z:0,label:'校準月輪後面光網',action:'校準月輪光網'},
   {x:15.2,z:-6.2,label:'校準廣場南面光網',action:'校準南面光網'},
  ],
 },
}
export type PulseId=keyof typeof pulseRoutes
