import { StyledMascot3D } from './mascot-3d-styled.js';

const lerp=(a,b,t)=>a+(b-a)*t;
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));

export class StyledMascot3DLeanFix extends StyledMascot3D {
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
    const cameraWidth=this.camera.right-this.camera.left;
    const bodySafety=3.55;
    const span=Math.max(.5,cameraWidth-bodySafety);
    return lerp(-span/2,span/2,clamp(norm,0,1));
  }

  updateRig(dt){
    super.updateRig(dt);

    if(this.state==='lean-left'){
      this.character.rotation.z=-.055;
      this.character.position.y=.025;
      this.character.position.x=.10;
      this.headPivot.rotation.z=.035;
      this.rightArm.pivot.rotation.x=-.08;
      this.rightArm.pivot.rotation.y=0;
      this.rightArm.pivot.rotation.z=-1.48;
      this.rightArm.lowerPivot.rotation.x=0;
      this.rightArm.lowerPivot.rotation.y=0;
      this.rightArm.lowerPivot.rotation.z=-.10;
      this.rightArm.hand.rotation.z=.08;
      this.leftArm.pivot.rotation.z=.20;
      this.leftArm.lowerPivot.rotation.z=-.08;
      this.leftLeg.pivot.rotation.z=.10;
      this.rightLeg.pivot.rotation.z=-.12;
      this.tailPivot.rotation.z=-.12;
    }

    if(this.state==='lean-right'){
      this.character.rotation.z=.055;
      this.character.position.y=.025;
      this.character.position.x=-.10;
      this.headPivot.rotation.z=-.035;
      this.leftArm.pivot.rotation.x=-.08;
      this.leftArm.pivot.rotation.y=0;
      this.leftArm.pivot.rotation.z=1.48;
      this.leftArm.lowerPivot.rotation.x=0;
      this.leftArm.lowerPivot.rotation.y=0;
      this.leftArm.lowerPivot.rotation.z=.10;
      this.leftArm.hand.rotation.z=-.08;
      this.rightArm.pivot.rotation.z=-.20;
      this.rightArm.lowerPivot.rotation.z=.08;
      this.leftLeg.pivot.rotation.z=.12;
      this.rightLeg.pivot.rotation.z=-.10;
      this.tailPivot.rotation.z=-.32;
    }
  }
}

window.StyledMascot3DLeanFix=StyledMascot3DLeanFix;
