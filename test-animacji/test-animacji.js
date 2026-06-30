const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const track=document.querySelector('#mascot-track');
const status=document.querySelector('#status');
const buttons=[...document.querySelectorAll('[data-action]')];

const mascot=new ProMascot({
  host:track,
  startPosition:.5,
  width:82,
  height:123,
  edgePadding:12,
  assetPartsPath:'../assets/mascot/pro',
  randomBehaviors:false
});
window.mascotTest=mascot;

let runToken=0;

function setStatus(text,action){
  status.textContent=text;
  buttons.forEach(button=>button.classList.toggle('is-active',button.dataset.action===action));
}

function resetTransform(){
  mascot.element.style.transitionDuration='0ms';
  mascot.placeImmediately(.5);
  mascot.flip.style.transform='';
  mascot.element.classList.remove('is-blinking');
  mascot.element.classList.remove('turning');
  mascot.element.classList.add('facing-right');
  mascot.element.classList.remove('facing-left');
  mascot.setState('idle','idle',false);
}

async function showSteps(name,steps,token){
  for(let i=0;i<steps.length;i++){
    if(token!==runToken)return false;
    const step=steps[i];
    if(step.face){
      mascot.element.classList.toggle('facing-left',step.face==='left');
      mascot.element.classList.toggle('facing-right',step.face!=='left');
    }
    if(step.frame)mascot.showFrame(step.frame,step.spriteTransform||'translateY(0)',true);
    if(step.x!==undefined){
      mascot.currentPosition=step.x;
      mascot.element.style.transitionDuration=`${step.ms||110}ms`;
      mascot.element.style.transform=`translate3d(${mascot.xFor(step.x)}px,${step.y||0}px,0) rotate(${step.rotate||0}deg)`;
    }else{
      mascot.element.style.transform=`translate3d(${mascot.xFor(mascot.currentPosition)}px,${step.y||0}px,0) rotate(${step.rotate||0}deg)`;
    }
    if(step.blink!==undefined)mascot.element.classList.toggle('is-blinking',step.blink);
    setStatus(`${name} — klatka ${i+1}/${steps.length}`,document.querySelector('.is-active')?.dataset.action);
    await wait(step.ms||110);
  }
  return token===runToken;
}

async function backToIdle(token){
  if(token!==runToken)return;
  mascot.element.classList.remove('is-blinking');
  mascot.showFrame('idle','translateY(0)',true);
  mascot.element.style.transitionDuration='220ms';
  mascot.currentPosition=.5;
  mascot.element.style.transform=`translate3d(${mascot.xFor(.5)}px,0,0)`;
  await wait(240);
  if(token===runToken)setStatus('Pozycja neutralna','idle');
}

async function playWalk(token){
  mascot.currentPosition=.12;
  mascot.placeImmediately(.12);
  mascot.element.classList.add('facing-right');
  mascot.element.classList.remove('facing-left');
  const frames=['walk1','walk2','walk1','walk2','walk1','walk2','walk1','walk2','walk1','walk2'];
  const steps=frames.map((frame,i)=>({
    frame,
    x:.12+(.76*i/9),
    y:i%2===0?-1:1,
    rotate:i%2===0?-.8:.8,
    spriteTransform:`translateY(${i%2===0?-1:1}px) rotate(${i%2===0?-.5:.5}deg)`,
    ms:115
  }));
  await showSteps('Chód',steps,token);
  await backToIdle(token);
}

async function playArms(token){
  const steps=[
    {frame:'idle',y:0,ms:140},
    {frame:'lookUp',y:0,rotate:-.3,ms:140},
    {frame:'lookUp',y:-1,rotate:.3,ms:140},
    {frame:'happy',y:-2,rotate:-.4,ms:150},
    {frame:'happy',y:-3,rotate:.4,ms:160},
    {frame:'happy',y:-4,rotate:0,ms:420}
  ];
  await showSteps('Podnoszenie rąk',steps,token);
  await backToIdle(token);
}

async function playJump(token){
  const steps=[
    {frame:'idle',y:0,ms:100},
    {frame:'walk1',y:2,rotate:-1,ms:100},
    {frame:'walk2',y:3,rotate:1,ms:100},
    {frame:'happy',y:-5,rotate:-1,ms:100},
    {frame:'happy',y:-13,rotate:1,ms:110},
    {frame:'happy',y:-20,rotate:0,ms:150},
    {frame:'happy',y:-13,rotate:-1,ms:100},
    {frame:'happy',y:-5,rotate:1,ms:100},
    {frame:'walk2',y:2,rotate:-.5,ms:110},
    {frame:'idle',y:0,rotate:0,ms:260}
  ];
  await showSteps('Skok z radości',steps,token);
  await backToIdle(token);
}

async function playBlink(token){
  const steps=[
    {frame:'idle',blink:false,ms:120},
    {frame:'idle',blink:true,ms:90},
    {frame:'idle',blink:true,ms:110},
    {frame:'idle',blink:false,ms:90},
    {frame:'idle',blink:false,ms:220}
  ];
  await showSteps('Mruganie',steps,token);
  await backToIdle(token);
}

async function playLean(side,token){
  const left=side==='left';
  const edge=left?0:1;
  mascot.currentPosition=edge;
  mascot.placeImmediately(edge);
  const sign=left?-1:1;
  const face=left?'left':'right';
  const steps=[
    {frame:'idle',face,y:0,rotate:0,ms:120},
    {frame:'walk1',face,y:0,rotate:.25*sign,ms:120},
    {frame:'lookUp',face,y:0,rotate:.5*sign,ms:120},
    {frame:'lean',face,y:0,rotate:.8*sign,spriteTransform:`translateX(${1*sign}px) rotate(${.5*sign}deg)`,ms:120},
    {frame:'lean',face,y:-1,rotate:1.1*sign,spriteTransform:`translateX(${2*sign}px) rotate(${.8*sign}deg)`,ms:120},
    {frame:'lean',face,y:-1,rotate:1.4*sign,spriteTransform:`translateX(${3*sign}px) rotate(${1.1*sign}deg)`,ms:130},
    {frame:'lean',face,y:-1,rotate:1.7*sign,spriteTransform:`translateX(${4*sign}px) rotate(${1.4*sign}deg)`,ms:140},
    {frame:'lean',face,y:-1,rotate:2*sign,spriteTransform:`translateX(${5*sign}px) rotate(${1.7*sign}deg)`,ms:650}
  ];
  await showSteps(left?'Oparcie o lewy QR':'Oparcie o prawy QR',steps,token);
  await backToIdle(token);
}

async function run(action){
  const token=++runToken;
  await mascot.ready;
  resetTransform();
  setStatus('Start animacji…',action);
  if(action==='idle'){backToIdle(token);return;}
  if(action==='walk')return playWalk(token);
  if(action==='arms')return playArms(token);
  if(action==='jump')return playJump(token);
  if(action==='blink')return playBlink(token);
  if(action==='lean-left')return playLean('left',token);
  if(action==='lean-right')return playLean('right',token);
}

buttons.forEach(button=>button.addEventListener('click',()=>run(button.dataset.action)));

mascot.ready.then(()=>{
  resetTransform();
  setStatus('Pozycja neutralna','idle');
}).catch(error=>{
  console.error(error);
  status.textContent='Błąd wczytywania modelu';
});
