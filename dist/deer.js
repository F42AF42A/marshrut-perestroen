import * as T from './three.module.js';
const fur=new T.MeshStandardMaterial({color:'#ad8961',roughness:1,flatShading:true});
const pale=new T.MeshStandardMaterial({color:'#e4deca',roughness:1,flatShading:true});
const black=new T.MeshStandardMaterial({color:'#222622',roughness:.9,flatShading:true});
const inner=new T.MeshStandardMaterial({color:'#836446',roughness:1,flatShading:true});
// Polygonal cross sections create continuous anatomical surfaces, without sphere joints.
function sweep(parent,sections,material,sides=6){
 const vertices=[],indices=[];
 for(let i=0;i<sections.length;i++){
  const [x,y,z,width,depth]=sections[i],previous=sections[Math.max(0,i-1)],next=sections[Math.min(sections.length-1,i+1)];
  const tangent=new T.Vector3(next[0]-previous[0],next[1]-previous[1],next[2]-previous[2]).normalize();
  const across=new T.Vector3(0,0,1),normal=new T.Vector3().crossVectors(across,tangent).normalize();
  for(let j=0;j<sides;j++){const a=j/sides*Math.PI*2;vertices.push(x+normal.x*Math.cos(a)*depth,y+normal.y*Math.cos(a)*depth,z+Math.sin(a)*width);}
 }
 for(let i=0;i<sections.length-1;i++)for(let j=0;j<sides;j++){const a=i*sides+j,b=i*sides+(j+1)%sides;indices.push(a,b,a+sides,b,b+sides,a+sides);}
 for(let j=1;j<sides-1;j++){indices.push(0,j+1,j);const a=(sections.length-1)*sides;indices.push(a,a+j,a+j+1);}
 let geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo=geo.toNonIndexed();geo.computeVertexNormals();
 const o=new T.Mesh(geo,material);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;
}
function twig(parent,points,r=.032,material=pale){return sweep(parent,points.map((p,i)=>[...p,r*(1-i/points.length),r*(1-i/points.length)]),material,5);}
function wedge(parent,points,material){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));g.setIndex([0,1,2,0,2,3,0,3,1,1,3,2]);const flat=g.toNonIndexed();flat.computeVertexNormals();const o=new T.Mesh(flat,material);o.castShadow=true;parent.add(o);return o;}
export function createDeer(){
 const g=new T.Group();g.name='Reference low-poly deer';
 // Rump, long torso, chest and rising neck are a single connected mesh.
 sweep(g,[[-.91,1.38,0,.12,.20],[-.78,1.38,0,.26,.32],[-.43,1.34,0,.29,.34],[.04,1.30,0,.27,.32],[.38,1.29,0,.28,.34],[.55,1.48,0,.23,.28],[.60,1.76,0,.17,.21],[.68,2.00,0,.13,.17],[.77,2.10,0,.12,.14]],fur,8);
 // Wedge-shaped face tapers down to a small dark nose.
 sweep(g,[[.67,2.10,0,.115,.12],[.85,2.06,0,.145,.19],[1.04,1.95,0,.11,.125],[1.27,1.86,0,.06,.063]],fur,6);
 sweep(g,[[1.25,1.86,0,.064,.062],[1.31,1.85,0,.045,.042]],black,6);
 for(const s of [-1,1]){
  const eye=new T.Mesh(new T.IcosahedronGeometry(.022,0),black);eye.position.set(.92,2.045,s*.128);g.add(eye);
  wedge(g,[[.72,2.10,s*.10],[.55,2.38,s*.24],[.78,2.30,s*.23],[.71,2.22,s*.29]],fur);
  wedge(g,[[.72,2.15,s*.15],[.59,2.34,s*.24],[.75,2.28,s*.24],[.69,2.24,s*.255]],inner);
  // Ivory antlers swept outward and backward, with clear pointed forks.
  twig(g,[[.73,2.19,s*.09],[.65,2.40,s*.14],[.49,2.59,s*.23],[.30,2.78,s*.32],[.17,3.02,s*.37],[.18,3.18,s*.36]],.038);
  twig(g,[[.61,2.45,s*.16],[.91,2.68,s*.20],[1.01,2.93,s*.18],[.99,3.06,s*.17]],.025);
  twig(g,[[.46,2.62,s*.25],[.59,2.88,s*.29],[.59,3.03,s*.28]],.022);
  twig(g,[[.30,2.78,s*.32],[.23,2.99,s*.57],[.28,3.12,s*.60]],.018);
  twig(g,[[.80,2.64,s*.20],[.83,2.83,s*.40],[.81,2.95,s*.42]],.017);
 }
 // Short raised angular tail matches the supplied silhouette.
 twig(g,[[-.84,1.61,0],[-1.03,1.76,0],[-1.10,1.95,0],[-1.06,2.06,0]],.064,fur);
 const legs=[];
 for(const x of [-.65,.42])for(const s of [-1,1]){
  const leg=new T.Group();leg.position.set(x,1.15,s*.19);g.add(leg);legs.push(leg);
  const rear=x<0;
  sweep(leg,rear?[[0,.14,0,.13,.17],[.13,-.13,0,.10,.105],[.03,-.39,0,.059,.065],[-.11,-.66,0,.038,.041],[-.01,-1.04,0,.027,.03]]:[[0,.14,0,.11,.13],[.025,-.24,0,.063,.07],[.01,-.46,0,.045,.047],[.065,-1.04,0,.025,.029]],fur,5);
  const foot=rear?-.01:.065;
  sweep(leg,[[foot,-1.01,0,.032,.04],[foot+.035,-1.09,0,.048,.045],[foot+.095,-1.10,0,.038,.032]],black,5);
 }
 const mouth=new T.Object3D();mouth.position.set(1.32,1.85,0);g.add(mouth);g.userData={legs,mouth};return g;
}
