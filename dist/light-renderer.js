import {state,clocks,voiceResponse} from './settings.js';
const $=id=>document.getElementById(id);
export class LightRenderer{
  constructor(art,image,index){
    this.canvas=document.createElement('canvas');this.canvas.className='scene-canvas';const scene=document.createElement('div');scene.className='masked-scene';if(index===2){scene.style.left='-95px';scene.style.top='48px';}scene.append(this.canvas);art.append(scene);
    this.scene=scene;this.grain=document.createElement('canvas');this.grain.width=582;this.grain.height=868;this.useGrain=1;
    this.gradient=document.createElement('canvas');this.gradient.width=582;this.gradient.height=868;
    this.gl=this.canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,powerPreference:'low-power'});
    if(!this.gl){this.fallback=true;this.ctx=this.canvas.getContext('2d');this.image=image;this.canvas.width=582;this.canvas.height=868;return;}
    const gl=this.gl,vertex='attribute vec2 position;varying vec2 uv;void main(){uv=vec2((position.x+1.)*.5,(1.-position.y)*.5);gl_Position=vec4(position,0.,1.);}';
    const fragment=`precision highp float;
varying vec2 uv;
uniform sampler2D gradientLayer;
uniform sampler2D lightLayer;
uniform sampler2D grainLayer;
uniform float useGrain;
uniform vec3 colorA;
uniform vec3 colorB;
uniform float time;
uniform float gradientTime;
uniform float lightOpacity;
uniform float warp;
uniform float flow;
uniform float rayVoice;
uniform float gradientVoice;
uniform float rayPulse;
uniform float gradientPulse;
uniform float frequency;
vec3 dodge(vec3 b,vec3 l){return min(vec3(1.),b/max(vec3(.001),vec3(1.)-l));}
vec3 hardLight(vec3 b,vec3 s){return mix(2.*b*s,1.-2.*(1.-b)*(1.-s),step(vec3(.5),s));}
void main(){
  vec2 p=uv*vec2(582.,868.);
  float gt=gradientTime;
  float movement=flow+gradientVoice*.95;
  vec2 field=(p-vec2(291.,340.))/vec2(448.,537.);
  vec2 domain=field;
  domain.x+=sin(field.y*3.1-gt*.30)*.25*movement;
  domain.y+=sin(field.x*3.5+gt*.24)*.22*movement;
  domain.x+=gradientVoice*.18*sin(field.y*4.8+gt*.83);
  domain.y+=gradientVoice*.13*cos(field.x*4.2-gt*.71);
  float stream=sin(domain.y*3.4-gt*.32+sin(domain.x*3.2+gt*.21)*1.1);
  float eddy=cos(domain.x*3.0-domain.y*1.5+gt*.26);
  float movingBlend=clamp(.50+.32*stream+.18*eddy,0.,1.);
  float originalBlend=clamp((p.y-71.336)/536.905,0.,1.);
  float blend=mix(originalBlend,movingBlend,clamp(movement,0.,1.));
  vec3 pigment=mix(colorB,colorA,blend);
  float sameColor=1.-smoothstep(.025,.22,length(colorA-colorB));
  float brightness=flow*(.05+sameColor*.14)*(stream*.68+eddy*.32)+gradientVoice*.02*stream;
  pigment=mix(pigment,vec3(1.),max(brightness,0.));
  pigment*=1.+min(brightness,0.);
  vec2 g=uv;
  g=(g-vec2(.50,.40))/(1.+gradientVoice*.24+gradientPulse*.04)+vec2(.50,.40);
  g.x+=sin(gt*.24)*.035*movement;
  g.y+=cos(gt*.19)*.025*movement;
  g.x+=sin(uv.y*4.0+gt*.27)*.020*movement;
  g.y+=cos(uv.x*3.7-gt*.22)*.016*movement;
  float envelope=texture2D(gradientLayer,clamp(g,0.,1.)).a;
  envelope=clamp(envelope*(1.+movement*.08*stream+gradientVoice*.18),0.,1.);
  // Paint-level HARD_LIGHT is isolated inside each transparent rectangle in Figma.
  // It does not hard-light the whole previous sibling (all nodes are PASS_THROUGH).
  vec3 base=vec3(244./255.);
  for(int i=0;i<7;i++){base=mix(base,pigment,envelope);}
  vec3 grain=texture2D(grainLayer,clamp(g,0.,1.)).rgb;
  vec3 layer09=mix(pigment,hardLight(grain,pigment),useGrain);
  base=mix(base,layer09,envelope);
  base=mix(base,pigment,envelope);
  float bloomWave=.5+.5*sin(domain.y*4.6-gt*.95+sin(domain.x*3.+gt*.4)*.9);
  vec2 glowDelta=(uv-vec2(.38+.19*sin(gt*.69),.40+.16*cos(gt*.53)))*vec2(2.4,2.);
  float glowSpot=exp(-dot(glowDelta,glowDelta)*2.);
  vec3 milk=vec3(.985,.98,1.);
  float milkAmount=clamp(gradientVoice*(.16+.38*bloomWave+.24*glowSpot)+gradientPulse*.14*bloomWave,0.,.68);
  base=mix(base,milk,milkAmount*envelope);
  vec2 s=(p-vec2(-170.,83.854))/vec2(816.,682.336),q=s-vec2(.5);
  float angle=sin(time*.19)*.009*(1.+rayVoice*.6);
  q=mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*q;
  q/=1.+(1.-cos(time*.21))*.012+rayVoice*.045;
  s=q+vec2(.5);
  s.x+=sin(time*.27)*.012;
  s.y+=sin(time*.17)*.009;
  s.x+=sin(s.y*7.+time*.65)*(warp*.011)*sin(time*.29);
  s.y+=sin(s.x*8.+time*.39)*(warp*.005)*sin(time*.21);
  float axis=.52+.035*sin(time*.21);
  s.x=axis+(s.x-axis)/(1.+rayVoice*.20+rayPulse*.025);
  float wave=sin(s.y*7.3-time*1.35+frequency*.8);
  s.x+=(rayVoice*(.028+warp*.014)+rayPulse*.012)*wave*smoothstep(.05,.9,s.y);
  s.y+=rayVoice*.008*sin(s.x*5.+time*.65);
  float inside=step(0.,s.x)*step(s.x,1.)*step(0.,s.y)*step(s.y,1.);
  vec3 light=texture2D(lightLayer,clamp(s,0.,1.)).rgb*inside;
  float lightDetail=smoothstep(.10,.60,dot(light,vec3(.2126,.7152,.0722)));
  float travelingBand=.5+.5*sin(s.y*9.-time*1.55);
  float opacity=clamp(lightOpacity*(1.+sin(time*.35)*.045+rayVoice*(.80+frequency*.08)+rayPulse*.15),0.,.78);
  vec3 composite=mix(base,dodge(base,light),opacity);
  float rayMilk=clamp((rayVoice*.12+rayPulse*.07)*lightDetail*travelingBand,0.,.28)*clamp(lightOpacity/.32,0.,1.);
  gl_FragColor=vec4(mix(composite,milk,rayMilk),1.);
}`;
    const compile=(type,src)=>{const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh;};
    this.program=gl.createProgram();gl.attachShader(this.program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(this.program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(this.program);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.program));gl.useProgram(this.program);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const loc=gl.getAttribLocation(this.program,'position');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    this.uniforms=Object.fromEntries(['time','gradientTime','lightOpacity','warp','flow','rayVoice','gradientVoice','rayPulse','gradientPulse','frequency','useGrain','colorA','colorB'].map(k=>[k,gl.getUniformLocation(this.program,k)]));this.textures=[];
    for(let n=0;n<3;n++){gl.activeTexture(gl.TEXTURE0+n);const t=gl.createTexture();this.textures.push(t);gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.uniform1i(gl.getUniformLocation(this.program,n===2?'grainLayer':n?'lightLayer':'gradientLayer'),n);if(n===1)gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);}
    this.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.lost=true;$('render-status').textContent='Графика приостановлена браузером';});this.canvas.addEventListener('webglcontextrestored',()=>window.location.reload());this.resize();
  }
  setGrain(image){
    const c=this.grain.getContext('2d');c.clearRect(0,0,582,868);c.save();c.filter='blur(94px)';c.drawImage(image,66,71.336,448,536.905);c.restore();
    if(this.gl){const gl=this.gl;gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,this.textures[2]);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,this.grain);}
  }
  resize(){if(this.fallback)return;const scale=Math.min(devicePixelRatio,1.5);this.canvas.width=Math.round(582*scale);this.canvas.height=Math.round(868*scale);this.gl.viewport(0,0,this.canvas.width,this.canvas.height);}
  setPalette(colors){
    this.colors=colors.map(hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255));
    const c=this.gradient.getContext('2d');c.clearRect(0,0,582,868);c.save();c.filter='blur(94px)';
    const g=c.createLinearGradient(0,71.336,0,608.241);g.addColorStop(0,colors[1]);g.addColorStop(1,colors[0]);c.fillStyle=g;c.beginPath();c.roundRect(66,71.336,448,536.905,[0,0,40,40]);c.fill();c.restore();
    if(this.gl){const gl=this.gl;gl.useProgram(this.program);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.textures[0]);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,this.gradient);}this.draw();
  }
  draw(){
    if(this.lost)return;
    if(this.fallback){
      const c=this.ctx,voice=voiceResponse(),gv=voice.gradient,rv=voice.rays,gp=voice.gradientPulse,rp=voice.rayPulse,movement=state.flow+gv*.95;
      this.flowCanvas??=document.createElement('canvas');this.flowCanvas.width=582;this.flowCanvas.height=868;
      const f=this.flowCanvas.getContext('2d'),a=this.colors[0],b=this.colors[1],css=v=>'rgb('+v.map(x=>Math.round(x*255)).join(',')+')';
      const blend=(x,y)=>{const st=Math.sin(y*3.4-clocks.gradient*.32+Math.sin(x*3.2+clocks.gradient*.21)*1.1),ed=Math.cos(x*3-y*1.5+clocks.gradient*.26);return Math.max(0,Math.min(1,.5+.32*st+.18*ed));};
      const g=f.createLinearGradient(150+Math.sin(clocks.gradient*.24)*90*movement,70,410+Math.cos(clocks.gradient*.19)*80*movement,630);
      for(let n=0;n<=12;n++){const y=n/12,weight=y*(1-Math.min(movement,1))+blend(.3,y)*Math.min(movement,1);const same=Math.hypot(...a.map((v,j)=>v-b[j]))<.025;const bright=movement*(same?.11:.04)*Math.sin(y*4-clocks.gradient*.32);g.addColorStop(y,css(a.map((v,j)=>Math.max(0,Math.min(1,(b[j]*(1-weight)+v*weight)*(1+bright))))));}
      f.fillStyle=g;f.fillRect(0,0,582,868);
      if(gv>0){const milk=f.createRadialGradient(220+110*Math.sin(clocks.gradient*.69),345+100*Math.cos(clocks.gradient*.53),20,291,360,390);milk.addColorStop(0,'rgba(251,250,255,'+Math.min(.68,gv*.66+gp*.14)+')');milk.addColorStop(1,'rgba(251,250,255,0)');f.fillStyle=milk;f.fillRect(0,0,582,868);}
      f.globalCompositeOperation='destination-in';f.drawImage(this.gradient,0,0);f.globalCompositeOperation='source-over';
      c.clearRect(0,0,582,868);c.fillStyle='#f4f4f4';c.fillRect(0,0,582,868);c.save();c.translate(291,347);c.scale(1+gv*.24+gp*.04,1+gv*.24+gp*.04);for(let i=0;i<9;i++)c.drawImage(this.flowCanvas,-291,-347);c.restore();
      c.save();c.globalCompositeOperation='color-dodge';c.globalAlpha=Math.min(.78,state.intensity*(1+rv*.8+rp*.15));c.translate(238+Math.sin(clocks.rays*.27)*12,425);c.rotate(Math.sin(clocks.rays*.19)*.009);c.scale(1+rv*.20+rp*.025,1+rv*.045);
      for(let n=0;n<64;n++){const y=n/64,h=this.image.height/64,offset=(rv*(23+state.distortion*11)+rp*10)*Math.sin(y*7.3-clocks.rays*1.35);c.drawImage(this.image,0,n*h,this.image.width,h,-408+offset,-341.168+y*682.336,816,682.336/64+.25);}
      c.restore();return;
    }
    const gl=this.gl,voice=voiceResponse();gl.useProgram(this.program);gl.uniform1f(this.uniforms.time,clocks.rays);gl.uniform1f(this.uniforms.gradientTime,clocks.gradient);gl.uniform1f(this.uniforms.flow,state.flow);gl.uniform3fv(this.uniforms.colorA,this.colors[0]);gl.uniform3fv(this.uniforms.colorB,this.colors[1]);gl.uniform1f(this.uniforms.lightOpacity,state.intensity);gl.uniform1f(this.uniforms.warp,state.distortion);gl.uniform1f(this.uniforms.rayVoice,voice.rays);gl.uniform1f(this.uniforms.gradientVoice,voice.gradient);gl.uniform1f(this.uniforms.rayPulse,voice.rayPulse);gl.uniform1f(this.uniforms.gradientPulse,voice.gradientPulse);gl.uniform1f(this.uniforms.frequency,state.frequency);gl.uniform1f(this.uniforms.useGrain,this.useGrain);gl.drawArrays(gl.TRIANGLES,0,6);
  }
}
