const broker = "wss://broker.hivemq.com:8884/mqtt";

const client = mqtt.connect(broker);

let offlineCache = JSON.parse(localStorage.getItem("cache") || "{}");

let tempData = [];
let humData = [];

const ctx = document.getElementById("chart").getContext("2d");

const chart = new Chart(ctx,{
type:"line",
data:{
labels:[],
datasets:[
{
label:"Temp",
data:[],
borderColor:"#f97316"
},
{
label:"Humidity",
data:[],
borderColor:"#38bdf8"
}
]
}
});

// ---------- MQTT ----------
client.on("connect",()=>{
document.getElementById("status").innerText="ONLINE";
document.getElementById("status").className="online";

client.subscribe("farm/temp");
client.subscribe("farm/hum");
client.subscribe("farm/rain");
client.subscribe("farm/pump");
});

client.on("message",(topic,msg)=>{
const data = msg.toString();
saveCache(topic,data);

if(topic==="farm/temp"){
updateTemp(data);
}
if(topic==="farm/hum"){
updateHum(data);
}
if(topic==="farm/pump"){
document.getElementById("pump").innerText=data;
}
});

// ---------- UPDATE ----------
function updateTemp(v){
document.getElementById("temp").innerText=v;
pushChart(tempData, chart.data.datasets[0], v);
}

function updateHum(v){
document.getElementById("hum").innerText=v;
pushChart(humData, chart.data.datasets[1], v);
}

function pushChart(arr, dataset, value){
const t = new Date().toLocaleTimeString();

chart.data.labels.push(t);
dataset.data.push(value);

if(chart.data.labels.length>20){
chart.data.labels.shift();
chart.data.datasets.forEach(d=>d.data.shift());
}

chart.update();
}

// ---------- OFFLINE ----------
function saveCache(topic,value){
offlineCache[topic]=value;
localStorage.setItem("cache",JSON.stringify(offlineCache));
}

function loadOffline(){
document.getElementById("temp").innerText = offlineCache["farm/temp"] || "--";
document.getElementById("hum").innerText = offlineCache["farm/hum"] || "--";
document.getElementById("pump").innerText = offlineCache["farm/pump"] || "--";
}

// ---------- CONTROL ----------
function pumpOn(){
client.publish("farm/pump","ON");
}

function pumpOff(){
client.publish("farm/pump","OFF");
}

// ---------- RECONNECT SAFE ----------
client.on("offline",()=>{
document.getElementById("status").innerText="OFFLINE";
document.getElementById("status").className="offline";
loadOffline();
});

loadOffline();
