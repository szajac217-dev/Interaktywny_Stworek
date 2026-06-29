import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/DRACOLoader.js';
import { StyledMascot3DLeanFix } from './mascot-3d-lean-fix.js';

const wait=(ms)=>new Promise(resolve=>setTimeout(resolve,ms));
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));

export class MascotGLB extends StyledMascot3DLeanFix {
  constructor(options={}){
    super(options);
    this.modelUrl=options.modelUrl||'assets/model/fox-mascot.glb';
    this.finalModel=null;
    this.mixer=null;
    this.actions=new Map();
    this.activeAction=null;
    this.finalModelReady=false;
    this.loadFinalModel();
  }

  async loadFinalModel(){
    const loader=new GLTFLoader();
    const draco=new DRACOLoader();
    draco.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/libs/draco/');
    loader.setDRACOLoader(draco);

    try{
      const gltf=await loader.loadAsync(this.modelUrl);
      this.finalModel=gltf.scene;
      this.finalModel.name='FoxMascotFinal';
      this.finalModel.traverse((node)=>{
        if(node.isMesh){
          node.castShadow=false;
          node.receiveShadow=false;
          if(node.material){
            node.material.envMapIntensity=.45;
            node.material.needsUpdate=true;
          }
        }
      });

      const box=new THREE.Box3().setFromObject(this.finalModel);
      const size=new THREE.Vector3();
      const center=new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);
      const targetHeight=3.55;
      const scale=targetHeight/Math.max(.001,size.y);
      this.finalModel.scale.setScalar(scale);
      this.finalModel.position.set(-center.x*scale,-box.min.y*scale,-center.z*scale);

      this.character.visible=false;
      this.root.add(this.finalModel);
      this.mixer=new THREE.AnimationMixer(this.finalModel);
      for(const clip of gltf.animations){
        this.actions.set(clip.name,this.mixer.clipAction(clip));
      }
      this.finalModelReady=true;
      this.playAnimation('Idle',.15,true);
      this.layer.dispatchEvent(new CustomEvent('mascot:model-ready',{bubbles:true,detail:{mode:'glb',animations:[...this.actions.keys()]}}));
    }catch(error){
      console.warn('Finalny GLB nie jest jeszcze dostępny. Używam modelu proceduralnego.',error);
      this.finalModelReady=false;
      this.character.visible=true;
      this.layer.dispatchEvent(new CustomEvent('mascot:model-ready',{bubbles:true,detail:{mode:'procedural-fallback'}}));
    }
  }

  findAction(name){
    if(this.actions.has(name))return this.actions.get(name);
    const wanted=name.toLowerCase();
    for(const [key,action] of this.actions){
      if(key.toLowerCase()===wanted)return action;
    }
    return null;
  }

  playAnimation(name,fade=.18,loop=true){
    if(!this.finalModelReady||!this.mixer)return false;
    const next=this.findAction(name);
    if(!next)return false;
    next.enabled=true;
    next.reset();
    next.setLoop(loop?THREE.LoopRepeat:THREE.LoopOnce,loop?Infinity:1);
    next.clampWhenFinished=!loop;
    if(this.activeAction&&this.activeAction!==next)this.activeAction.crossFadeTo(next,fade,false);
    next.play();
    this.activeAction=next;
    return true;
  }

  moveTo(norm){
    super.moveTo(norm);
    if(this.finalModelReady)this.playAnimation('Walk',.18,true);
  }

  async leanOn(side){
    if(!this.finalModelReady)return super.leanOn(side);
    this.busy=true;
    this.climbOffsetWorld=0;
    this.moveTo(side==='left'?0:1);
    await this.waitArrival();
    const clip=side==='left'?'Lean_LeftQR_RightHand':'Lean_RightQR_LeftHand';
    if(!this.playAnimation(clip,.20,false))return super.leanOn(side);
    await this.say('👀',1500);
    await wait(900);
    this.playAnimation('Idle',.20,true);
    this.state='idle';
    this.busy=false;
  }

  async climb(side){
    if(!this.finalModelReady)return super.climb(side);
    this.busy=true;
    const direction=side==='left'?-1:1;
    this.moveTo(side==='left'?0:1);
    await this.waitArrival();
    this.layer.classList.add('is-climbing');
    this.state=side==='left'?'climb-left':'climb-right';
    const clip=side==='left'?'Climb_Left':'Climb_Right';
    this.playAnimation(clip,.18,false);
    await this.tweenClimbOffset(direction*this.options.climbExcursionWorld,420);
    await this.say('😄',1200);
    await wait(650);
    await this.tweenClimbOffset(0,460);
    this.playAnimation('Idle',.20,true);
    this.state='idle';
    this.layer.classList.remove('is-climbing');
    this.busy=false;
  }

  async react(input){
    if(!this.finalModelReady)return super.react(input);
    const text=String(input.category||input.title||'').toLowerCase();
    if(/sport|rower|bieg/.test(text))return this.climb('left');
    if(/warsztat/.test(text))return this.leanOn('left');

    this.busy=true;
    this.moveTo(.55);
    await this.waitArrival();
    let animation='LookUp';
    let bubble='👀';
    if(/koncert/.test(text)){animation='Happy';bubble='🎵';}
    if(/rodzin/.test(text)){animation='Wave';bubble='🥳';}
    if(/kino/.test(text)){animation='Surprised';bubble='🎬';}
    this.playAnimation(animation,.18,false);
    await this.say(bubble,1300);
    await wait(850);
    this.playAnimation('Idle',.20,true);
    this.state='idle';
    this.busy=false;
  }

  updateRig(dt){
    if(this.finalModelReady){
      if(this.mixer)this.mixer.update(dt);
      if(this.state==='walk'&&Math.abs(this.targetNorm-this.positionNorm)<.003){
        this.state='idle';
        this.playAnimation('Idle',.18,true);
      }
      return;
    }
    super.updateRig(dt);
  }
}

window.MascotGLB=MascotGLB;
