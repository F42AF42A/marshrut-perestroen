import * as T from './three.module.js';
export function deerCrossing(relative,stop=0,pauses=true){
 const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
 if(!pauses)return {x:-7+14*smooth((115-relative)/180),walk:relative<115&&relative>-65?1:0};
 if(relative>55)return {x:-7+(7+stop)*smooth((135-relative)/80),walk:relative<135?1:0};
 if(relative>15)return {x:stop,walk:0};
 return {x:stop+(7-stop)*smooth((15-relative)/90),walk:relative>-75?1:0};
}
export function createCrows(scene,trees,random=Math.random){
 const plumage=new T.MeshStandardMaterial({color:'#222b32',roughness:.85,flatShading:true});
 function ell(g,x,y,z,a,b,c){const m=new T.Mesh(new T.IcosahedronGeometry(1,1),plumage);m.position.set(x,y,z);m.scale.set(a,b,c);g.add(m);m.castShadow=true;return m;}
 const candidates=trees.filter(t=>Math.abs(t.userData.offset)<40);
 const selected=candidates.filter((_,i)=>i===0||i===Math.floor(candidates.length/2)).slice(0,2);
 const birds=selected.map(tree=>{
  const group=new T.Group();ell(group,0,.15,0,.23,.15,.13);ell(group,.18,.28,0,.115,.11,.10);
  const beak=new T.Mesh(new T.ConeGeometry(.039,.16,4),plumage);beak.rotation.z=-Math.PI/2;beak.position.set(.32,.28,0);group.add(beak);
  ell(group,-.25,.07,0,.16,.035,.09);
  const wings=[];for(const side of [-1,1]){const pivot=new T.Group();pivot.position.set(0,.16,side*.07);group.add(pivot);const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute([.14,0,0,-.23,0,side*.08,-.30,0,side*.36,-.09,0,side*.64,.05,0,side*.35],3));geo.setIndex([0,1,2,0,2,3,0,3,4]);geo.computeVertexNormals();const mat=plumage.clone();mat.side=T.DoubleSide;const wing=new T.Mesh(geo,mat);pivot.add(wing);wings.push({pivot,side});
   const leg=new T.Mesh(new T.CylinderGeometry(.009,.009,.12,5),plumage);leg.position.set(0,.035,side*.065);group.add(leg);
  }
  // Use an actual branch vertex of the tree, preserving its scale.
  tree.geometry.computeBoundingBox();const height=tree.geometry.boundingBox.max.y,positions=tree.geometry.attributes.position;let best=Infinity;const perch=new T.Vector3();for(let i=0;i<positions.count;i++){const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i),score=(x-.85)**2+(y-height*.63)**2+z*z;if(score<best){best=score;perch.set(x,y+.04,z);}}
  scene.add(group);return {tree,group,wings,perch,treeS:tree.userData.s,active:true,flight:0,flying:false,side:Math.sign(tree.userData.offset)};
 });
 let previous=0;
 return {birds,reset(){previous=0;for(const b of birds){b.treeS=b.tree.userData.s;b.active=true;b.flying=false;b.flight=0;}},update(dt,distance,time,carX){const delta=distance-previous;previous=distance;for(const b of birds){
  if(b.treeS!==b.tree.userData.s){b.treeS=b.tree.userData.s;b.active=random()<.32;b.flying=false;b.flight=0;}
  b.group.visible=b.active;if(!b.active)continue;
  if(!b.flying){b.tree.updateMatrixWorld(true);b.group.position.copy(b.perch);b.tree.localToWorld(b.group.position);b.group.rotation.y=b.side>0?0:Math.PI;
   if(Math.abs(b.group.position.z)<66&&Math.abs(carX-b.group.position.x)<50){b.flying=true;b.flight=0;}
  }else{b.flight+=dt;b.group.position.x+=b.side*(4.5+Math.min(4,b.flight))*dt;b.group.position.y+=(1.8+Math.sin(b.flight)*.25)*dt;b.group.position.z+=delta-1.2*dt;b.group.rotation.z=.10;
   if(b.flight>7)b.active=false;
  }
  for(const w of b.wings)w.pivot.rotation.x=b.flying?w.side*Math.sin(b.flight*16)*.75:w.side*1.38;
 }} };
}
