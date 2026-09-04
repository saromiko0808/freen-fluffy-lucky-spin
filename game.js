(() => {
  'use strict';
  const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
  const levels = [
    {name:'幸運初轉',goal:180,spins:10,count:5,rule:'三格大圖，輕鬆開始'},
    {name:'甜蜜雙連',goal:230,spins:10,count:6,rule:'兩個相同也能得分'},
    {name:'角色宇宙',goal:280,spins:11,count:8,rule:'更多 Freen 登場'},
    {name:'Fluffy 百搭',goal:340,spins:11,count:8,wild:true,rule:'Fluffy 可代替任何角色'},
    {name:'幸運加速',goal:540,spins:12,count:10,wild:true,rule:'角色更多，挑戰升級'},
    {name:'金色時刻',goal:650,spins:12,count:10,wild:true,gold:true,rule:'金色角色分數加倍'},
    {name:'翡翠訊號',goal:720,spins:13,count:12,wild:true,gold:true,secret:true,rule:'隱藏碎片開始出現'},
    {name:'幸運升級',goal:800,spins:13,count:14,wild:true,gold:true,secret:true,rule:'追求更高連線分數'},
    {name:'Freen Time',goal:920,spins:14,count:16,wild:true,gold:true,secret:true,time:true,rule:'隨機啟動雙倍時間'},
    {name:'二十面相',goal:1000,spins:14,count:20,wild:true,gold:true,secret:true,time:true,rule:'20 款 Freen 全登場'},
    {name:'Fluffy Rush',goal:1140,spins:15,count:20,wild:true,gold:true,secret:true,time:true,rush:true,rule:'Fluffy 出現率提升'},
    {name:'宇宙終章',goal:1280,spins:16,count:20,wild:true,gold:true,secret:true,time:true,rush:true,rule:'完成最終幸運挑戰'}
  ];
  let save=readSave(),levelIndex=0,score=0,spins=0,busy=false,noWin=0,attempt=0,sound=save.sound!==false,currentSymbols=[];
  function readSave(){const d={unlocked:1,stars:Array(12).fill(0),fragments:0,jackpot:false,attempts:Array(12).fill(0),sound:true};try{return Object.assign(d,JSON.parse(localStorage.getItem('freenFluffyLuckySpinV1')))}catch{return d}}
  function writeSave(){save.sound=sound;localStorage.setItem('freenFluffyLuckySpinV1',JSON.stringify(save))}
  function show(id){$$('.screen').forEach(x=>x.classList.remove('active'));$('#'+id).classList.add('active');scrollTo(0,0)}
  function symbolHTML(s){const file=s.type==='freen'?`freen-${String(s.id).padStart(2,'0')}.png`:s.type==='fluffy'?'fluffy.png':'secret.png';return `<div class="symbol ${s.type} ${s.gold?'gold':''}"><img src="${file}" alt=""></div>`}
  function renderLevels(){
    $('#totalStars').textContent=save.stars.reduce((a,b)=>a+b,0);$('#fragmentCount').textContent=Math.min(6,save.fragments);
    $('#levelGrid').innerHTML=levels.map((l,i)=>{const open=i<save.unlocked,stars=save.stars[i]||0;return `<button class="level-card ${open?'':'locked'}" data-level="${i}" ${open?'':'disabled'}><span class="number">${i+1}</span><span class="name">${l.name}</span><span class="stars">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</span>${open?'':'<span class="lock-mark">🔒</span>'}</button>`}).join('');
    $$('.level-card:not(.locked)').forEach(b=>b.onclick=()=>startLevel(Number(b.dataset.level)));$('#continueBtn').classList.toggle('hidden',save.unlocked<=1);$('#continueLevel').textContent=Math.min(save.unlocked,12)
  }
  function renderReels(symbols,rolling=false){$('#reels').innerHTML=symbols.map((s,i)=>`<div class="reel ${rolling?'rolling':''}">${symbolHTML(s)}</div>`).join('');if(rolling)$$('.reel .symbol').forEach((s,i)=>s.style.animationDelay=`${i*.16}s`)}
  function makeFreen(cfg,id){return{type:'freen',id:id||1+Math.floor(Math.random()*cfg.count),gold:Boolean(cfg.gold&&Math.random()<.07)}}
  function randomSymbols(cfg){return Array.from({length:3},()=>makeFreen(cfg))}
  function startLevel(i){levelIndex=i;const cfg=levels[i];score=0;spins=cfg.spins;noWin=0;attempt=save.attempts[i]||0;busy=false;$('#levelTitle').textContent=`第 ${i+1} 關・${cfg.name}`;$('#levelRule').textContent=cfg.rule;$('#goal').textContent=cfg.goal;$('#score').textContent='0';$('#spins').textContent=spins;$('#progressBar').style.width='0%';$('#message').textContent=attempt>=2?'ENCORE 模式：幸運機率提升！':'按下 SPIN，連結愛與幸運！';$('#freenTime').classList.add('hidden');currentSymbols=randomSymbols(cfg);renderReels(currentSymbols);show('game')}
  function makeOutcome(){
    const cfg=levels[levelIndex],symbols=randomSymbols(cfg),roll=Math.random(),encore=attempt>=2,near=spins<=2&&score<cfg.goal*.72;
    if(cfg.secret&&roll<.0015)return[{type:'secret'},{type:'secret'},{type:'secret'}];
    if(cfg.secret&&roll<.0095){const free=Math.floor(Math.random()*3);return symbols.map((s,i)=>i===free?s:{type:'secret'})}
    if(cfg.secret&&roll<.0345){symbols[Math.floor(Math.random()*3)]={type:'secret'};return symbols}
    if(cfg.wild&&roll<(cfg.rush?.075:.045))return[{type:'fluffy'},{type:'fluffy'},{type:'fluffy'}];
    if(near||noWin>=3){const id=1+Math.floor(Math.random()*cfg.count);return[makeFreen(cfg,id),makeFreen(cfg,id),makeFreen(cfg)].sort(()=>Math.random()-.5)}
    if(roll<(encore?.24:.17)){const id=1+Math.floor(Math.random()*cfg.count);return[makeFreen(cfg,id),makeFreen(cfg,id),makeFreen(cfg,id)]}
    if(roll<(encore?.56:.48)){const id=1+Math.floor(Math.random()*cfg.count);return[makeFreen(cfg,id),makeFreen(cfg,id),makeFreen(cfg)].sort(()=>Math.random()-.5)}
    if(cfg.wild&&Math.random()<(cfg.rush?.16:.08))symbols[Math.floor(Math.random()*3)]={type:'fluffy'};return symbols
  }
  function evaluate(symbols){
    const secret=symbols.filter(s=>s.type==='secret').length,fluffy=symbols.filter(s=>s.type==='fluffy').length,freens=symbols.filter(s=>s.type==='freen'),ids=[...new Set(freens.map(s=>s.id))],counts=ids.map(id=>freens.filter(s=>s.id===id).length),best=(counts.length?Math.max(...counts):0)+fluffy;
    let points=0,message='',won=false;
    if(secret===3){points=1200;message='💚 SECRET JACKPOT！';save.jackpot=true;save.fragments=Math.max(6,save.fragments);won=true}
    else if(fluffy===3){points=500;message='🐶 FLUFFY JACKPOT！';won=true}
    else if(secret===0&&ids.length<=1&&freens.length+fluffy===3){points=220+(fluffy?60:0);if(symbols.some(s=>s.gold))points*=2;message=fluffy?'🐶 Fluffy 連結愛與幸運！':'✨ Freen 三連線！';won=true}
    else if(secret===0&&best>=2){points=55;if(symbols.some(s=>s.gold))points*=2;message=fluffy?'🐶 Fluffy 幫你配對！':'💕 甜蜜雙連！';won=true}
    if(secret>0&&secret<3){const old=save.fragments;save.fragments=Math.min(6,save.fragments+secret);const gained=save.fragments-old;if(gained>0)message=`${message?message+'　':''}💚 翡翠碎片 +${gained}`}
    return{points,message,won}
  }
  function audio(kind){if(!sound)return;const A=window.AudioContext||window.webkitAudioContext;if(!A)return;const ctx=audio.ctx||(audio.ctx=new A());if(ctx.state==='suspended')ctx.resume();const notes=kind==='win'?[523,659,784]:kind==='jackpot'?[523,659,784,1047]:kind==='spin'?[160,130,110]:[220,180];notes.forEach((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=kind==='spin'?'triangle':'sine';o.frequency.value=f;g.gain.setValueAtTime(.001,ctx.currentTime+i*.08);g.gain.exponentialRampToValueAtTime(.12,ctx.currentTime+i*.08+.01);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+i*.08+.15);o.connect(g).connect(ctx.destination);o.start(ctx.currentTime+i*.08);o.stop(ctx.currentTime+i*.08+.17)})}
  function spin(){if(busy||spins<=0)return;busy=true;spins--;$('#spins').textContent=spins;$('#spinBtn').disabled=true;currentSymbols=makeOutcome();renderReels(currentSymbols,true);$('#message').textContent='幸運連線中…';audio('spin');setTimeout(finishSpin,1120)}
  function finishSpin(){
    const cfg=levels[levelIndex];renderReels(currentSymbols);const result=evaluate(currentSymbols),multiplier=cfg.time&&Math.random()<(cfg.rush?.2:.14)?2:1;result.points*=multiplier;score+=result.points;$('#score').textContent=score;$('#progressBar').style.width=`${Math.min(100,score/cfg.goal*100)}%`;
    if(multiplier===2){$('#freenTime').classList.remove('hidden');setTimeout(()=>$('#freenTime').classList.add('hidden'),1100)}
    if(result.points>0){noWin=0;$$('.symbol').forEach(s=>s.classList.add('winner'));$('#message').textContent=`${result.message||'✨ 幸運得分！'}${multiplier===2?'　×2！':''}`;audio(result.points>=500?'jackpot':'win')}
    else{noWin++;$('#message').textContent=noWin>=3?'幸運正在靠近，下一轉有保底！':'再轉一次，幸運正在路上！'}writeSave();setTimeout(()=>{busy=false;$('#spinBtn').disabled=false;if(spins<=0)endLevel()},650)
  }
  function starsFor(v,g){return v>=g*1.6?3:v>=g*1.25?2:v>=g?1:0}
  function endLevel(){const cfg=levels[levelIndex],stars=starsFor(score,cfg.goal),passed=stars>0;save.attempts[levelIndex]=(save.attempts[levelIndex]||0)+1;if(passed){save.stars[levelIndex]=Math.max(save.stars[levelIndex]||0,stars);save.unlocked=Math.max(save.unlocked,Math.min(12,levelIndex+2))}writeSave();$('#resultEmoji').textContent=passed?(stars===3?'🏆':'✨'):'💪';$('#resultTitle').textContent=passed?'過關！':'差一點點！';$('#resultText').textContent=passed?(levelIndex===11?'12 關完成！Freen、Fluffy，連結愛與幸運。':'下一關已解鎖，也可以重玩收集更多星星！'):(save.attempts[levelIndex]>=2?'ENCORE 幸運模式已開啟，下次會更容易配對！':'再試一次，連續沒中會自動啟動保底。');$('#resultStars').textContent='★'.repeat(stars)+'☆'.repeat(3-stars);$('#finalScore').textContent=score;$('#nextBtn').classList.toggle('hidden',!passed||levelIndex===11);show('result');audio(passed?'jackpot':'lose')}
  function renderCollection(){const n=Math.min(6,save.fragments);$('#gemSlots').innerHTML=Array.from({length:6},(_,i)=>`<span class="gem-slot ${i<n?'on':''}">${i<n?'💚':'◇'}</span>`).join('');$('#collectionHint').textContent=n>=6?'翡翠隱藏版已解鎖！':`再收集 ${6-n} 枚碎片，即可解鎖完整隱藏圖。`;$('#secretCard').classList.toggle('locked',n<6);$('#secretBadge').classList.toggle('hidden',!save.jackpot);show('collection')}
  function toast(t){$('#toast').textContent=t;$('#toast').classList.add('show');setTimeout(()=>$('#toast').classList.remove('show'),1300)}
  $('#startBtn').onclick=()=>{renderLevels();show('levels')};$('#continueBtn').onclick=()=>startLevel(Math.min(save.unlocked-1,11));$$('[data-home]').forEach(b=>b.onclick=()=>show('home'));$('#backLevels').onclick=()=>{renderLevels();show('levels')};$('#spinBtn').onclick=spin;$('#nextBtn').onclick=()=>startLevel(levelIndex+1);$('#retryBtn').onclick=()=>startLevel(levelIndex);$('#chooseBtn').onclick=()=>{renderLevels();show('levels')};$('#collectionBtn').onclick=renderCollection;$('#collectionBack').onclick=()=>{renderLevels();show('levels')};$$('.sound-btn').forEach(b=>b.onclick=()=>{sound=!sound;writeSave();$$('.sound-btn').forEach(x=>x.textContent=sound?'♪':'×');toast(sound?'聲音已開啟':'聲音已關閉')});renderLevels();$$('.sound-btn').forEach(x=>x.textContent=sound?'♪':'×')
})();
