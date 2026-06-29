import { MascotGLB } from './src/mascot-glb.js';

const track=document.querySelector('#mascot-track');
const status=document.querySelector('#status');
const screen=document.querySelector('#signage-demo');
const mascot=new MascotGLB({
  host:track,
  startPosition:.08,
  moveSpeed:.55,
  modelUrl:'assets/model/fox-mascot.glb'
});
window.mascot3d=mascot;
status.textContent='ładowanie finalnego modelu GLB…';

track.addEventListener('mascot:model-ready',(event)=>{
  if(event.detail.mode==='glb'){
    status.textContent='finalny model GLB gotowy';
  }else{
    status.textContent='tryb testowy: model proceduralny';
  }
});

document.querySelectorAll('[data-demo]').forEach((button)=>{
  button.addEventListener('click',()=>{
    const category=button.dataset.demo;
    status.textContent='reakcja 3D: '+category;
    notifyMascotPosterChange({category});
  });
});

document.querySelectorAll('[data-action]').forEach((button)=>{
  button.addEventListener('click',async()=>{
    const action=button.dataset.action;
    status.textContent='ruch 3D: '+action;
    if(action==='walk-left')mascot.moveTo(0);
    if(action==='walk-right')mascot.moveTo(1);
    if(action==='lean-left')await mascot.leanOn('left');
    if(action==='lean-right')await mascot.leanOn('right');
    if(action==='climb-left')await mascot.climb('left');
    if(action==='climb-right')await mascot.climb('right');
    status.textContent=mascot.finalModelReady?'finalny model GLB gotowy':'tryb testowy: model proceduralny';
  });
});

document.querySelector('#debug-toggle').addEventListener('change',(event)=>screen.classList.toggle('debug',event.target.checked));

function updateClock(){
  const now=new Date();
  document.querySelector('#clock').textContent=now.toLocaleTimeString('pl-PL',{hour:'2-digit',minute:'2-digit'});
  document.querySelector('#date').textContent=now.toLocaleDateString('pl-PL',{weekday:'short',day:'2-digit',month:'2-digit',year:'numeric'});
}
updateClock();
setInterval(updateClock,1000);
