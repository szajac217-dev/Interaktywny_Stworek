import { StyledMascot3D } from './mascot-3d-styled.js';

const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
const wait=(ms)=>new Promise(resolve=>setTimeout(resolve,ms));

export class StyledMascot3DLeanFix extends StyledMascot3D {
  constructor(options={}){
    super({safeInsetPx:38,climbExcursionWorld:.52,...options});
    this.climbOffsetWorld=0;
  }

  resize(){
    const w=Math.max(1,this.layer.clientWidth||this.host.clientWidth);
    const h=Math.max(1,this.layer.clientHeight||this.host.clientHeight);
    this.renderer.setSize(w,h,false);
    const aspect=w/h;
    const height=4.8;
    this.camera.left=-height*aspect/2;
    this.camera.right=height*aspect/2;
    this.camera.top=height/2;
    this.camera.bottom=-height/2;
    this.camera.updateProjectionMatrix();
  }

  worldX(norm){
    const hostRect=this.host.getBoundingClientRect();
    const layerRect=this.layer.getBoundingClientRect();
    const layerWidth=Math.max(1,layerRect.width);
    const cameraWidth=this.camera.right-this.camera.left;
    const inset=Math.min(this.options.safeInsetPx,Math.max(18,hostRect.width*.18));
    const safeLeftPx=(hostRect.left-layerRect.left)+inset;
    const safeRightPx=(hostRect.right-layerRect.left)-inset;
    const safePx=safeLeftPx+(safeRightPx-safeLeftPx)*clamp(norm,0,1);
    const safeWorld=this.camera.left+(safePx/layerWidth)*cameraWidth;
    return safeWorld+this.climbOffsetWorld;
  }

  moveTo(norm){
    this.targetNorm=clamp(norm,0,1);
    this.state='walk';
  }

  async leanOn(side){
    this.busy=true;
    this.climbOffsetWorld=0;
    this.layer.classList.remove('is-climbing');
    this.moveTo(side==='left'?0:1);
    await this.waitArrival();
    this.state=side==='left'?'lean-left':'lean-right';
    await this.say('👀',1500);
    await wait(900);
    this.state='idle';
    this.busy=false;
  }

  async tweenClimbOffset(target,duration){
    const start=this.climbOffsetWorld;
    const started=performance.now();
    return new Promise(resolve=>{
      const step=(now)=>{
        const t=clamp((now-started)/duration,0,1);
        const eased=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
        this.climbOffsetWorld=start+(target-start)*eased;
        if(t<1)requestAnimationFrame(step);else resolve();
      };
      requestAnimationFrame(step);
    });
  }

  async climb(side){
    this.busy=true;
    const direction=side==='left'?-1:1;
    this.moveTo(side==='left'?0:1);
    await this.waitArrival();
    this.layer.classList.add('is-climbing');
    this.state=side==='left'?'climb-left':'climb-right';
    await this.tweenClimbOffset(direction*this.options.climbExcursionWorld,420);
    await this.say('😄',1200);
    await wait(650);
    await this.tweenClimbOffset(0,460);
    this.state='idle';
    this.layer.classList.remove('is-climbing');
    this.targetNorm=side==='left'?0:1;
    this.busy=false;
  }

  updateRig(dt){
    super.updateRig(dt);

    if(this.state==='lean-left'){
      this.character.rotation.z=-.045;
      this.character.position.y=.025;
      this.character.position.x=.05;
      this.headPivot.rotation.z=.03;
      this.rightArm.pivot.rotation.set(-.05,0,-1.46);
      this.rightArm.lowerPivot.rotation.set(0,0,-.08);
      this.rightArm.hand.rotation.z=.08;
      this.leftArm.pivot.rotation.z=.18;
      this.leftArm.lowerPivot.rotation.z=-.06;
      this.leftLeg.pivot.rotation.z=.08;
      this.rightLeg.pivot.rotation.z=-.10;
      this.tailPivot.rotation.z=-.13;
    }

    if(this.state==='lean-right'){
      this.character.rotation.z=.045;
      this.character.position.y=.025;
      this.character.position.x=-.05;
      this.headPivot.rotation.z=-.03;
      this.leftArm.pivot.rotation.set(-.05,0,1.46);
      this.leftArm.lowerPivot.rotation.set(0,0,.08);
      this.leftArm.hand.rotation.z=-.08;
      this.rightArm.pivot.rotation.z=-.18;
      this.rightArm.lowerPivot.rotation.z=.06;
      this.leftLeg.pivot.rotation.z=.10;
      this.rightLeg.pivot.rotation.z=-.08;
      this.tailPivot.rotation.z=-.31;
    }
  }
}

window.StyledMascot3DLeanFix=StyledMascot3DLeanFix;
