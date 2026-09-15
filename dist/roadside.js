import * as T from './three.module.js';
import { createChaser } from './chaser.js';
const mat=(c,r=1)=>new T.MeshStandardMaterial({color:c,roughness:r});
const fur=mat('#786c5c'),chest=mat('#a09681'),darkFur=mat('#554f46'),ivory=mat('#b8b5a4'),hoof=mat('#333735'),eye=mat('#171d1e',.22);
function mesh(g,m,p,x=0,y=0,z=0){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;}
function ell(p,m,x,y,z,a,b,c){const o=mesh(new T.SphereGeometry(1,16,10),m,p,x,y,z);o.scale.set(a,b,c);return o;}
function bone(p,m,a,b,r1,r2){const va=new T.Vector3(...a),vb=new T.Vector3(...b),o=mesh(new T.CylinderGeometry(r2,r1,va.distanceTo(vb),9),m,p);o.position.copy(va.clone().add(vb).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),vb.sub(va).normalize());return o;}
export function createDeer(){
 const g=new T.Group();g.name='Deer';
 ell(g,fur,-.04,1.14,0,.77,.34,.29);ell(g,darkFur,.42,1.19,0,.32,.40,.30);
 ell(g,chest,-.10,.97,0,.51,.17,.245);ell(g,fur,-.58,1.17,0,.30,.33,.30);
 ell(g,ivory,-.77,1.14,0,.07,.23,.21);
 bone(g,fur,[.45,1.19,0],[.75,1.91,0],.25,.135);
 ell(g,chest,.64,1.48,-.01,.19,.40,.16);
 const head=ell(g,fur,.86,1.97,0,.25,.18,.155);head.rotation.z=-.14;
 const muzzle=ell(g,chest,1.08,1.89,0,.245,.11,.115);muzzle.rotation.z=-.12;
 ell(g,hoof,1.29,1.866,0,.055,.063,.09);
 for(const s of [-1,1]){
  ell(g,eye,.931,2.018,s*.14,.032,.032,.013);
  ell(g,ivory,.92,2.044,s*.138,.06,.013,.015);
  const ear=ell(g,fur,.697,2.15,s*.206,.083,.21,.077);ear.rotation.x=s*.73;ear.rotation.z=.25;
  const inner=ell(g,chest,.72,2.16,s*.228,.045,.14,.041);inner.rotation.x=s*.73;
  // Sweeping main beams with asymmetrical forward and upper tines.
  const nodes=[[.73,2.12,s*.095],[.61,2.40,s*.18],[.49,2.66,s*.31],[.35,2.91,s*.40],[.37,3.14,s*.42]];
  for(let i=0;i<nodes.length-1;i++)bone(g,ivory,nodes[i],nodes[i+1],.037-i*.007,.029-i*.007);
  bone(g,ivory,nodes[1],[.91,2.52,s*.22],.021,.005);
  bone(g,ivory,nodes[2],[.79,2.86,s*.36],.022,.005);
  bone(g,ivory,[.66,2.79,s*.34],[.68,3.08,s*.35],.011,.002);
  bone(g,ivory,nodes[3],[.12,3.06,s*.54],.016,.003);
  bone(g,ivory,[.49,2.65,s*.31],[.34,2.82,s*.62],.017,.004);
 }
 const tail=ell(g,fur,-.84,1.36,0,.17,.085,.09);tail.rotation.z=-.55;
 const legs=[];
 for(const x of [-.53,.46])for(const s of [-1,1]){
  const leg=new T.Group();leg.position.set(x,1.13,s*.19);g.add(leg);legs.push(leg);
  const back=x<0,knee=back?.16:-.025;
  bone(leg,fur,[0,0,0],[knee,-.45,0],back?.115:.084,.047);
  ell(leg,darkFur,knee,-.45,0,.057,.07,.049);
  bone(leg,chest,[knee,-.45,0],[-.025,-.99,0],.04,.023);
  bone(leg,hoof,[-.025,-.97,0],[.015,-1.055,0],.03,.037);
  ell(leg,hoof,.032,-1.065,0,.087,.05,.05);
  bone(leg,eye,[.067,-1.07,0],[.113,-1.07,0],.004,.004);
 }
 const mouth=new T.Object3D();mouth.position.set(1.32,1.86,0);g.add(mouth);
 g.userData={legs,mouth};return g;
}
export function createRoadsideEvents(scene){
 const snow=mat('#c9d6da'),ice=mat('#a8bbc3');
 const abandoned=new T.Group();abandoned.name='Abandoned car at 5 km';
 const shell=createChaser();shell.scale.setScalar(.92);shell.rotation.y=.15;shell.position.y=-.30;
 shell.traverse(o=>{if(!o.isMesh)return;o.material=o.material.clone();o.material.roughness=.98;o.material.metalness=0;if(o.material.emissive)o.material.emissive.set(0);o.material.color.lerp(new T.Color('#b4c4ca'),.68);});
 abandoned.add(shell);
 ell(abandoned,snow,0,1.15,.17,.77,.32,.87);
 ell(abandoned,snow,0,.76,-1.56,.83,.24,.67);
 ell(abandoned,snow,0,.79,1.73,.77,.24,.52);
 ell(abandoned,snow,.26,.06,.1,1.22,.48,2.50);
 ell(abandoned,ice,-.71,.28,.74,.30,.26,1.30);
 const man=new T.Group();man.name='Hitchhiker at 6 km';
 const coat=mat('#58616a'),pants=mat('#4a5258'),boots=mat('#343d43'),skin=mat('#a28d80'),trim=mat('#a4a69e');
 for(const s of [-1,1]){bone(man,pants,[s*.115,.89,0],[s*.14,.14,0],.105,.075);ell(man,boots,s*.14,.115,-.035,.10,.10,.18);}
 ell(man,coat,0,1.15,0,.27,.43,.18);
 ell(man,coat,0,1.66,0,.205,.25,.19);
 ell(man,trim,0,1.70,.125,.15,.18,.07);
 ell(man,skin,0,1.69,.171,.104,.13,.045);
 bone(man,coat,[.20,1.43,0],[.31,1.05,.02],.105,.078);
 ell(man,boots,.30,1.00,.02,.071,.095,.065);
 // Extended arm and upright thumb, facing approaching traffic.
 const arm=new T.Group();arm.position.set(-.20,1.43,0);man.add(arm);
 bone(arm,coat,[0,0,0],[-.37,-.06,-.08],.10,.073);
 bone(arm,coat,[-.37,-.06,-.08],[-.68,.10,-.11],.073,.059);
 ell(arm,boots,-.73,.13,-.12,.082,.072,.061);
 bone(arm,boots,[-.77,.14,-.12],[-.78,.26,-.12],.027,.021);
 ell(man,snow,-.10,1.53,.045,.15,.045,.13);
 ell(man,snow,.1,.06,0,.6,.21,.5);
 man.userData.arm=arm;
 const events=[{at:5000,offset:7.4,object:abandoned},{at:6000,offset:6.8,object:man}];
 for(const e of events){scene.add(e.object);e.object.visible=false;}
 return {events,update(distance,road,time){for(const e of events){const rel=e.at-distance;e.object.visible=rel>-45&&rel<240;e.object.position.set(road(e.at)+e.offset,0,-rel);}arm.rotation.z=Math.sin(time*.85)*.06;}};
}
// All exhaust and breath share one draw call and remain in world space as the road scrolls.
export function createVapor(scene){
 const count=260,pool=Array.from({length:count},()=>({age:99,life:0,base:0,vx:0,vy:0,vz:0}));
 const p=new Float32Array(count*3),sizes=new Float32Array(count),alpha=new Float32Array(count);
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(p,3));geo.setAttribute('size',new T.BufferAttribute(sizes,1));geo.setAttribute('opacity',new T.BufferAttribute(alpha,1));
 const material=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{pixelScale:{value:450},fogDensity:{value:.015},fogColor:{value:scene.fog.color},vaporColor:{value:new T.Color('#d9e5e9')}},vertexShader:`attribute float size;attribute float opacity;uniform float pixelScale;varying float a;varying float d;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);d=-mv.z;a=opacity;gl_Position=projectionMatrix*mv;gl_PointSize=clamp(size*pixelScale/max(1.,d),1.,130.);}`,fragmentShader:`uniform vec3 vaporColor;uniform vec3 fogColor;uniform float fogDensity;varying float a;varying float d;void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;float soft=pow(1.-r*r,3.);float fog=1.-exp(-fogDensity*fogDensity*d*d);gl_FragColor=vec4(mix(vaporColor,fogColor,fog),a*soft*(1.-fog*.8));}`});
 const cloud=new T.Points(geo,material);cloud.frustumCulled=false;scene.add(cloud);
 let cursor=0,previousDistance=0,exhaustClock=0,breathClock=0;
 const point=new T.Vector3(),direction=new T.Vector3();
 function emit(origin,vx,vy,vz,base,life,opacity){const i=cursor++%count;pool[i]={age:0,life,base,vx,vy,vz,opacity};p[i*3]=origin.x;p[i*3+1]=origin.y;p[i*3+2]=origin.z;}
 return {reset(distance=0){previousDistance=distance;for(const v of pool)v.age=99;alpha.fill(0);},update(dt,distance,time,car,deer,active,height,pixelRatio){
  const delta=distance-previousDistance;previousDistance=distance;
  for(let i=0;i<count;i++){const v=pool[i];v.age+=dt;if(v.age>=v.life){alpha[i]=0;continue;}p[i*3]+=v.vx*dt;p[i*3+1]+=v.vy*dt;p[i*3+2]+=delta+v.vz*dt;const t=v.age/v.life;sizes[i]=v.base*(.5+t*3);alpha[i]=v.opacity*Math.min(1,t*6)*Math.pow(1-t,1.6);}
  if(active){car.updateMatrixWorld(true);exhaustClock+=dt;while(exhaustClock>.055){exhaustClock-=.055;point.set(.65,.292,2.36);car.localToWorld(point);emit(point,-.12+Math.random()*.3,.32+Math.random()*.15,.8,.55,2.3,.45);}}
  breathClock+=dt;if(breathClock>.10){breathClock=0;for(let i=0;i<deer.length;i++){const d=deer[i];if(Math.abs(d.position.z)>135||(time+i*1.37)%4.2>.85)continue;d.updateMatrixWorld(true);d.userData.mouth.getWorldPosition(point);direction.set(1,0,0).applyQuaternion(d.quaternion);emit(point,direction.x*.38,.14,direction.z*.38,.28,1.5,.40);}}
  for(const name of ['position','size','opacity'])geo.attributes[name].needsUpdate=true;material.uniforms.pixelScale.value=height*pixelRatio*.85;material.uniforms.fogDensity.value=scene.fog.density;
 }};
}
