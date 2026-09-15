import * as T from './three.module.js';
import { createChaser } from './chaser.js';
const mat=(c,r=1)=>new T.MeshStandardMaterial({color:c,roughness:r});
const fur=mat('#786c5c'),chest=mat('#a09681'),darkFur=mat('#554f46'),ivory=mat('#b8b5a4'),hoof=mat('#333735'),eye=mat('#171d1e',.22);
function mesh(g,m,p,x=0,y=0,z=0){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;}
function ell(p,m,x,y,z,a,b,c){const o=mesh(new T.SphereGeometry(1,16,10),m,p,x,y,z);o.scale.set(a,b,c);return o;}
function bone(p,m,a,b,r1,r2){const va=new T.Vector3(...a),vb=new T.Vector3(...b),o=mesh(new T.CylinderGeometry(r2,r1,va.distanceTo(vb),9),m,p);o.position.copy(va.clone().add(vb).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),vb.sub(va).normalize());return o;}
export { createDeer } from './deer.js';
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
// Exhaust, tyre powder and breath share one bounded particle pool and draw call.
export function createVapor(scene){
 const count=360,pool=Array.from({length:count},()=>({age:99,life:0,base:0,vx:0,vy:0,vz:0}));
 const p=new Float32Array(count*3),sizes=new Float32Array(count),alpha=new Float32Array(count);
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(p,3));geo.setAttribute('size',new T.BufferAttribute(sizes,1));geo.setAttribute('opacity',new T.BufferAttribute(alpha,1));
 const material=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{pixelScale:{value:450},fogDensity:{value:.015},fogColor:{value:scene.fog.color},vaporColor:{value:new T.Color('#f1f1ec')}},vertexShader:`attribute float size;attribute float opacity;uniform float pixelScale;varying float a;varying float d;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);d=-mv.z;a=opacity;gl_Position=projectionMatrix*mv;gl_PointSize=clamp(size*pixelScale/max(1.,d),1.,130.);}`,fragmentShader:`uniform vec3 vaporColor;uniform vec3 fogColor;uniform float fogDensity;varying float a;varying float d;void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;float soft=pow(1.-r*r,3.);float fog=1.-exp(-fogDensity*fogDensity*d*d);gl_FragColor=vec4(mix(vaporColor,fogColor,fog),a*soft*(1.-fog*.8));}`});
 const tracks=createTyreTracks(scene);
 const cloud=new T.Points(geo,material);cloud.name="Warm exhaust and pale tyre powder";cloud.frustumCulled=false;scene.add(cloud);
 let cursor=0,previousDistance=0,exhaustClock=0,snowClock=0,breathClock=0;
 const point=new T.Vector3(),direction=new T.Vector3();
 function emit(origin,vx,vy,vz,base,life,opacity,scroll=1){const i=cursor++%count;pool[i]={age:0,life,base,vx,vy,vz,opacity,scroll};sizes[i]=base*.5;alpha[i]=opacity*.8;p[i*3]=origin.x;p[i*3+1]=origin.y;p[i*3+2]=origin.z;}
 return {reset(distance=0){previousDistance=distance;tracks.reset();exhaustClock=snowClock=breathClock=0;for(const v of pool)v.age=99;alpha.fill(0);},update(dt,distance,time,car,deer,active,height,pixelRatio){
  const delta=distance-previousDistance;previousDistance=distance;tracks.update(dt,delta,car,active,deer);
  for(let i=0;i<count;i++){const v=pool[i];v.age+=dt;if(v.age>=v.life){alpha[i]=0;continue;}p[i*3]+=v.vx*dt;p[i*3+1]+=v.vy*dt;p[i*3+2]+=delta*v.scroll+v.vz*dt;const t=v.age/v.life;sizes[i]=v.base*(.5+t*3);alpha[i]=v.opacity*(.8+.2*Math.min(1,t*8))*Math.pow(1-t,1.6);}
  if(active){
   car.updateMatrixWorld(true);
   // Warm exhaust stays in the vehicle wake briefly, then expands and fades.
   exhaustClock+=dt;
   while(exhaustClock>=.035){exhaustClock-=.035;point.set(.65,.292,2.36);car.localToWorld(point);direction.set((Math.random()-.5)*.18,.24+Math.random()*.14,.9).applyQuaternion(car.quaternion);emit(point,direction.x,direction.y,direction.z,.48,1.35,.38,.25);}
   // Continuous low powder plumes at the actual rear tyre contact points.
   if(delta>0){snowClock+=dt;while(snowClock>=.025){snowClock-=.025;for(const side of [-1,1]){point.set(side*.886,.10,1.62);car.localToWorld(point);direction.set(side*(.18+Math.random()*.25),.12+Math.random()*.16,.75+Math.random()*.4).applyQuaternion(car.quaternion);emit(point,direction.x,direction.y,direction.z,.32+Math.random()*.12,.65+Math.random()*.2,.24,.55);}}}
   else snowClock=0;
  }
  breathClock+=dt;if(breathClock>.10){breathClock=0;for(let i=0;i<deer.length;i++){const d=deer[i];if(Math.abs(d.position.z)>135||(time+i*1.37)%4.2>.85)continue;d.updateMatrixWorld(true);d.userData.mouth.getWorldPosition(point);direction.set(1,0,0).applyQuaternion(d.quaternion);emit(point,direction.x*.38,.14,direction.z*.38,.28,1.5,.40);}}
  for(const name of ['position','size','opacity'])geo.attributes[name].needsUpdate=true;material.uniforms.pixelScale.value=height*pixelRatio*.85;material.uniforms.fogDensity.value=scene.fog.density;
 }};
}

// One setting controls the faintness and colour of both tyre and hoof prints.
export const SNOW_TRACK_STYLE={opacity:.05,tint:"#85918f"};
// Faint compressed snow stays on the scrolling road.
function createTyreTracks(scene){
 const count=320,positions=new Float32Array(count*18),opacity=new Float32Array(count*6),uv=new Float32Array(count*12),ages=new Float32Array(count).fill(99);
 const shapes=new Float32Array(count*6),lifetimes=new Float32Array(count).fill(2.4);
 const deerState=new Map();let hoofCursor=160;
 const geometry=new T.BufferGeometry();
 geometry.setAttribute('shape',new T.BufferAttribute(shapes,1));geometry.setAttribute('position',new T.BufferAttribute(positions,3));geometry.setAttribute('opacity',new T.BufferAttribute(opacity,1));geometry.setAttribute('uv',new T.BufferAttribute(uv,2));
 const material=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,uniforms:{tint:{value:new T.Color(SNOW_TRACK_STYLE.tint)}},vertexShader:`attribute float opacity;attribute float shape;varying float a;varying float hoof;varying vec2 vUv;void main(){a=opacity;hoof=shape;vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform vec3 tint;varying float a;varying float hoof;varying vec2 vUv;void main(){float edge=smoothstep(0.,.25,vUv.x)*smoothstep(0.,.25,1.-vUv.x);if(hoof>.5){vec2 q=(vUv-.5)*2.;float split=smoothstep(0.,.12,abs(q.x));edge=(1.-smoothstep(.55,1.,length(q)))*split;}gl_FragColor=vec4(tint,a*edge);}`});
 const mesh=new T.Mesh(geometry,material);mesh.name='Faint tyre and deer hoof tracks';mesh.frustumCulled=false;scene.add(mesh);
 const previous=[null,null],point=new T.Vector3();let cursor=0;
 return {reset(){ages.fill(99);opacity.fill(0);previous.fill(null);deerState.clear();cursor=0;hoofCursor=160;geometry.attributes.opacity.needsUpdate=true;},update(dt,delta,car,active,deer=[]){
  for(let i=0;i<count;i++){ages[i]+=dt;for(let v=0;v<6;v++){positions[i*18+v*3+2]+=delta;opacity[i*6+v]=Math.max(0,1-ages[i]/lifetimes[i])*SNOW_TRACK_STYLE.opacity;}}
  for(const p of previous)if(p)p.z+=delta;
  if(active&&delta>0){car.updateMatrixWorld(true);for(let side=0;side<2;side++){
   point.set((side?1:-1)*.886,.014,1.4);car.localToWorld(point);point.y=.014;
   const old=previous[side];if(old&&old.distanceTo(point)<3){
    const i=cursor++%160;ages[i]=0;const wx=Math.cos(car.rotation.y)*.143,wz=-Math.sin(car.rotation.y)*.143;
    const corners=[[old.x-wx,old.z-wz],[old.x+wx,old.z+wz],[point.x-wx,point.z-wz],[point.x+wx,point.z+wz]],order=[0,1,2,2,1,3];
    for(let v=0;v<6;v++){const c=order[v];positions.set([corners[c][0],.014,corners[c][1]],i*18+v*3);uv.set([c%2,c<2?0:1],i*12+v*2);opacity[i*6+v]=SNOW_TRACK_STYLE.opacity;}
   }previous[side]=point.clone();
  }}else previous.fill(null);
  if(active){for(const d of deer){
   if(Math.abs(d.position.z)>140){deerState.delete(d);continue;}
   let state=deerState.get(d);
   if(!state){deerState.set(d,{position:d.position.clone(),travel:0,step:0});continue;}
   state.position.z+=delta;const moved=state.position.distanceTo(d.position);state.position.copy(d.position);
   if(moved>3){state.travel=0;continue;}state.travel+=moved;
   if(state.travel<.38)continue;state.travel%=.38;
   d.updateMatrixWorld(true);
   for(const legIndex of (state.step++%2?[1,2]:[0,3])){
    const leg=d.userData.legs?.[legIndex];if(!leg)continue;
    point.set(.04,-1.09,0);leg.localToWorld(point);
    const i=hoofCursor++;if(hoofCursor>=count)hoofCursor=160;ages[i]=0;lifetimes[i]=8;
    const cos=Math.cos(d.rotation.y),sin=Math.sin(d.rotation.y),order=[0,1,2,2,1,3];
    for(let v=0;v<6;v++){const c=order[v],x=(c<2?-.09:.09),z=(c%2?1:-1)*.055;
     positions.set([point.x+x*cos+z*sin,.014,point.z-x*sin+z*cos],i*18+v*3);
     uv.set([c%2,c<2?0:1],i*12+v*2);shapes[i*6+v]=1;opacity[i*6+v]=SNOW_TRACK_STYLE.opacity;
    }
   }
  }}else deerState.clear();
  for(const name of ['position','opacity','uv','shape'])geometry.attributes[name].needsUpdate=true;
 }};
}
