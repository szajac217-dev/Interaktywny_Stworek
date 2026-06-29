import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { Mascot3D } from './mascot-3d.js';

export class StyledMascot3D extends Mascot3D {
  mat(color,rough=.72){return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:0});}

  limb(name,side,parent,x,y){
    const cream=this.mat(0xefe3c3,.92),green=this.mat(0x3f6f28,.78),fur=this.mat(0xe87528,.88);
    const pivot=new THREE.Group();pivot.name=name;pivot.position.set(x,y,0);parent.add(pivot);
    const upper=this.mesh(new THREE.CapsuleGeometry(.145,.62,6,14),cream,pivot,[0,-.34,0]);upper.scale.z=.9;
    const stripe=this.mesh(new THREE.CapsuleGeometry(.155,.64,6,14),green,pivot,[side==='left'?.11:-.11,-.34,-.02]);stripe.scale.set(.34,1.01,.94);
    const lowerPivot=new THREE.Group();lowerPivot.position.set(0,-.70,0);pivot.add(lowerPivot);
    const sleeve=this.mesh(new THREE.CapsuleGeometry(.125,.42,6,14),cream,lowerPivot,[0,-.25,0]);sleeve.scale.z=.9;
    const cuff=this.mesh(new THREE.CylinderGeometry(.14,.14,.16,18),green,lowerPivot,[0,-.51,0]);
    const hand=this.mesh(new THREE.SphereGeometry(.16,18,14),fur,lowerPivot,[0,-.66,0]);hand.scale.set(.9,1.14,.78);
    return {pivot,lowerPivot,hand,side};
  }

  leg(name,side,parent,x,y){
    const pants=this.mat(0x2f4328,.88),fur=this.mat(0xe87528,.88),shoeGreen=this.mat(0x596c2f,.62),shoeCream=this.mat(0xefe7d4,.58),sole=this.mat(0xc9c0ad,.52),orange=this.mat(0xd56d24,.64);
    const pivot=new THREE.Group();pivot.name=name;pivot.position.set(x,y,0);parent.add(pivot);
    const thigh=this.mesh(new THREE.CapsuleGeometry(.19,.56,6,14),pants,pivot,[0,-.31,0]);thigh.scale.z=.9;
    const knee=new THREE.Group();knee.position.set(0,-.67,0);pivot.add(knee);
    const calf=this.mesh(new THREE.CapsuleGeometry(.145,.40,6,14),fur,knee,[0,-.24,0]);calf.scale.z=.9;
    const cuff=this.mesh(new THREE.CylinderGeometry(.16,.16,.15,18),pants,knee,[0,-.48,0]);
    const foot=new THREE.Group();foot.position.set(0,-.63,.10);knee.add(foot);
    const base=this.mesh(new THREE.BoxGeometry(.38,.19,.68),shoeCream,foot,[0,0,.05]);base.geometry.translate(0,0,.08);
    const upper=this.mesh(new THREE.BoxGeometry(.34,.18,.50),shoeGreen,foot,[0,.09,.02]);upper.rotation.x=-.08;
    const soleMesh=this.mesh(new THREE.BoxGeometry(.42,.08,.72),sole,foot,[0,-.11,.08]);
    const accent=this.mesh(new THREE.BoxGeometry(.08,.12,.50),orange,foot,[side==='left'?.11:-.11,.07,.04]);accent.rotation.z=side==='left'?.12:-.12;
    foot.rotation.x=-.10;
    return {pivot,knee,foot,side};
  }

  buildModel(){
    const fur=this.mat(0xe87528,.9),furDark=this.mat(0x6b341c,.9),creamFur=this.mat(0xf2d5ad,.95),cream=this.mat(0xefe3c3,.93),green=this.mat(0x4f7a2e,.80),darkGreen=this.mat(0x2f4328,.88),black=this.mat(0x15120f,.38),amber=this.mat(0xb86f14,.34),white=this.mat(0xffffff,.42);
    this.root=new THREE.Group();this.scene.add(this.root);
    this.character=new THREE.Group();this.root.add(this.character);this.character.scale.setScalar(.84);

    this.body=this.mesh(new THREE.CapsuleGeometry(.58,.92,8,20),cream,this.character,[0,1.58,0]);this.body.scale.z=.74;
    const hoodieTop=this.mesh(new THREE.TorusGeometry(.50,.12,10,28),green,this.character,[0,2.20,.02]);hoodieTop.rotation.x=Math.PI/2;hoodieTop.scale.y=.62;
    const hem=this.mesh(new THREE.CylinderGeometry(.58,.58,.18,24),green,this.character,[0,1.02,0]);hem.scale.z=.76;
    const pocket=this.mesh(new THREE.BoxGeometry(.60,.28,.08),cream,this.character,[0,1.39,.54]);pocket.rotation.x=-.06;
    const pantsHip=this.mesh(new THREE.CapsuleGeometry(.47,.38,6,18),darkGreen,this.character,[0,.92,0]);pantsHip.scale.z=.76;

    this.headPivot=new THREE.Group();this.headPivot.position.set(0,2.70,0);this.character.add(this.headPivot);
    const skull=this.mesh(new THREE.SphereGeometry(.73,28,22),fur,this.headPivot,[0,.02,0]);skull.scale.set(1.0,.98,.90);
    const cheekL=this.mesh(new THREE.SphereGeometry(.34,22,16),creamFur,this.headPivot,[-.28,-.20,.50]);cheekL.scale.set(1.2,.82,.72);
    const cheekR=this.mesh(new THREE.SphereGeometry(.34,22,16),creamFur,this.headPivot,[.28,-.20,.50]);cheekR.scale.set(1.2,.82,.72);
    const muzzle=this.mesh(new THREE.SphereGeometry(.30,22,16),creamFur,this.headPivot,[0,-.25,.67]);muzzle.scale.set(1.05,.70,.78);

    const earGeo=new THREE.ConeGeometry(.31,.82,4);const el=this.mesh(earGeo,fur,this.headPivot,[-.46,.69,-.03]);el.rotation.z=.30;el.rotation.x=.03;const er=this.mesh(earGeo,fur,this.headPivot,[.46,.69,-.03]);er.rotation.z=-.30;er.rotation.x=.03;
    const innerGeo=new THREE.ConeGeometry(.18,.55,4);const eil=this.mesh(innerGeo,creamFur,this.headPivot,[-.46,.70,.12]);eil.rotation.z=.30;const eir=this.mesh(innerGeo,creamFur,this.headPivot,[.46,.70,.12]);eir.rotation.z=-.30;
    const tipL=this.mesh(new THREE.ConeGeometry(.13,.30,4),furDark,this.headPivot,[-.56,1.02,-.02]);tipL.rotation.z=.30;const tipR=this.mesh(new THREE.ConeGeometry(.13,.30,4),furDark,this.headPivot,[.56,1.02,-.02]);tipR.rotation.z=-.30;

    for(const x of [-.24,.24]){
      const eyeWhite=this.mesh(new THREE.SphereGeometry(.17,20,16),white,this.headPivot,[x,.03,.64]);eyeWhite.scale.set(.92,1.20,.48);
      const iris=this.mesh(new THREE.SphereGeometry(.09,18,14),amber,this.headPivot,[x,.03,.76]);iris.scale.z=.45;
      const pupil=this.mesh(new THREE.SphereGeometry(.045,16,12),black,this.headPivot,[x,.03,.82]);pupil.scale.z=.35;
      this.mesh(new THREE.SphereGeometry(.018,10,8),white,this.headPivot,[x-.018,.065,.845]);
    }
    const nose=this.mesh(new THREE.SphereGeometry(.11,18,14),black,this.headPivot,[0,-.23,.91]);nose.scale.set(1.05,.75,.62);
    const browL=this.mesh(new THREE.CapsuleGeometry(.035,.18,4,10),furDark,this.headPivot,[-.23,.26,.72]);browL.rotation.z=-1.35;const browR=this.mesh(new THREE.CapsuleGeometry(.035,.18,4,10),furDark,this.headPivot,[.23,.26,.72]);browR.rotation.z=1.35;

    this.hair=new THREE.Group();this.hair.position.set(0,.75,-.02);this.headPivot.add(this.hair);
    const locks=[[-.18,.06,.28],[-.06,.14,.38],[.06,.12,.35],[.18,.04,.26]];
    locks.forEach(([x,y,h],i)=>{const lock=this.mesh(new THREE.ConeGeometry(.12,h,8),furDark,this.hair,[x,y,0]);lock.rotation.z=(i-1.5)*.16;lock.rotation.x=-.12;});

    this.leftArm=this.limb('leftArm','left',this.character,.64,2.11);
    this.rightArm=this.limb('rightArm','right',this.character,-.64,2.11);
    this.leftLeg=this.leg('leftLeg','left',this.character,.25,.98);
    this.rightLeg=this.leg('rightLeg','right',this.character,-.25,.98);

    this.tailPivot=new THREE.Group();this.tailPivot.position.set(-.48,1.34,-.16);this.character.add(this.tailPivot);
    const tailBase=this.mesh(new THREE.CapsuleGeometry(.22,1.05,7,16),fur,this.tailPivot,[-.34,-.03,-.12]);tailBase.rotation.z=1.03;tailBase.rotation.x=.12;tailBase.scale.set(1.18,1,.92);
    const tailTip=this.mesh(new THREE.CapsuleGeometry(.20,.43,7,16),creamFur,this.tailPivot,[-.84,-.34,-.10]);tailTip.rotation.z=1.03;tailTip.rotation.x=.12;tailTip.scale.set(1.05,1,.90);

    const logoBase=this.mesh(new THREE.BoxGeometry(.18,.22,.025),green,this.character,[.26,1.78,.59]);logoBase.rotation.z=-.18;
    const logoAccent=this.mesh(new THREE.BoxGeometry(.10,.08,.03),this.mat(0xe28a24,.68),this.character,[.26,1.76,.61]);logoAccent.rotation.z=-.18;

    this.shadow=this.mesh(new THREE.CircleGeometry(.82,36),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.20,depthWrite:false}),this.root,[0,.015,-.3]);this.shadow.rotation.x=-Math.PI/2;
    this.setIdlePose();
  }
}

window.StyledMascot3D=StyledMascot3D;
