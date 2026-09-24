/* 2.5D desktop presentation, not a 360-degree model renderer. */
(() => {
  'use strict';
  // Landmarks are fractions of the source artwork, never of the viewport.
  const landmarks = {
    hero: {lights:[[.526,.529,.13,8],[.745,.542,.045,-19]],ex:[.212,.630],direction:-1},
    apex: {lights:[[.365,.557,.154,-11],[.078,.551,.040,22]],ex:[.958,.615],direction:1},
    veloce: {lights:[[.648,.501,.146,8],[.940,.510,.038,-25]],ex:[.035,.609],direction:-1},
    aria: {lights:[[.315,.551,.158,-10],[.051,.505,.035,57]],ex:[.964,.598],direction:1},
    terra: {lights:[[.627,.446,.143,6],[.929,.452,.034,-23]],ex:[.035,.623],direction:-1},
    noir: {lights:[[.393,.556,.155,-10],[.068,.527,.050,29]],ex:[.970,.595],direction:1},
    eon: {lights:[[.580,.562,.140,7],[.947,.558,.034,-20]],ex:[.033,.614],direction:-1}
  };
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const states=[];
  let frame=0, previous=0;
  const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));

  function addFX(plane,coords) {
    coords.lights.forEach(([x,y,w,angle])=>{
      const light=document.createElement('span');
      light.className='light-fx';
      light.style.cssText=`--x:${x*100}%;--y:${y*100}%;--light-width:${w*100}%;--angle:${angle}deg`;
      light.innerHTML='<i class="light-halo"></i><i class="light-streak"></i><i class="light-core"></i>';
      plane.append(light);
    });
    const ground=document.createElement('span');
    ground.className='ground-light';
    ground.style.cssText=`--x:${coords.lights[0][0]*100}%;--y:${coords.lights[0][1]*100}%`;
    plane.append(ground);
    const exhaust=document.createElement('span');
    exhaust.className='exhaust-fx';
    exhaust.style.cssText=`--ex:${coords.ex[0]*100}%;--ey:${coords.ex[1]*100}%;--heat-offset:${coords.direction<0?'-36px':'0px'};--heat-angle:${coords.direction<0?'90deg':'270deg'}`;
    exhaust.innerHTML='<i class="exhaust-origin"></i><i class="exhaust-heat"></i>';
    for(let i=0;i<7;i++){
      const puff=document.createElement('i');puff.className='exhaust-puff';
      puff.style.cssText=`--delay:${-(i*.43)}s;--drift-x:${coords.direction*(65+i*7)}px;--drift-y:${-12-i*4}px`;
      exhaust.append(puff);
    }
    plane.append(exhaust);
  }

  function fit(s) {
    const width=s.host.clientWidth,height=s.host.clientHeight;
    const iw=s.image.naturalWidth,ih=s.image.naturalHeight;
    if(!width||!height||!iw||!ih)return;
    const factor=s.hero?Math.max(width/iw,height/ih):Math.min(width/iw,height/ih);
    s.plane.style.width=`${iw*factor}px`;
    s.plane.style.height=`${ih*factor}px`;
    s.plane.style.left=`${(width-iw*factor)/2}px`;
    s.plane.style.top=`${(height-ih*factor)*(s.hero?.54:.5)}px`;
  }

  function paused(s){return media.matches||(s.hero&&s.host.closest('.hero').classList.contains('paused'))}
  function wake(){if(!frame&&!document.hidden)frame=requestAnimationFrame(tick)}
  function tick(time) {
    frame=0;
    if(document.hidden)return;
    const dt=previous?Math.min(60,time-previous):16;previous=time;
    const ease=1-Math.exp(-dt/115);
    let again=false;
    states.forEach(s=>{
      if(!s.visible)return;
      const freeze=paused(s);
      if(freeze){s.host.classList.add('fx-sleep');return}
      const engaged=s.hover||s.focus;
      s.host.classList.toggle('fx-sleep',!s.hero&&!engaged);
      const targetScale=s.hero?(engaged?1.065:1.035):(engaged?1.16:1);
      const targetX=engaged?s.x:0,targetY=engaged?s.y:0;
      s.cx+=(targetX-s.cx)*ease;s.cy+=(targetY-s.cy)*ease;
      s.scale+=(targetScale-s.scale)*ease;
      s.clock+=dt;
      const idle=s.hero?Math.sin(s.clock/4800)*.8:0;
      const yaw=s.cx*(s.hero?3.8:12)+idle;
      const pitch=-s.cy*(s.hero?2.1:6.5);
      s.plane.style.setProperty('--yaw',yaw.toFixed(3)+'deg');
      s.plane.style.setProperty('--pitch',pitch.toFixed(3)+'deg');
      s.plane.style.setProperty('--roll',(s.cx*(s.hero?.2:.8)).toFixed(3)+'deg');
      s.plane.style.setProperty('--move-x',(s.cx*(s.hero?13:18)+idle*3).toFixed(2)+'px');
      s.plane.style.setProperty('--move-y',(-Math.abs(s.cx)*(s.hero?2:6)+s.cy*3).toFixed(2)+'px');
      s.plane.style.setProperty('--car-scale',(s.scale+(s.hero?Math.sin(s.clock/6100)*.009:0)).toFixed(5));
      s.plane.style.setProperty('--ignition',s.hero?(engaged?'1':'.62'):(engaged?'1':'0'));
      const moving=Math.abs(targetX-s.cx)+Math.abs(targetY-s.cy)+Math.abs(targetScale-s.scale)>.002;
      if(s.hero||moving)again=true;
    });
    if(again)wake();else previous=0;
  }

  function mount(host,key,hero=false) {
    const image=host.querySelector('img');if(!image)return;
    const plane=document.createElement('div');plane.className='visual-plane';
    plane.append(image);host.replaceChildren(plane);host.classList.add('visual-host');
    addFX(plane,landmarks[key]);
    plane.querySelectorAll('.light-fx,.exhaust-fx,.ground-light').forEach(el=>el.setAttribute('aria-hidden','true'));
    const state={host,image,plane,hero,hover:false,focus:false,x:0,y:0,cx:0,cy:0,scale:1,clock:0,visible:false};
    states.push(state);
    if(!hero){host.tabIndex=0;host.setAttribute('role','group');host.setAttribute('aria-label',`${cars[key].name} 互动展示，移动鼠标可改变视角`)}
    const interaction=hero?host.closest('.hero'):host;
    interaction.addEventListener('pointerenter',()=>{state.hover=true;wake()});
    interaction.addEventListener('pointermove',e=>{const r=host.getBoundingClientRect();state.x=clamp((e.clientX-r.left)/r.width*2-1,-1,1);state.y=clamp((e.clientY-r.top)/r.height*2-1,-1,1);wake()},{passive:true});
    interaction.addEventListener('pointerleave',()=>{state.hover=false;state.x=0;state.y=0;wake()});
    host.addEventListener('focus',()=>{state.focus=true;wake()});
    host.addEventListener('blur',()=>{state.focus=false;wake()});
    host.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Escape'].includes(e.key))return;e.preventDefault();if(e.key==='Escape'){state.x=state.y=0;host.blur()}else{state.x=clamp(state.x+(e.key==='ArrowLeft'?-.25:e.key==='ArrowRight'?.25:0),-1,1);state.y=clamp(state.y+(e.key==='ArrowUp'?-.25:e.key==='ArrowDown'?.25:0),-1,1)}wake()});
    image.addEventListener('load',()=>{fit(state);wake()});
    new ResizeObserver(()=>{fit(state);wake()}).observe(host);
    fit(state);
    return state;
  }
  mount(document.querySelector('.hero-art'),'hero',true);
  document.querySelectorAll('[data-car]').forEach(el=>mount(el.querySelector('.car-art'),el.dataset.car));
  const visibility=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{const s=states.find(x=>x.host===entry.target);if(s){s.visible=entry.isIntersecting;s.host.classList.toggle('fx-sleep',!s.visible)}});wake();
  },{threshold:.01});
  states.forEach(s=>visibility.observe(s.host));
  document.querySelector('.motion-toggle').addEventListener('click',wake);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;previous=0;states.forEach(s=>s.host.classList.add('fx-sleep'))}else wake()});
  media.addEventListener('change',()=>{if(media.matches)states.forEach(s=>{s.plane.style.setProperty('--ignition',s.hero?'.45':'0');s.host.classList.add('fx-sleep')});wake()});
  wake();
})();
