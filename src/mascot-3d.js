import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
const lerp=(a,b,t)=>a+(b-a)*t;

export class Mascot3D{
  constructor(options={}){
    this.host=typeof options.host==='string'?document.querySelector(options.host):options.host;
    if(!this.host)throw new Error('Mascot3D: brak hosta');
    this.options={startPosition:.08,moveSpeed:.55,randomBehaviors:true,...options};
    this.positionNorm=this.options.startPosition;
    this.targetNorm=this.positionNorm;
    this.state='idle';
    this.time=0;
    this.walkPhase=0;
    this.busy=false;
    this.buildDom();
    this.initThree();
    this.buildModel();
    this.resize();
    this.bind();
    this.animate();
  }
  buildDom(){
    this.layer=document.createElement('div');this.layer.className='mascot3d-layer';
    this.canvas=document.createElement('canvas');this.canvas.className='mascot3d-canvas';
    this.bubble=document.createElement('div');this.bubble.className='mascot3d-bubble';this.bubble.textContent='👀';
    this.layer.append(this.canvas,this.bubble);this.host.append(this.layer);
  }
  initThree(){
    this.renderer=new THREE.WebGLRenderer({canvas:this.canvas,alpha:true,antialias:true,premultipliedAlpha:true});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.scene=new THREE.Scene();
    this.camera=new THREE.OrthographicCamera(-3,3,2.4,-2.4,.1,100);
    this.camera.position.set(0,1.8,10);this.camera.lookAt(0,1.5,0);
    this.scene.add(new THREE.HemisphereLight(0xffffff,0x31435a,2.2));
    const key=new THREE.DirectionalLight(0xfff0dd,2.8);key.position.set(-3,6,8);this.scene.add(key);
    const fill=new THREE.DirectionalLight(0xb9d8ff,1.2);fill.position.set(4,3,6);this.scene.add(fill);
  }
  mat(color,rough=.75){return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:0});}
  mesh(geo,mat,parent,pos=[0,0,0]){const m=new THREE.Mesh(geo,mat);m.position.set(...pos);parent.add(m);return m;}
  limb(name,side,parent,x,y,color){
    const pivot=new THREE.Group();pivot.name=name;pivot.position.set(x,y,0);parent.add(pivot);
    const upper=this.mesh(new THREE.CapsuleGeometry(.13,.65,5,10),this.mat(color),pivot,[0,-.38,0]);
    const lowerPivot=new THREE.Group();lowerPivot.position.set(0,-.75,0);pivot.add(lowerPivot);
    this.mesh(new THREE.CapsuleGeometry(.11,.52,5,10),this.mat(color),lowerPivot,[0,-.31,0]);
    const hand=this.mesh(new THREE.SphereGeometry(.15,16,12),this.mat(0xf1782c),lowerPivot,[0,-.69,0]);
    return {pivot,lowerPivot,hand,side};
  }
  leg(name,side,parent,x,y){
    const pivot=new THREE.Group();pivot.name=name;pivot.position.set(x,y,0);parent.add(pivot);
    this.mesh(new THREE.CapsuleGeometry(.15,.62,5,10),this.mat(0x243348),pivot,[0,-.35,0]);
    const knee=new THREE.Group();knee.position.set(0,-.72,0);pivot.add(knee);
    this.mesh(new THREE.CapsuleGeometry(.14,.52,5,10),this.mat(0x243348),knee,[0,-.3,0]);
    const foot=this.mesh(new THREE.BoxGeometry(.34,.16,.58),this.mat(0xe9eef5,.5),knee,[0,-.67,.16]);foot.rotation.x=-.12;
    return {pivot,knee,foot,side};
  }
  buildModel(){
    this.root=new THREE.Group();this.scene.add(this.root);
    this.character=new THREE.Group();this.root.add(this.character);
    this.character.scale.setScalar(.9);
    this.body=this.mesh(new THREE.CapsuleGeometry(.62,1.1,7,16),this.mat(0x202f42),this.character,[0,1.52,0]);
    const hoodie=this.mesh(new THREE.CapsuleGeometry(.68,1.0,7,16),this.mat(0xf06c21),this.character,[0,1.62,.02]);hoodie.scale.z=.72;
    this.headPivot=new THREE.Group();this.headPivot.position.set(0,2.72,0);this.character.add(this.headPivot);
    this.mesh(new THREE.SphereGeometry(.76,24,18),this.mat(0xe96c25),this.headPivot,[0,0,0]);
    this.mesh(new THREE.SphereGeometry(.46,20,14),this.mat(0xf4d2b8),this.headPivot,[0,-.2,.52]);
    const earGeo=new THREE.ConeGeometry(.28,.72,4);const earMat=this.mat(0xe96c25);
    const el=this.mesh(earGeo,earMat,this.headPivot,[-.45,.62,0]);el.rotation.z=.28;el.rotation.x=.05;
    const er=this.mesh(earGeo,earMat,this.headPivot,[.45,.62,0]);er.rotation.z=-.28;er.rotation.x=.05;
    const eyeMat=this.mat(0x151515,.35);this.mesh(new THREE.SphereGeometry(.075,16,12),eyeMat,this.headPivot,[-.23,.05,.67]);this.mesh(new THREE.SphereGeometry(.075,16,12),eyeMat,this.headPivot,[.23,.05,.67]);
    const nose=this.mesh(new THREE.SphereGeometry(.1,16,12),this.mat(0x1b1412,.4),this.headPivot,[0,-.18,.88]);nose.scale.z=.65;
    this.leftArm=this.limb('leftArm','left',this.character,.73,2.15,0xf06c21);
    this.rightArm=this.limb('rightArm','right',this.character,-.73,2.15,0xf06c21);
    this.leftLeg=this.leg('leftLeg','left',this.character,.28,1.05);
    this.rightLeg=this.leg('rightLeg','right',this.character,-.28,1.05);
    this.tailPivot=new THREE.Group();this.tailPivot.position.set(-.55,1.55,-.12);this.character.add(this.tailPivot);
    const tail=this.mesh(new THREE.CapsuleGeometry(.18,1.15,6,12),this.mat(0xe96c25),this.tailPivot,[-.3,-.05,-.2]);tail.rotation.z=1.02;tail.rotation.x=.15;
    this.shadow=this.mesh(new THREE.CircleGeometry(.8,32),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.22,depthWrite:false}),this.root,[0,.02,-.3]);this.shadow.rotation.x=-Math.PI/2;
    this.setIdlePose();
  }
  setIdlePose(){
    for(const arm of [this.leftArm,this.rightArm]){arm.pivot.rotation.set(0,0,arm===this.leftArm?-.12:.12);arm.lowerPivot.rotation.set(0,0,0);}
    for(const leg of [this.leftLeg,this.rightLeg]){leg.pivot.rotation.set(0,0,0);leg.knee.rotation.set(0,0,0);}
  }
  bind(){
    this.ro=new ResizeObserver(()=>this.resize());this.ro.observe(this.host);
    window.addEventListener('signage:poster-change',e=>this.react(e.detail||{}));
  }
  resize(){
    const w=Math.max(1,this.host.clientWidth),h=Math.max(1,this.host.clientHeight);this.renderer.setSize(w,h,false);
    const aspect=w/h;const height=4.8;this.camera.left=-height*aspect/2;this.camera.right=height*aspect/2;this.camera.top=height/2;this.camera.bottom=-height/2;this.camera.updateProjectionMatrix();
  }
  worldX(norm){const span=(this.camera.right-this.camera.left)-1.7;return lerp(-span/2,span/2,clamp(norm,0,1));}
  moveTo(norm){this.targetNorm=clamp(norm,0,1);this.state='walk';}
  async say(text,ms=1300){this.bubble.textContent=text;this.layer.classList.add('is-speaking');await new Promise(r=>setTimeout(r,ms));this.layer.classList.remove('is-speaking');}
  async leanOn(side){
    this.busy=true;this.moveTo(side==='left'?0:1);await this.waitArrival();this.state=side==='left'?'lean-left':'lean-right';await this.say('👀',1500);await new Promise(r=>setTimeout(r,900));this.state='idle';this.busy=false;
  }
  async climb(side){
    this.busy=true;this.moveTo(side==='left'?0:1);await this.waitArrival();this.state=side==='left'?'climb-left':'climb-right';await this.say('😄',1300);await new Promise(r=>setTimeout(r,1400));this.state='idle';this.busy=false;
  }
  async react(input){
    const t=String(input.category||input.title||'').toLowerCase();
    if(/sport|rower|bieg/.test(t))return this.climb('left');
    if(/warsztat/.test(t))return this.leanOn('left');
    this.busy=true;this.moveTo(.55);await this.waitArrival();this.state=/koncert|rodzin/.test(t)?'happy':/kino/.test(t)?'surprised':'look';await this.say(/koncert/.test(t)?'🎵':/kino/.test(t)?'🎬':'👀',1300);await new Promise(r=>setTimeout(r,900));this.state='idle';this.busy=false;
  }
  waitArrival(){return new Promise(resolve=>{const id=setInterval(()=>{if(Math.abs(this.positionNorm-this.targetNorm)<.015){clearInterval(id);resolve();}},30);});}
  updateRig(dt){
    const walking=this.state==='walk';
    if(walking)this.walkPhase+=dt*7.2;
    const s=Math.sin(this.walkPhase),c=Math.cos(this.walkPhase);
    if(walking){
      this.leftLeg.pivot.rotation.x=s*.72;this.rightLeg.pivot.rotation.x=-s*.72;
      this.leftLeg.knee.rotation.x=Math.max(0,-s)*.72;this.rightLeg.knee.rotation.x=Math.max(0,s)*.72;
      this.leftArm.pivot.rotation.x=-s*.55;this.rightArm.pivot.rotation.x=s*.55;
      this.character.position.y=.05+Math.abs(c)*.035;this.character.rotation.z=s*.012;this.tailPivot.rotation.z=-.22+s*.12;
    }else if(this.state==='lean-left'){
      this.setIdlePose();this.character.rotation.z=-.08;this.rightArm.pivot.rotation.z=-1.18;this.rightArm.lowerPivot.rotation.z=-.2;
    }else if(this.state==='lean-right'){
      this.setIdlePose();this.character.rotation.z=.08;this.leftArm.pivot.rotation.z=1.18;this.leftArm.lowerPivot.rotation.z=.2;
    }else if(this.state.startsWith('climb')){
      const side=this.state.endsWith('left')?-1:1;this.leftArm.pivot.rotation.z=side<0?-.85:.3;this.rightArm.pivot.rotation.z=side<0?-.3:.85;this.leftLeg.pivot.rotation.x=.5;this.rightLeg.pivot.rotation.x=-.25;this.character.position.y=.18+Math.sin(this.time*6)*.05;
    }else if(this.state==='happy'){
      this.setIdlePose();this.leftArm.pivot.rotation.z=-1.0;this.rightArm.pivot.rotation.z=1.0;this.character.position.y=.08+Math.abs(Math.sin(this.time*5))*.06;
    }else if(this.state==='surprised'){
      this.setIdlePose();this.character.scale.setScalar(.9+Math.sin(this.time*5)*.015);
    }else if(this.state==='look'){
      this.setIdlePose();this.headPivot.rotation.x=-.18;
    }else{
      this.setIdlePose();this.character.position.y=.04+Math.sin(this.time*2)*.01;this.character.rotation.z=0;this.character.scale.setScalar(.9);this.headPivot.rotation.x=0;this.tailPivot.rotation.z=-.22+Math.sin(this.time*2.2)*.04;
    }
  }
  animate(){
    let last=performance.now();
    const loop=now=>{const dt=Math.min(.05,(now-last)/1000);last=now;this.time+=dt;
      const diff=this.targetNorm-this.positionNorm;if(Math.abs(diff)>.002){this.positionNorm+=Math.sign(diff)*Math.min(Math.abs(diff),dt*this.options.moveSpeed);this.state='walk';}else if(this.state==='walk')this.state='idle';
      this.root.position.x=this.worldX(this.positionNorm);this.updateRig(dt);this.renderer.render(this.scene,this.camera);requestAnimationFrame(loop);};requestAnimationFrame(loop);
  }
  destroy(){this.ro.disconnect();this.renderer.dispose();this.layer.remove();}
}

window.Mascot3D=Mascot3D;
window.notifyMascotPosterChange=detail=>window.dispatchEvent(new CustomEvent('signage:poster-change',{detail}));
