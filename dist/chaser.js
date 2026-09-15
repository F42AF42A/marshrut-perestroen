import * as T from './three.module.js';
// Deterministic fern-like ice crystals; generated once and shared by both cars.
let frostTextures;
function getFrostTextures(){
 if(frostTextures)return frostTextures;
 const size=512,field=new Float32Array(size*size);let seed=481229;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 function line(x,y,xx,yy,strength,width=.8){
  const steps=Math.max(1,Math.ceil(Math.hypot(xx-x,yy-y)));
  for(let n=0;n<=steps;n++){const px=x+(xx-x)*n/steps,py=y+(yy-y)*n/steps;
   for(let j=Math.floor(py-width-1);j<=Math.ceil(py+width+1);j++)for(let i=Math.floor(px-width-1);i<=Math.ceil(px+width+1);i++){
    if(i<0||j<0||i>=size||j>=size)continue;
    const a=Math.max(0,1-Math.hypot(i-px,j-py)/(width+1))*strength;
    field[j*size+i]=Math.max(field[j*size+i],a);
   }
  }
 }
 for(let fern=0;fern<32;fern++){
  let x=random()*size,y=random()*size,angle=-Math.PI/2+(random()-.5)*2.7;
  const length=75+random()*170,curve=(random()-.5)*.018;
  for(let step=0;step<length;step+=4){
   const nx=x+Math.cos(angle)*4,ny=y+Math.sin(angle)*4;line(x,y,nx,ny,.9,1);
   const reach=(1-step/length)*(15+length*.19);
   for(const side of [-1,1]){
    const a=angle+side*.7,bx=nx+Math.cos(a)*reach,by=ny+Math.sin(a)*reach;
    line(nx,ny,bx,by,.68,.65);
    for(let k=.3;k<.95;k+=.22){const sx=nx+(bx-nx)*k,sy=ny+(by-ny)*k,twig=reach*(1-k)*.34;
     line(sx,sy,sx+Math.cos(a+side*.48)*twig,sy+Math.sin(a+side*.48)*twig,.46,.45);
    }
   }x=nx;y=ny;angle+=curve*4;
  }
 }
 const color=new Uint8Array(size*size*4),height=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const i=y*size+x,edge=Math.exp(-Math.min(x,y,size-1-x,size-1-y)/27);
  const ice=Math.min(1,.23+edge*.36+field[i]*.66+random()*.13);
  for(let c=0;c<3;c++){color[i*4+c]=Math.round([117,144,146][c]*(1-ice)+[235,241,232][c]*ice);height[i*4+c]=Math.round(ice*255);}
  color[i*4+3]=height[i*4+3]=255;
 }
 const map=new T.DataTexture(color,size,size),bump=new T.DataTexture(height,size,size);
 for(const texture of [map,bump]){texture.magFilter=T.LinearFilter;texture.minFilter=T.LinearMipmapLinearFilter;texture.generateMipmaps=true;texture.needsUpdate=true;}
 map.colorSpace=T.SRGBColorSpace;frostTextures={map,bump};return frostTextures;
}
// White Chaser-inspired JZX100 silhouette, modelled from the supplied photographs.
export function createChaser(){
 const car=new T.Group();car.name='White Chaser';
 const material=(color,roughness=.45,metalness=.1)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const white=new T.MeshPhysicalMaterial({color:'#f1f0e8',roughness:.29,metalness:.12,clearcoat:.65,clearcoatRoughness:.2});
 const frost=getFrostTextures();
 const glass=new T.MeshStandardMaterial({name:'Frozen fern-pattern glass',color:'#ffffff',map:frost.map,bumpMap:frost.bump,bumpScale:.008,roughness:.86,metalness:.04});
 const rubber=material('#14191e',.95),black=material('#20272b',.7),seam=material('#72838a',.8),silver=material('#c3ced3',.23,.8),lens=material('#a7b9c2',.19,.35);
 const red=new T.MeshStandardMaterial({color:'#721219',emissive:'#b31d1b',emissiveIntensity:.45,roughness:.24});
 const redLamp=new T.MeshStandardMaterial({color:'#be2928',emissive:'#e53422',emissiveIntensity:.6,roughness:.25});
 const amber=material('#bd8444',.25),headlight=new T.MeshStandardMaterial({color:'#e6eef0',emissive:'#c5deed',emissiveIntensity:.25,roughness:.17,metalness:.25});
 function add(g,m,x=0,y=0,z=0,parent=car){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 const box=(w,h,d,m,x,y,z)=>add(new T.BoxGeometry(w,h,d),m,x,y,z);
 function rounded(w,h,d,r,m,x,y,z){const sh=new T.Shape(),a=-w/2,b=-h/2;sh.moveTo(a+r,b);sh.lineTo(a+w-r,b);sh.quadraticCurveTo(a+w,b,a+w,b+r);sh.lineTo(a+w,b+h-r);sh.quadraticCurveTo(a+w,b+h,a+w-r,b+h);sh.lineTo(a+r,b+h);sh.quadraticCurveTo(a,b+h,a,b+h-r);sh.lineTo(a,b+r);sh.quadraticCurveTo(a,b,a+r,b);const g=new T.ExtrudeGeometry(sh,{depth:d,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.008,bevelThickness:.008,curveSegments:6});g.translate(0,0,-d/2);return add(g,m,x,y,z);}
 function line(points,m,r=.01){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return add(new T.TubeGeometry(curve,Math.max(8,points.length*5),r,6,false),m);}
 function panel(vertices,m){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices.flat(),3));g.setIndex([0,1,2,0,2,3]);g.setAttribute('uv',new T.Float32BufferAttribute([0,0,1,0,1,1,0,1],2));g.computeVertexNormals();const o=add(g,m);o.material=m.clone();o.material.side=T.DoubleSide;return o;}
 function loft(rings,m){const p=[],ix=[];for(const [z,w,base,top] of rings){const bevel=Math.min(.04,(top-base)*.25);p.push(-w*.94,base,z,-w,base+bevel,z,-w,top-bevel,z,-w*.9,top,z,w*.9,top,z,w,top-bevel,z,w,base+bevel,z,w*.94,base,z);}for(let j=0;j<rings.length-1;j++)for(let k=0;k<8;k++){let a=j*8+k,b=j*8+(k+1)%8;ix.push(a,a+8,b,b,a+8,b+8)}for(let k=1;k<7;k++){ix.push(0,k,k+1);let a=(rings.length-1)*8;ix.push(a,a+k+1,a+k);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();return add(g,m);}
 loft([[-2.35,.73,.73,.88],[-2.22,.84,.77,.98],[-1.7,.89,.8,1.04],[-.92,.91,.81,1.07],[.85,.91,.81,1.08],[1.57,.9,.8,1.05],[2.18,.85,.75,1.02],[2.35,.77,.72,.95]],white);
 // Real openings around the wheels instead of a solid box intersecting the tyres.
 for(const side of [-1,1]){
  const p=[],ix=[];for(let i=0;i<=130;i++){const z=-2.23+i*4.46/130;let lower=.3;for(const axle of [-1.39,1.4]){const dz=z-axle;if(Math.abs(dz)<.445)lower=Math.max(lower,.4+Math.sqrt(.445**2-dz**2));}const w=.902-Math.max(0,Math.abs(z)-1.8)*.13;p.push(side*w,lower,z,side*w,.87,z);if(i<130){const a=i*2;ix.push(a,a+1,a+2,a+1,a+3,a+2);}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();const sideMat=white.clone();sideMat.side=T.DoubleSide;add(g,sideMat);
  for(const axle of [-1.39,1.4]){const pts=[];for(let j=0;j<=24;j++){const a=j/24*Math.PI;pts.push([side*.909,.4+Math.sin(a)*.447,axle+Math.cos(a)*.447]);}line(pts,white,.019);}
  rounded(.03,.11,1.83,.012,white,side*.92,.32,0);
  line([[side*.912,.69,-.92],[side*.914,.69,0],[side*.912,.69,.96]],white,.025);
  for(const z of [-.83,.15,1.03])line([[side*.913,.37,z],[side*.915,.76,z],[side*.903,1.045,z]],seam,.004);
  for(const z of [-.44,.63]){rounded(.023,.063,.19,.008,seam,side*.919,.974,z);rounded(.028,.036,.155,.007,white,side*.936,.98,z);}
 }
 // Swept windshield, broad rear glass and the white C-pillars of the reference car.
 panel([[-.8,1.07,-1.03],[.8,1.07,-1.03],[.69,1.5,-.36],[-.69,1.5,-.36]],glass);
 panel([[-.68,1.49,.68],[.68,1.49,.68],[.79,1.075,1.37],[-.79,1.075,1.37]],glass);
 loft([[-.4,.67,1.465,1.51],[-.23,.7,1.48,1.55],[.45,.7,1.475,1.545],[.72,.665,1.45,1.50]],white);
 for(const s of [-1,1]){
  panel([[s*.803,1.065,-.98],[s*.695,1.49,-.35],[s*.702,1.50,.11],[s*.823,1.07,.1]],glass);
  panel([[s*.823,1.07,.16],[s*.702,1.50,.17],[s*.682,1.47,.63],[s*.814,1.075,1.08]],glass);
  panel([[s*.681,1.49,.63],[s*.625,1.48,.78],[s*.79,1.07,1.42],[s*.815,1.065,1.06]],white);
  line([[s*.81,1.06,-1.035],[s*.715,1.48,-.39],[s*.68,1.52,-.25]],white,.036);
  line([[s*.816,1.07,.13],[s*.71,1.5,.14]],black,.031);
  line([[s*.80,1.06,-1.0],[s*.826,1.058,.15],[s*.814,1.06,1.07]],silver,.012);
  const mirror=rounded(.23,.14,.21,.04,white,s*.986,1.115,-.79);mirror.rotation.y=s*.15;
  rounded(.195,.106,.018,.03,glass,s*.99,1.12,-.67);
 }
 // Five-spoke silver wheels, dark brake discs and a polished outer lip.
 car.userData.wheels=[];
 for(const s of [-1,1])for(const z of [-1.39,1.4]){
  const startIndex=car.children.length;
  const tyre=add(new T.CylinderGeometry(.389,.389,.215,40),rubber,s*.886,.4,z);tyre.rotation.z=Math.PI/2;
  const disk=add(new T.CylinderGeometry(.268,.268,.225,32),black,s*.89,.4,z);disk.rotation.z=Math.PI/2;
  const ring=add(new T.TorusGeometry(.268,.019,8,40),silver,s*1.012,.4,z);ring.rotation.y=Math.PI/2;
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const spoke=box(.018,.22,.044,silver,s*1.015,.4+Math.cos(a)*.145,z+Math.sin(a)*.145);spoke.rotation.x=a;}
  const hub=add(new T.CylinderGeometry(.069,.069,.24,20),silver,s*.90,.4,z);hub.rotation.z=Math.PI/2;
  const parts=car.children.slice(startIndex),steeringPivot=new T.Group(),wheel=new T.Group();
  steeringPivot.position.set(s*.886,.4,z);car.add(steeringPivot);steeringPivot.add(wheel);
  for(const part of parts){part.position.sub(steeringPivot.position);wheel.add(part);}
  car.userData.wheels.push({wheel,steeringPivot,front:z<0,radius:.389});
 }
 // Chaser front: slim rectangular lamps, amber outer corners and a narrow grille.
 rounded(1.62,.3,.2,.09,white,0,.57,-2.24);
 rounded(.56,.22,.048,.023,black,0,.86,-2.359);
 for(let i=0;i<4;i++)box(.49,.013,.025,silver,0,.79+i*.043,-2.39);
 box(.034,.16,.032,silver,0,.86,-2.41);
 for(const s of [-1,1]){
  rounded(.49,.19,.068,.035,lens,s*.557,.87,-2.318);
  for(const x of [.415,.60])rounded(.135,.135,.028,.035,headlight,s*x,.87,-2.36);
  rounded(.079,.155,.04,.02,amber,s*.777,.865,-2.32);
  rounded(.29,.115,.035,.027,black,s*.56,.53,-2.352);
  rounded(.21,.077,.018,.018,lens,s*.56,.532,-2.379);
 }
 rounded(.65,.14,.045,.025,black,0,.51,-2.36);
 box(.66,.017,.05,white,0,.49,-2.40);
 rounded(.33,.16,.023,.008,white,0,.665,-2.408);
 line([[-.68,1.002,-2.09],[-.61,1.055,-1.56],[-.58,1.075,-1.08]],seam,.003);
 line([[.68,1.002,-2.09],[.61,1.055,-1.56],[.58,1.075,-1.08]],seam,.003);
 // Two round red optics inside each wide rear lamp, with a clear upper strip.
 rounded(1.69,.29,.23,.085,white,0,.58,2.22);
 rounded(1.64,.1,.18,.035,white,0,.365,2.19);
 for(const s of [-1,1]){
  rounded(.52,.235,.062,.046,black,s*.555,.875,2.318);
  rounded(.488,.212,.065,.035,red,s*.555,.875,2.35);
  rounded(.468,.055,.02,.014,lens,s*.555,.944,2.389);
  for(const x of [.433,.657]){
   const lamp=add(new T.CylinderGeometry(.079,.079,.018,24),redLamp,s*x,.848,2.395);lamp.rotation.x=Math.PI/2;
   const trim=add(new T.TorusGeometry(.076,.007,6,24),red,s*x,.848,2.408);
  }
  for(let i=0;i<10;i++)box(.008,.04,.01,silver,s*(.335+i*.047),.945,2.405);
 }
 rounded(.44,.23,.035,.022,seam,0,.838,2.364);
 rounded(.355,.173,.025,.01,white,0,.835,2.389);
 line([[-.285,.74,2.36],[-.29,1.002,2.338],[.29,1.002,2.338],[.285,.74,2.36]],seam,.004);
 const emblem=add(new T.TorusGeometry(.028,.006,6,20),silver,0,1.001,2.36);emblem.scale.x=1.35;
 // Raised factory-style wing with two body-coloured supports and a centre brake strip.
 for(const s of [-1,1]){const support=box(.09,.135,.25,white,s*.60,1.106,2.045);support.rotation.x=-.23;}
 loft([[1.93,.76,1.16,1.21],[2.04,.81,1.175,1.235],[2.17,.78,1.16,1.205]],white);
 rounded(.51,.027,.025,.008,red,0,1.188,2.18);
 // Large hollow exhaust tip on the vehicle's right (positive X), visible from behind.
 const exhaust=add(new T.CylinderGeometry(.108,.093,.20,32,1,true),silver,.65,.292,2.25);exhaust.rotation.x=Math.PI/2;
 const inside=add(new T.CircleGeometry(.09,32),black,.65,.292,2.336);
 const lip=add(new T.TorusGeometry(.099,.013,8,32),silver,.65,.292,2.354);
 return car;
}
