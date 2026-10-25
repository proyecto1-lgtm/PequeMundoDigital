import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import './styles.css';
import { supabase, supabaseConfigured } from './lib/supabase.js';

const TEACHER = 'JHILVER ELOY QUISPE BARRAZA';
const AGES = ['3 años','4 años','5 años'];
const CAPS = [
  'Personaliza entornos virtuales',
  'Gestiona información del entorno virtual',
  'Interactúa en entornos virtuales',
  'Crea objetos virtuales en diversos formatos'
];
const SHAPES = [
 {name:'Círculo',emoji:'⭕',path:'M150 38 A88 88 0 1 1 149.9 38'},
 {name:'Cuadrado',emoji:'⬜',path:'M70 55 L230 55 L230 215 L70 215 Z'},
 {name:'Triángulo',emoji:'🔺',path:'M150 35 L245 215 L55 215 Z'},
 {name:'Estrella',emoji:'⭐',path:'M150 25 L180 105 L265 105 L195 155 L220 240 L150 188 L80 240 L105 155 L35 105 L120 105 Z'},
 {name:'Corazón',emoji:'💗',path:'M150 220 C130 195 55 145 55 95 C55 35 125 35 150 80 C175 35 245 35 245 95 C245 145 170 195 150 220 Z'},
 {name:'Sol',emoji:'☀️',path:'M150 65 A55 55 0 1 1 149.9 65 M150 15 L150 0 M150 175 L150 205 M80 95 L55 80 M220 95 L245 80 M80 145 L55 160 M220 145 L245 160'},
 {name:'Nube',emoji:'☁️',path:'M75 190 C25 190 25 125 70 115 C65 65 125 50 155 90 C195 50 245 80 235 125 C280 135 260 190 220 190 Z'},
 {name:'Casita',emoji:'🏠',path:'M45 125 L150 35 L255 125 L235 125 L235 225 L65 225 L65 125 Z'},
 {name:'Mariposa',emoji:'🦋',path:'M150 120 C105 25 30 35 45 110 C55 145 105 150 150 135 C195 150 245 145 255 110 C270 35 195 25 150 120 M150 100 L150 220 M150 125 L130 95 M150 125 L170 95'},
 {name:'Dinosaurio',emoji:'🦕',path:'M55 190 L55 130 Q55 85 105 85 L145 85 Q165 45 205 65 L235 90 L260 95 L260 125 L230 130 L225 185 L195 185 L190 225 L160 225 L155 185 L110 185 L105 225 L75 225 L75 185 Z'}
];
const KEY_MISSIONS = [
 ['Llega a la flor','🌸', [0,0],[0,1],[0,2],[0,3]],
 ['Busca el árbol','🌳',[0,0],[1,0],[1,1],[2,1]],
 ['Alcanza la estrella','⭐',[0,0],[0,1],[1,1],[1,2]],
 ['Visita la casa','🏠',[0,0],[1,0],[2,0],[2,1]],
 ['Ve hasta el regalo','🎁',[0,0],[0,1],[1,1],[2,1]],
 ['Encuentra la pelota','⚽',[0,0],[1,0],[1,1],[2,1]],
 ['Llega al helado','🍦',[0,0],[0,1],[0,2],[1,2]],
 ['Saluda al gato','🐱',[0,0],[1,0],[2,0],[2,1]],
 ['Recoge la manzana','🍎',[0,0],[0,1],[1,1],[1,2]],
 ['Llega al castillo','🏰',[0,0],[1,0],[1,1],[2,1]],
];
const KEY_TITLES = [
 ...KEY_MISSIONS.map(x=>x[0]),
 'Recoge una estrella','Cruza el jardín','Encuentra la salida','Llega al puente','Visita al conejo',
 'Busca tres flores','Llega a la montaña','Sigue el sendero','Encuentra el tesoro','Llega a casa',
 'Supera el laberinto','Sigue la ruta','Esquiva los árboles','Cruza el río','Llega al castillo',
 'Recorrido final 1','Recorrido final 2','Recorrido final 3','Gran aventura','¡Meta final!'
];
const MOUSE_TITLES = [
 'Atrapa burbujas','Haz clic en las estrellas','Elige el color','Encuentra el animal','Pulsa el objeto',
 'Cuenta las flores','Despierta al conejo','Revienta los globos','Encuentra las frutas','Reto de clics',
 'Arrastra la fruta','Guarda los juguetes','Lleva la pelota','Ordena las figuras','Entrega el regalo',
 'Lleva el color a su lugar','Arrastra el animal','Completa la cesta','Mueve los bloques','Reto de arrastre',
 ...SHAPES.map(s=>`Dibuja: ${s.name}`)
];

const CLICK_MISSIONS = [
 {title:'Atrapa burbujas', prompt:'Busca 3 burbujas iguales', target:'🫧', targetName:'BURBUJAS', items:['🫧','⭐','🫧','🍎','🫧','🎈'], correct:[0,2,4]},
 {title:'Haz clic en las estrellas', prompt:'Busca 3 estrellas iguales', target:'⭐', targetName:'ESTRELLAS', items:['⭐','🍎','🌼','⭐','🎈','⭐'], correct:[0,3,5]},
 {title:'Encuentra las manzanas', prompt:'Busca 3 manzanas iguales', target:'🍎', targetName:'MANZANAS', items:['🍎','🟢','🍎','🔵','🎈','🍎'], correct:[0,2,5]},
 {title:'Encuentra los conejitos', prompt:'Busca 3 conejitos iguales', target:'🐰', targetName:'CONEJITOS', items:['🐰','🍎','🐱','🐰','⭐','🐰'], correct:[0,3,5]},
 {title:'Pulsa los corazones', prompt:'Busca 3 corazones iguales', target:'❤️', targetName:'CORAZONES', items:['❤️','⭐','❤️','🌼','🍎','❤️'], correct:[0,2,5]},
 {title:'Encuentra las flores', prompt:'Busca 3 flores iguales', target:'🌼', targetName:'FLORES', items:['🌼','🍎','🌼','⭐','🌼','🎈'], correct:[0,2,4]},
 {title:'Despierta al conejo', prompt:'Busca 3 conejitos iguales', target:'🐰', targetName:'CONEJITOS', items:['🐰','🐱','🐰','🍎','⭐','🐰'], correct:[0,2,5]},
 {title:'Revienta los globos', prompt:'Busca 3 globos iguales', target:'🎈', targetName:'GLOBOS', items:['🎈','⭐','🎈','🍎','🎈','🌼'], correct:[0,2,4]},
 {title:'Encuentra las fresas', prompt:'Busca 3 fresas iguales', target:'🍓', targetName:'FRESAS', items:['🍓','🍎','🍓','🍌','🎈','🍓'], correct:[0,2,5]},
 {title:'Reto de estrellas', prompt:'Busca 3 estrellas iguales', target:'⭐', targetName:'ESTRELLAS', items:['🎈','⭐','🍎','⭐','🌼','⭐'], correct:[1,3,5]}
];
const DRAG_MISSIONS = [
 {title:'Ayuda al ratón', prompt:'Arrastra cada amigo hasta su comida.', pairs:[{id:'mouse',object:'🐭',target:'🧀',label:'Queso'},{id:'monkey',object:'🐵',target:'🍌',label:'Plátano'},{id:'rabbit',object:'🐰',target:'🥕',label:'Zanahoria'}]},
 {title:'Lleva cada animal a casa', prompt:'Arrastra cada animal hasta su casa.', pairs:[{id:'dog',object:'🐶',target:'🏠',label:'Casa del perro'},{id:'bird',object:'🐦',target:'🪹',label:'Nido del pájaro'},{id:'rabbit',object:'🐰',target:'🕳️',label:'Madriguera del conejo'}]},
 {title:'La merienda', prompt:'Lleva cada alimento al personaje que lo pide.', pairs:[{id:'mouse',object:'🐭',target:'🧀',label:'Queso'},{id:'monkey',object:'🐵',target:'🍌',label:'Plátano'},{id:'panda',object:'🐼',target:'🎋',label:'Bambú'}]},
 {title:'Encuentra su pareja', prompt:'Arrastra cada objeto hasta su pareja igual.', pairs:[{id:'star',object:'⭐',target:'⭐',label:'Estrella'},{id:'heart',object:'❤️',target:'❤️',label:'Corazón'},{id:'flower',object:'🌼',target:'🌼',label:'Flor'}]},
 {title:'Animales y comida', prompt:'Cada animal debe llegar a su comida.', pairs:[{id:'monkey',object:'🐵',target:'🍌',label:'Plátano'},{id:'rabbit',object:'🐰',target:'🥕',label:'Zanahoria'},{id:'dog',object:'🐶',target:'🦴',label:'Hueso'}]},
 {title:'Guarda los juguetes', prompt:'Arrastra cada juguete hasta la caja que tiene su dibujo.', pairs:[{id:'ball',object:'⚽',target:'⚽',label:'Pelota'},{id:'car',object:'🚗',target:'🚗',label:'Auto'},{id:'teddy',object:'🧸',target:'🧸',label:'Oso'}]},
 {title:'Ayuda a los animales', prompt:'Arrastra cada animal hasta su alimento.', pairs:[{id:'mouse',object:'🐭',target:'🧀',label:'Queso'},{id:'monkey',object:'🐵',target:'🍌',label:'Plátano'},{id:'panda',object:'🐼',target:'🎋',label:'Bambú'}]},
 {title:'Lleva cada figura', prompt:'Busca la casa con el mismo dibujo.', pairs:[{id:'star',object:'⭐',target:'⭐',label:'Estrella'},{id:'circle',object:'🔵',target:'🔵',label:'Círculo'},{id:'heart',object:'❤️',target:'❤️',label:'Corazón'}]},
 {title:'Prepara la cesta', prompt:'Arrastra cada fruta a su cesta con el mismo dibujo.', pairs:[{id:'apple',object:'🍎',target:'🍎',label:'Manzana'},{id:'banana',object:'🍌',target:'🍌',label:'Plátano'},{id:'strawberry',object:'🍓',target:'🍓',label:'Fresa'}]},
 {title:'Misión de arrastre', prompt:'Lleva cada animal hasta su comida.', pairs:[{id:'mouse',object:'🐭',target:'🧀',label:'Queso'},{id:'monkey',object:'🐵',target:'🍌',label:'Plátano'},{id:'rabbit',object:'🐰',target:'🥕',label:'Zanahoria'}]}
];

function grade(p){return p>=90?'AD':p>=60?'A':p>=30?'B':'C'}
function readRecords(){try{return JSON.parse(localStorage.getItem('pmd_records')||'[]')}catch{return []}}
function App(){
 const [view,setView]=useState('home');
 const [student,setStudent]=useState({first:'',last:'',age:'3 años'});
 const [sound,setSound]=useState(false);
 const [game,setGame]=useState('keyboard');
 const [level,setLevel]=useState(1);
 const [records,setRecords]=useState(readRecords);
 const [pass,setPass]=useState('');
 const [teacherEmail,setTeacherEmail]=useState('');
 const [dbMessage,setDbMessage]=useState('');
 const [dateMode,setDateMode]=useState('all');
 const [dateFrom,setDateFrom]=useState('2026-10-01');
 const [dateTo,setDateTo]=useState('2026-10-24');
 const [singleDate,setSingleDate]=useState('2026-10-24');
 const [error,setError]=useState('');
 const [fullscreen,setFullscreen]=useState(!!document.fullscreenElement);
 const [pos,setPos]=useState([0,0]);
 const [collected,setCollected]=useState(0);
 const [tracePct,setTracePct]=useState(0);
 const [tracePoints,setTracePoints]=useState([]);
 const [traceStrokes,setTraceStrokes]=useState([]);
 const traceStrokesRef=useRef([]);
 const [drawing,setDrawing]=useState(false);
 const [feedback,setFeedback]=useState('¡Vamos a jugar!');
 const [attempts,setAttempts]=useState(0);
 const [clicked,setClicked]=useState([]);
 const [dragged,setDragged]=useState(false);
 const [draggedItems,setDraggedItems]=useState([]);
 const traceRef=useRef(null);
 const tracePointsRef=useRef([]);
 const completedRef=useRef(false);
 const levelStartedAtRef=useRef(Date.now());
 const firstActionAtRef=useRef(null);
 const lastActionAtRef=useRef(Date.now());
 const actionCountRef=useRef(0);
 const errorCountRef=useRef(0);
 const blockedMoveCountRef=useRef(0);
 const hintCountRef=useRef(0);
 const activeMsRef=useRef(0);
 const activeSegmentAtRef=useRef(Date.now());
 const idleMsRef=useRef(0);
 const lastActivityAtRef=useRef(Date.now());
 const name=`${student.first.trim()} ${student.last.trim()}`.trim();
 const ageYears=Number.parseInt(student.age,10)||3;
 const shape=SHAPES[((level-21)%SHAPES.length+SHAPES.length)%SHAPES.length];
 const clickMission=CLICK_MISSIONS[(level-1+CLICK_MISSIONS.length)%CLICK_MISSIONS.length];
 const clickGoal=ageYears<=3?2:ageYears===4?3:Math.min(4,clickMission.correct.length);
 const dragMission=DRAG_MISSIONS[(level-11+DRAG_MISSIONS.length)%DRAG_MISSIONS.length];
 const dragPairCount=ageYears<=3?3:ageYears===4?4:5;
 const dragPairs=useMemo(()=>{
  const pool=[];
  const seen=new Set();
  for(const missionItem of DRAG_MISSIONS){
   for(const pair of missionItem.pairs){
    const signature=`${pair.id}|${pair.object}|${pair.target}`;
    if(!seen.has(signature)){seen.add(signature);pool.push(pair);}
   }
  }
  const selected=[...dragMission.pairs];
  for(const pair of pool){
   if(selected.length>=dragPairCount)break;
   if(!selected.some(p=>p.id===pair.id && p.object===pair.object && p.target===pair.target))selected.push(pair);
  }
  // Mezcla Fisher-Yates con semillas diferentes para que cada columna tenga
  // un orden independiente y no se pueda resolver por correspondencia visual.
  const shuffle=(items,salt)=>{
   const result=[...items];
   let seed=(level*9301+ageYears*49297+salt*233+result.length*719)>>>0;
   const random=()=>{
    seed=(seed*1664525+1013904223)>>>0;
    return seed/4294967296;
   };
   for(let i=result.length-1;i>0;i--){
    const j=Math.floor(random()*(i+1));
    [result[i],result[j]]=[result[j],result[i]];
   }
   return result;
  };
  const objects=shuffle(selected,11);
  let targets=shuffle(selected,97);
  // Si por casualidad coinciden, vuelve a mezclar destinos con otra semilla.
  if(targets.every((item,index)=>item.id===objects[index]?.id)){
   targets=shuffle(selected,193);
  }
  return {pairs:selected,objects,targets};
 },[dragMission,dragPairCount,level,ageYears]);
 const mission=KEY_MISSIONS[(level-1)%10];
 const gridSize=useMemo(()=>{
  const progression=ageYears<=3?[4,4,5,5,6,6]:ageYears===4?[4,5,5,6,7,7]:[5,5,6,7,8,8];
  return progression[Math.min(5,Math.floor((level-1)/5))];
 },[ageYears,level]);
 const target=[gridSize-1,gridSize-1];
 // Genera un camino seguro diferente por nivel y edad. El recorrido puede cruzar
 // el centro del tablero; ya no se reserva siempre la fila superior y la columna derecha.
 const maze=useMemo(()=>{
  const trees=new Set(),bombs=new Set(),safePath=new Set();
  const seed=level*17+ageYears*31;
  let r=0,c=0,step=0;
  safePath.add(`${r},${c}`);
  // Camino monotónico aleatorio: cada paso avanza a la derecha o hacia abajo,
  // por lo que siempre llega a la casa sin retroceder ni salir del tablero.
  while(r<gridSize-1||c<gridSize-1){
   const canRight=c<gridSize-1,canDown=r<gridSize-1;
   let goRight;
   if(!canDown) goRight=true;
   else if(!canRight) goRight=false;
   else {
    const mix=(seed*9301+(step+1)*49297+(r+3)*233+(c+5)*719)%997;
    goRight=(mix%100)<(30+((level+ageYears+step)%41));
   }
   if(goRight)c++; else r++;
   safePath.add(`${r},${c}`);
   step++;
  }
  const candidates=[];
  for(let rr=0;rr<gridSize;rr++)for(let cc=0;cc<gridSize;cc++){
   if(!safePath.has(`${rr},${cc}`)&&!(rr===0&&cc===0)&&!(rr===gridSize-1&&cc===gridSize-1))candidates.push([rr,cc]);
  }
  candidates.sort((a,b)=>(((a[0]*13+a[1]*7+seed)%37)-((b[0]*13+b[1]*7+seed)%37)));
  const treeCount=Math.min(candidates.length,Math.max(0,Math.floor((level-1)/4)+(ageYears-3)));
  const bombCount=Math.min(candidates.length-treeCount,Math.max(0,Math.floor((level-3)/4)+(ageYears-3)));
  candidates.forEach(([rr,cc],i)=>{
   if(i<treeCount)trees.add(`${rr},${cc}`);
   else if(i<treeCount+bombCount)bombs.add(`${rr},${cc}`);
  });
  return {trees,bombs,safePath};
 },[level,gridSize,ageYears]);
 const trees=maze.trees,bombs=maze.bombs;
 const shapeStart=(()=>{const m=shape.path.match(/^M\s*([\d.-]+)[,\s]+([\d.-]+)/i);return m?{x:Number(m[1]),y:Number(m[2])}:{x:150,y:38}})();
 useEffect(()=>{localStorage.setItem('pmd_records',JSON.stringify(records))},[records]);
 useEffect(()=>{const fn=()=>setFullscreen(!!document.fullscreenElement);document.addEventListener('fullscreenchange',fn);return()=>document.removeEventListener('fullscreenchange',fn)},[]);
 useEffect(()=>{
  if(view!=='play'||game!=='keyboard')return;
  const fn=e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();move(e.key)}};
  window.addEventListener('keydown',fn);return()=>window.removeEventListener('keydown',fn);
 });
 useEffect(()=>{if(view==='play'){const fn=e=>{if(e.key==='Escape'){setFeedback('Para continuar, vuelve a la ventana del juego.')}};window.addEventListener('keydown',fn);return()=>window.removeEventListener('keydown',fn)}},[view]);
 function say(t){setFeedback(t);if(sound&&window.speechSynthesis){window.speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(t);u.lang='es-PE';window.speechSynthesis.speak(u)}}
 async function toggleFullscreen(){try{if(!document.fullscreenElement){await document.documentElement.requestFullscreen()}else{await document.exitFullscreen()}}catch{say('La pantalla completa no está disponible en este navegador.')}}
 function resetTelemetry(){
  const now=Date.now();
  levelStartedAtRef.current=now;
  firstActionAtRef.current=null;
  lastActionAtRef.current=now;
  actionCountRef.current=0;
  errorCountRef.current=0;
  blockedMoveCountRef.current=0;
  hintCountRef.current=0;
  activeMsRef.current=0;
  activeSegmentAtRef.current=now;
  idleMsRef.current=0;
  lastActivityAtRef.current=now;
 }
 function recordAction(kind='interaction'){
  const now=Date.now();
  if(firstActionAtRef.current===null)firstActionAtRef.current=now;
  const gap=now-lastActivityAtRef.current;
  if(gap>30000)idleMsRef.current+=gap-30000;
  actionCountRef.current+=1;
  lastActionAtRef.current=now;
  lastActivityAtRef.current=now;
 }
 function recordError(kind='incorrect_action'){
  errorCountRef.current+=1;
  recordAction(kind);
 }
 function buildMetrics(pct,metrics={}){
  const now=Date.now();
  const totalMs=Math.max(0,now-levelStartedAtRef.current);
  const idleMs=Math.min(totalMs,idleMsRef.current);
  const activeMs=Math.max(0,totalMs-idleMs);
  const ageAdjustedTimeLimitMs=({3:180000,4:150000,5:120000}[ageYears]||180000);
  const normalizedTimeScore=Math.max(0,Math.min(100,Math.round(ageAdjustedTimeLimitMs/Math.max(activeMs,1000)*100)));
  return {
   ...metrics,
   telemetryVersion:2,
   elapsedMs:totalMs,
   activeTimeMs:activeMs,
   idleTimeMs:idleMs,
   timeToFirstActionMs:firstActionAtRef.current===null?null:firstActionAtRef.current-levelStartedAtRef.current,
   actionCount:actionCountRef.current,
   errorCount:errorCountRef.current,
   blockedMoves:blockedMoveCountRef.current,
   hintsUsed:hintCountRef.current,
   attempts:Math.max(Number(metrics.attempts)||0,attempts),
   completionPercent:pct,
   ageYears,
   ageAdjustedTimeReferenceMs:ageAdjustedTimeLimitMs,
   timeContextScore:normalizedTimeScore,
   efficiencyRatio:actionCountRef.current?Math.round(Math.max(0,Math.min(100,(1-errorCountRef.current/actionCountRef.current)*100))):0,
   recordedAt:new Date(now).toISOString()
  };
 }
 useEffect(()=>{
  if(view!=='play')return;
  const onKey=(e)=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Enter'].includes(e.key))recordAction('keyboard')};
  const onPointer=()=>recordAction('pointer');
  const onVisibility=()=>{if(document.visibilityState==='visible')lastActivityAtRef.current=Date.now()};
  window.addEventListener('keydown',onKey,true);
  window.addEventListener('pointerdown',onPointer,true);
  document.addEventListener('visibilitychange',onVisibility);
  return ()=>{window.removeEventListener('keydown',onKey,true);window.removeEventListener('pointerdown',onPointer,true);document.removeEventListener('visibilitychange',onVisibility)};
 },[view]);
 function start(e){e.preventDefault();if(!student.first.trim()||!student.last.trim())return;setView('games')}
 function startGame(which){setGame(which);setLevel(1);resetLevel();resetTelemetry();setView('play');say(which==='keyboard'?'Usa las flechas para guiar al personaje.':'Sigue el contorno con el mouse.')}
 function resetLevel(){completedRef.current=false;resetTelemetry();tracePointsRef.current=[];traceStrokesRef.current=[];setTraceStrokes([]);setPos([0,0]);setCollected(0);setTracePct(0);setTracePoints([]);setClicked([]);setDragged(false);setDraggedItems([]);setAttempts(0)}
 function move(key){
  const dirs={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]},d=dirs[key];if(!d)return;
  const nr=Math.max(0,Math.min(gridSize-1,pos[0]+d[0])),nc=Math.max(0,Math.min(gridSize-1,pos[1]+d[1]));
  if(trees.has(`${nr},${nc}`)){blockedMoveCountRef.current+=1;recordError('tree_collision');say('¡Hay un árbol! Busca otro camino.');return}
  if(bombs.has(`${nr},${nc}`)){blockedMoveCountRef.current+=1;recordError('bomb_collision');say('¡Cuidado! Hay una bomba. Prueba otra dirección.');return}
  setPos([nr,nc]);setCollected(n=>n+1);say('¡Bien! Sigue el camino.');
 }
 useEffect(()=>{
  if(view!=='play'||game!=='keyboard')return;
  // A level completes after the child navigates through a short route and reaches its goal.
  if(pos[0]===target[0]&&pos[1]===target[1]){passLevel(100,{keyboardMoves:collected+1,keyboardAccuracy:100,targetCell:target})}
 },[pos,view,game]);
 function saveRecord(pct,metrics={}){
  const record={id:Date.now()+Math.random(),name,age:student.age,game,level,passed:metrics.levelOutcome==='completed'||pct>=80,percent:pct,metrics,date:new Date().toISOString(),teacher:TEACHER};
  setRecords(old=>[...old,record]);
  if(supabaseConfigured&&supabase){
   supabase.from('pmd_results').insert({
    student_first_name:student.first.trim(),student_last_name:student.last.trim(),
    age:student.age,game,level,score_percent:pct,passed:metrics.levelOutcome==='completed'||pct>=80,metrics,teacher:TEACHER
   }).then(({error})=>{if(error)console.error('No se pudo guardar en Supabase:',error.message)});
  }
 }
 function calculateRubric(pct, telemetry={}){
  // Rúbrica inicial: logro 60 %, precisión 25 %, autonomía observada 15 %.
  // El tiempo se registra como dato contextual y no reduce la nota.
  const errors=Math.max(0,Number(telemetry.errorCount)||0);
  const actions=Math.max(0,Number(telemetry.actionCount)||0);
  const precision=actions>0?Math.round(Math.max(0,Math.min(100,((actions-errors)/actions)*100))):100;
  const hints=Math.max(0,Number(telemetry.hintsUsed)||0);
  const autonomy=Math.max(0,100-(hints*20));
  const achievement=Math.max(0,Math.min(100,Number(pct)||0));
  const score=Math.round(achievement*0.60+precision*0.25+autonomy*0.15);
  return {achievementScore:achievement,precisionScore:precision,autonomyScore:autonomy,finalScore:score,weights:{achievement:60,precision:25,autonomy:15},timeUsedAsPenalty:false};
 }
 function passLevel(pct,metrics={}){
  if(completedRef.current)return;completedRef.current=true;
  const telemetry=buildMetrics(pct,metrics);
  const rubric=calculateRubric(pct,telemetry);
  const finalMetrics={...telemetry,rubric,levelOutcome:'completed',levelScore:rubric.finalScore};
  saveRecord(rubric.finalScore,finalMetrics);
  setFeedback(`¡Nivel superado! Desempeño: ${rubric.finalScore}/100`);
  setTimeout(()=>{if(level>=30){setView('finished')}else{setLevel(n=>n+1);resetLevel();say('¡Muy bien! Aquí viene el siguiente reto.')}},900);
 }
 function measureTrace(points){
  const svg=traceRef.current;if(!svg||points.length<2)return 0;
  const path=svg.querySelector('.guide-path');if(!path)return 0;
  const len=path.getTotalLength(),samples=120;let hit=0;
  for(let i=0;i<samples;i++){const pt=path.getPointAtLength(len*i/(samples-1));let nearest=Infinity;
   for(const q of points){const dx=pt.x-q.x,dy=pt.y-q.y;nearest=Math.min(nearest,Math.hypot(dx,dy))}
   if(nearest<15)hit++;
  }
  return Math.round(hit/samples*100);
 }
 function finishTrace(){
  const points=tracePointsRef.current;
  if(points.length<3){say('Empieza en el punto verde y sigue la línea.');return}
  const pct=measureTrace(points);setTracePct(pct);setAttempts(a=>a+1);
  const requiredTrace=ageYears<=3?70:ageYears===4?80:85;
  if(pct>=requiredTrace){say('¡Dibujo completado!');passLevel(pct,{drawingAccuracy:pct,traceCoverage:pct,requiredTrace,attempts:attempts+1})}
  else say('¡Buen intento! Sigue el contorno un poco más y vuelve a probar.');
 }
 function svgPoint(e){const svg=traceRef.current,pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const p=pt.matrixTransform(svg.getScreenCTM().inverse());return {x:p.x,y:p.y}}
 function pointerDown(e){
  const svg=traceRef.current,path=svg?.querySelector('.guide-path');if(!svg||!path)return;
  const pt=svgPoint(e),start=path.getPointAtLength(0);
  const nearStart=Math.hypot(pt.x-start.x,pt.y-start.y)<=32;
  const nearPrevious=tracePointsRef.current.some(q=>Math.hypot(pt.x-q.x,pt.y-q.y)<=30);
  const len=path.getTotalLength();let nearGuide=false;
  for(let i=0;i<=30&&!nearGuide;i++){const q=path.getPointAtLength(len*i/30);nearGuide=Math.hypot(pt.x-q.x,pt.y-q.y)<=25}
  if(tracePointsRef.current.length===0&&!nearStart){say('Empieza junto al punto verde.');return}
  if(tracePointsRef.current.length>0&&!nearStart&&!nearPrevious&&!nearGuide){say('Empieza sobre la línea o cerca del trazo anterior.');return}
  svg.setPointerCapture(e.pointerId);
  const nextStrokes=[...traceStrokesRef.current,[pt]];
  traceStrokesRef.current=nextStrokes;setTraceStrokes(nextStrokes);
  tracePointsRef.current=nextStrokes.flat();setDrawing(true);setTracePoints(tracePointsRef.current);setTracePct(measureTrace(tracePointsRef.current));
 }
 function pointerMove(e){if(!drawing)return;const pt=svgPoint(e);const nextStrokes=traceStrokesRef.current.map((stroke,i)=>i===traceStrokesRef.current.length-1?[...stroke,pt]:stroke);traceStrokesRef.current=nextStrokes;setTraceStrokes(nextStrokes);tracePointsRef.current=nextStrokes.flat();setTracePoints(tracePointsRef.current);setTracePct(measureTrace(tracePointsRef.current))}
 function pointerUp(){if(!drawing)return;setDrawing(false);/* Cada segmento queda separado; se puede soltar y continuar sin líneas de unión. */}
 function eraseTrace(){traceStrokesRef.current=[];tracePointsRef.current=[];setTraceStrokes([]);setTracePoints([]);setTracePct(0);setDrawing(false);say('Dibujo borrado. Puedes empezar de nuevo.')}
 function clickObject(i){if(game!=='mouse'||level>10||isTrace)return;if(clicked.includes(i))return;if(!clickMission.correct.includes(i)){recordError('incorrect_click');setAttempts(a=>a+1);say('Busca el dibujo grande que aparece arriba.');return}const next=[...clicked,i];setClicked(next);say('¡Muy bien!');if(next.length>=clickGoal)passLevel(100,{mouseClicks:next.length,clickGoal,clickAccuracy:100})}
 function onDrop(e,targetId){
  e.preventDefault();
  e.stopPropagation();
  if(!isDrag||completedRef.current)return;
  const types=Array.from(e.dataTransfer?.types||[]);
  if(!types.includes('text/plain'))return;
  const objectId=e.dataTransfer.getData('text/plain');
  // Solo se acepta una liberación real sobre el destino correspondiente.
  if(!objectId||!dragPairs.pairs.some(p=>p.id===objectId)||objectId!==targetId){
   recordError('incorrect_drag_drop');
   say('¡Inténtalo otra vez! Busca la pareja correcta.');
   return;
  }
  if(draggedItems.includes(targetId))return;
  const next=[...draggedItems,targetId];
  setDraggedItems(next);
  setDragged(true);
  say('¡Muy bien! Encontraste una pareja.');
  const dragGoal=dragPairs.pairs.length;
  if(next.length>=dragGoal)passLevel(100,{dragAndDrop:true,draggedPairs:next.length,dragGoal,mouseAccuracy:100,allPairsCompleted:true});
 }
 async function teacherLogin(e){
  e.preventDefault();setError('');setDbMessage('');
  if(!supabaseConfigured||!supabase){setError('Falta configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el archivo .env.');return}
  const {error:loginError}=await supabase.auth.signInWithPassword({email:teacherEmail.trim(),password:pass});
  if(loginError){setError('No se pudo iniciar sesión. Revisa el correo, la contraseña y que el usuario docente exista en Supabase Auth.');return}
  const {data,error:readError}=await supabase.from('pmd_results').select('*').order('created_at',{ascending:false});
  if(readError){setError('Sesión iniciada, pero no se pudieron leer los registros. Revisa las políticas RLS.');return}
  const mapped=(data||[]).map(r=>({id:r.id,name:`${r.student_first_name} ${r.student_last_name}`,age:r.age,game:r.game,level:r.level,passed:r.passed,percent:r.score_percent,metrics:r.metrics||{},date:r.created_at,teacher:r.teacher}));
  setRecords(mapped);setView('teacher');setDbMessage('Conectado a Supabase. Los registros mostrados provienen de la base de datos.');
 }
 async function teacherLogout(){
  if(supabaseConfigured&&supabase)await supabase.auth.signOut();
  setView('home');setPass('');setTeacherEmail('');setDbMessage('');
 }
 const filteredRecords=useMemo(()=>records.filter(r=>{if(dateMode==='all')return true;const stamp=new Date(r.date);if(Number.isNaN(stamp.getTime()))return false;const day=`${stamp.getFullYear()}-${String(stamp.getMonth()+1).padStart(2,'0')}-${String(stamp.getDate()).padStart(2,'0')}`;if(dateMode==='day')return day===singleDate;return day>=dateFrom&&day<=dateTo}),[records,dateMode,dateFrom,dateTo,singleDate]);
  const reports=useMemo(()=>{
   // Un informe por estudiante y edad; el avance no se confunde con la nota.
   const groups=new Map();
   for(const record of filteredRecords){
    const normalizedName=String(record.name||'').trim().toLocaleLowerCase('es');
    const key=`${normalizedName}|${record.age||''}`;
    if(!groups.has(key))groups.set(key,[]);
    groups.get(key).push(record);
   }
   const average=(items,selector)=>{
    const values=items.map(selector).filter(v=>typeof v==='number'&&Number.isFinite(v));
    return values.length?Math.round(values.reduce((sum,v)=>sum+v,0)/values.length):null;
   };
   const levelCount=items=>new Set(items.map(r=>r.level)).size;
   const scoreOf=r=>{
    const score=r.metrics?.rubric?.finalScore;
    return typeof score==='number'&&Number.isFinite(score)?score:null;
   };
   return [...groups.entries()].map(([key,items])=>{
    const keyboard=items.filter(r=>r.game==='keyboard');
    const mouse=items.filter(r=>r.game==='mouse');
    const click=mouse.filter(r=>r.level>=1&&r.level<=10);
    const drag=mouse.filter(r=>r.level>=11&&r.level<=20);
    const drawing=mouse.filter(r=>r.level>=21&&r.level<=30);
    const keyboardCount=levelCount(keyboard), mouseCount=levelCount(mouse);
    const clickCount=levelCount(click), dragCount=levelCount(drag), drawingCount=levelCount(drawing);
    const performance=average(items,scoreOf);
    // Capacidad 1: los niveles de dibujo son una evidencia inicial de uso de elementos visuales,
    // no una medición completa de personalización. Capacidad 2: búsqueda/clic y asociación/arrastre.
    const personalizeScore=average(drawing,r=>{
     const v=r.metrics?.drawingAccuracy;
     return typeof v==='number'?v:null;
    });
    const manageScore=average([...click,...drag],r=>{
     const v=r.metrics?.clickAccuracy ?? r.metrics?.mouseAccuracy;
     return typeof v==='number'?v:scoreOf(r);
    });
    const interactScore=average(keyboard,scoreOf);
    const createScore=average(drawing,r=>{
     const v=r.metrics?.drawingAccuracy;
     return typeof v==='number'?v:scoreOf(r);
    });
    const values=[personalizeScore,manageScore,interactScore,createScore];
    const evidenceCounts=[drawingCount,clickCount+dragCount,keyboardCount,drawingCount];
    const evidenceTargets=[10,20,30,10];
    return {
     key,name:items[0].name,age:items[items.length-1]?.age,records:items.length,
     keyboardCount,mouseCount,clickCount,dragCount,drawingCount,
     keyboardProgress:Math.round(keyboardCount/30*100),mouseProgress:Math.round(mouseCount/30*100),
     overall:performance,
     grades:CAPS.map((capability,index)=>{
      const score=values[index];
      const enoughData=evidenceCounts[index]>=evidenceTargets[index] && score!==null;
      return {name:capability,percent:score,grade:score===null?'Sin evidencia':enoughData?grade(score):'En proceso',evidence:evidenceCounts[index],target:evidenceTargets[index]};
     })
    };
   });
  },[filteredRecords]);
 function exportExcel(){
  // Exporta un resumen consolidado por estudiante, no una fila por cada nivel.
  const rows=[
   [
    'Estudiante','Edad','Intentos en el periodo',
    'Personaliza entornos virtuales (%)','Nota',
    'Gestiona información del entorno virtual (%)','Nota',
    'Interactúa en entornos virtuales (%)','Nota',
    'Crea objetos virtuales en diversos formatos (%)','Nota'
   ],
   ...reports.map(r=>[
    r.name,
    r.age,
    r.records,
    r.grades[0]?.percent ?? '',
    r.grades[0]?.grade ?? 'S/D',
    r.grades[1]?.percent ?? '',
    r.grades[1]?.grade ?? 'S/D',
    r.grades[2]?.percent ?? '',
    r.grades[2]?.grade ?? 'S/D',
    r.grades[3]?.percent ?? '',
    r.grades[3]?.grade ?? 'S/D'
   ])
  ];
  const worksheet=XLSX.utils.aoa_to_sheet(rows);
  worksheet['!cols']=[
   {wch:30},{wch:12},{wch:22},
   {wch:24},{wch:10},{wch:34},{wch:10},
   {wch:34},{wch:10},{wch:40},{wch:10}
  ];
  worksheet['!autofilter']={ref:`A1:K${Math.max(1,rows.length)}`};
  worksheet['!freeze']={xSplit:3,ySplit:1};
  const workbook=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook,worksheet,'Resumen por estudiante');
  const filterLabel=dateMode==='all'?'todos-los-registros':dateMode==='day'?singleDate:`${dateFrom}_a_${dateTo}`;
  XLSX.writeFile(workbook,`pequemundo-notas-por-capacidad-${filterLabel}.xlsx`);
 }

  const isTrace=game==='mouse'&&level>=21;
 const isDrag=game==='mouse'&&level>=11&&level<=20;
 const title=game==='keyboard'?KEY_TITLES[level-1]:MOUSE_TITLES[level-1];
 return <div className={view==='play'?'app-shell playing':view==='teacher'?'app-shell teacher-shell':'app-shell'}>
 <header className="topbar"><div className="brand-mark">✦</div><div><strong>PequeMundo Digital</strong><small>Aprendemos jugando con la computadora</small></div><div className="top-actions"><button className="sound-btn" onClick={()=>setSound(v=>!v)}>{sound?'🔊 Sonido activado':'🔇 Sonido desactivado'}</button>{view==='play'&&<button className="ghost" onClick={toggleFullscreen}>{fullscreen?'Salir de pantalla completa':'⛶ Pantalla completa'}</button>}<button className="ghost" onClick={()=>{setView('login');setError('')}}>Panel docente</button></div></header>
 {view==='home'&&<main className="welcome layout"><section className="hero"><div className="eyebrow">EXPLORAR · PRACTICAR · APRENDER</div><h1>¡Hola, pequeño<br/><span>explorador!</span></h1><p>Prepárate para una aventura con el teclado y el mouse.</p><div className="hero-art"><div className="sun"></div><div className="rainbow">🌈</div><div className="mascot">🐭</div><div className="cloud cloud-one">☁️</div><div className="cloud cloud-two">☁️</div><div className="star star-one">⭐</div><div className="star star-two">✨</div></div></section><form className="student-form panel" onSubmit={start}><div className="form-icon">🎒</div><h2>¿Quién va a jugar?</h2><p>Escribe tu nombre para comenzar.</p><label>Nombres<input value={student.first} onChange={e=>setStudent(s=>({...s,first:e.target.value}))} required maxLength="80" placeholder="Nombres del estudiante"/></label><label>Apellidos<input value={student.last} onChange={e=>setStudent(s=>({...s,last:e.target.value}))} required maxLength="80" placeholder="Apellidos del estudiante"/></label><label>Edad<select value={student.age} onChange={e=>setStudent(s=>({...s,age:e.target.value}))}>{AGES.map(a=><option key={a}>{a}</option>)}</select></label><button className="primary big">¡Empezar a jugar! <span>➜</span></button><small className="privacy-note">Docente: {TEACHER}</small></form></main>}
 {view==='games'&&<main className="layout games-view"><div className="section-heading"><div><div className="eyebrow">¡QUÉ BUENO VERTE, {student.first.toUpperCase()}!</div><h1>¿A qué aventura jugamos?</h1><p>Elige una tarjeta para comenzar. Puedes jugar en cualquier orden.</p></div><div className="level-chip">👤 {name} · {student.age}</div></div><div className="game-cards"><button className="game-card keyboard-card" onClick={()=>startGame('keyboard')}><div className="card-art keyboard-art"><span>⬆️</span><span>⬅️</span><span>⬇️</span><span>➡️</span><div className="art-mascot">🐰</div></div><div className="card-copy"><span className="tag blue">30 NIVELES</span><h2>Aventuras con Flechitas</h2><p>Usa las flechas del teclado para guiar a tu personaje.</p><div className="card-bottom">¡Vamos a movernos! <b>➜</b></div></div></button><button className="game-card mouse-card" onClick={()=>startGame('mouse')}><div className="card-art mouse-art"><span className="fruit">🍎</span><span className="fruit">🍐</span><span className="fruit">🍓</span><div className="art-mascot">🖱️</div></div><div className="card-copy"><span className="tag orange">30 NIVELES</span><h2>Mouse Mágico</h2><p>Practica el clic, el arrastre y los dibujos siguiendo un rastro.</p><div className="card-bottom">¡A dibujar y descubrir! <b>➜</b></div></div></button></div><button className="ghost" onClick={()=>setView('home')}>← Volver al inicio</button></main>}
 {view==='play'&&<main className="layout play-view"><div className="play-top"><button className="ghost" onClick={()=>setView('games')}>← Juegos</button><div><span className="tag blue">NIVEL {level} DE 30</span><h1>{title}</h1></div><div className="progress-wrap"><div className="progress-label">Progreso del nivel <b>{isTrace?tracePct:Math.min(100,collected*12)}%</b></div><div className="progress-bar"><span style={{width:`${isTrace?tracePct:Math.min(100,collected*12)}%`}}/></div></div></div><div className="play-instruction">{game==='keyboard'?`Usa las flechas para llevar al conejito a la meta. Nivel ${level}: ${title}.` : isTrace?`Sigue el contorno de ${shape.name.toLowerCase()}. Puedes soltar y continuar; comprueba al terminar.` : isDrag?dragMission.prompt:'Haz clic en tres objetos para completar la misión.'}</div>
 {game==='keyboard'&&<div className="keyboard-stage"><div className="grid-board" style={{'--grid-size':gridSize}}>{Array.from({length:gridSize*gridSize},(_,i)=>{const r=Math.floor(i/gridSize),c=i%gridSize,isPlayer=pos[0]===r&&pos[1]===c,isGoal=r===target[0]&&c===target[1],isBomb=bombs.has(`${r},${c}`),isTree=trees.has(`${r},${c}`);return <div className={`grid-cell ${isPlayer?'player-cell':''} ${isGoal?'goal-cell':''} ${isBomb?'bomb-cell':''} ${isTree?'tree-cell':''}`} key={i}>{isPlayer?'🐰':isGoal?mission[1]:isBomb?'💣':isTree?'🌳':''}</div>})}</div><aside className="maze-side"><div className="goal-display"><span>VE HASTA AQUÍ</span><strong>{mission[1]}</strong><b>{mission[0]}</b></div><p className="maze-progress">Movimientos: {collected}<br/>Evita las bombas.</p><div className="arrow-pad"><button onClick={()=>move('ArrowUp')}>↑</button><div><button onClick={()=>move('ArrowLeft')}>←</button><button onClick={()=>move('ArrowDown')}>↓</button><button onClick={()=>move('ArrowRight')}>→</button></div><small>Usa las flechas del teclado.</small></div></aside><p className="feedback maze-feedback">{feedback}</p></div>}
 {game==='mouse'&&isTrace&&<div className="trace-stage"><div className="trace-side"><span className="big-emoji">{shape.emoji}</span><h2>{shape.name}</h2><p>Repasa el contorno completo.</p><div className="mini-progress"><span style={{width:tracePct+'%'}}/></div><strong>{tracePct}% completado</strong><p className="hint">Puedes dibujar en varios intentos antes de comprobar. Si no llegas al 80 %, sigue practicando.</p></div><svg ref={traceRef} className="trace-canvas" viewBox="0 0 300 260" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={()=>{setDrawing(false);tracePointsRef.current=[];setTracePoints([])}}><path d={shape.path} className="guide-path"/>{traceStrokes.map((stroke,i)=><polyline key={i} points={stroke.map(p=>`${p.x},${p.y}`).join(' ')} className="user-line"/>)}<circle cx={shapeStart.x} cy={shapeStart.y} r="7" className="start-dot"/><text x={shapeStart.x} y={Math.max(12,shapeStart.y-15)} textAnchor="middle" className="svg-label">EMPIEZA AQUÍ</text></svg><div className="trace-actions"><button className="ghost erase-button" onClick={eraseTrace}>⌫ Borrar y empezar de nuevo</button><button className="primary" onClick={finishTrace}>¡Terminé! Comprobar dibujo</button></div></div>}
 {game==='mouse'&&!isTrace&&!isDrag&&<div className="simple-mouse-stage click-game-stage"><h2>{title}</h2><p>{clickMission.prompt}</p><div className="target-to-find" aria-label={`Busca ${clickMission.targetName}`}><span>BUSCA ESTE DIBUJO</span><strong>{clickMission.target}</strong><b>{clickMission.targetName}</b></div><div className="click-targets">{clickMission.items.map((v,i)=><button key={i} className={`${clicked.includes(i)?'selected-target':''} ${!clickMission.correct.includes(i)?'distractor-target':''}`} onClick={()=>clickObject(i)} aria-label={`Objeto ${i+1}`}>{v}</button>)}</div><div className="click-counter" aria-live="polite"><span>OBJETOS ENCONTRADOS</span><strong>{clicked.length}<i>/{clickGoal}</i></strong><small>{clicked.length>=clickGoal?'¡Reto completado!':`Encuentra ${clickGoal-clicked.length} más`}</small></div></div>}
 {game==='mouse'&&isDrag&&<div className="simple-mouse-stage drag-game-stage"><h2>{dragMission.title}</h2><p>{dragMission.prompt}</p><div className="drag-counter" aria-live="polite"><strong>{draggedItems.length}<i>/{ageYears<=3?2:3}</i></strong><span>{draggedItems.length>=(ageYears<=3?2:3)?'¡Todas las parejas!':`Faltan ${Math.max(0,(ageYears<=3?2:3)-draggedItems.length)} objetos`}</span></div><div className="drag-matching-board"><div className="drag-source-column"><h3>ARRASTRA</h3>{dragPairs.objects.filter(p=>!draggedItems.includes(p.id)).map(p=><div key={`${p.id}-${p.object}-${p.target}`} draggable onDragStart={e=>{e.dataTransfer.clearData();e.dataTransfer.setData('text/plain',p.id);e.dataTransfer.effectAllowed='move'}} className="drag-object" aria-label={`Arrastra ${p.object}`}>{p.object}</div>)}</div><div className="drag-target-column"><h3>SUELTA EN SU PAREJA</h3>{dragPairs.targets.map(p=><div key={`${p.id}-${p.object}-${p.target}`} className={`drag-target ${draggedItems.includes(p.id)?'drag-target-done':''}`} onDragOver={e=>e.preventDefault()} onDrop={e=>onDrop(e,p.id)}><span>{p.target}</span><small>{draggedItems.includes(p.id)?'¡Bien!':p.label}</small></div>)}</div></div></div>}
 <div className="play-bottom"><p className="feedback">{feedback}</p><div className="play-buttons"><button className="ghost" onClick={()=>{resetLevel();say('Puedes volver a intentarlo.')}}>Reintentar nivel</button>{game==='keyboard'&&<button className="primary" onClick={()=>{say('Lleva al conejito hasta el objeto objetivo.')}}>Ver indicación</button>}</div><small>El avance es automático cuando completas correctamente el reto. Para salir de la actividad, usa «Juegos».</small></div></main>}
 {view==='finished'&&<main className="layout finished-view panel"><div className="celebration">🏆 🌟 🎉</div><h1>¡Lo lograste, {student.first}!</h1><p>Has completado los 30 niveles de esta aventura.</p><button className="primary big" onClick={()=>setView('games')}>Volver a los juegos</button></main>}
 {view==='login'&&<main className="layout teacher-login panel"><div className="form-icon">🔐</div><h1>Panel docente</h1><p>Ingresa con el usuario docente creado en Supabase Authentication.</p><form onSubmit={teacherLogin}><label>Correo del docente<input type="email" autoComplete="username" value={teacherEmail} onChange={e=>setTeacherEmail(e.target.value)} required placeholder="docente@colegio.edu.pe"/></label><label>Contraseña<input type="password" autoComplete="current-password" value={pass} onChange={e=>setPass(e.target.value)} required/></label><button className="primary big">Ingresar</button></form>{!supabaseConfigured&&<p className="error">Supabase todavía no está configurado. Completa el archivo .env y reinicia Vite.</p>}{error&&<p className="error">{error}</p>}<button className="ghost" onClick={()=>setView('home')}>Volver</button></main>}
 {view==='teacher'&&<main className="layout teacher-view"><div className="section-heading"><div><div className="eyebrow">PANEL PRIVADO · DOCENTE</div><h1>Reporte de progreso</h1><p>Docente: {TEACHER}</p></div><div className="teacher-actions"><button className="primary" onClick={exportExcel}>Exportar Excel (.xlsx) ↓</button><button className="ghost" onClick={teacherLogout}>Cerrar sesión</button></div></div>{dbMessage&&<p className="report-note">{dbMessage}</p>}<section className="date-filter panel"><h2>Consultar por fecha</h2><div className="date-filter-controls"><label>Vista<select value={dateMode} onChange={e=>setDateMode(e.target.value)}><option value="range">Rango de fechas</option><option value="day">Un día específico</option><option value="all">Todos los registros</option></select></label>{dateMode==='range'&&<><label>Desde<input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} /></label><label>Hasta<input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} /></label></>}{dateMode==='day'&&<label>Fecha<input type="date" value={singleDate} onChange={e=>setSingleDate(e.target.value)} /></label>}<button className="ghost" onClick={()=>setDateMode('all')}>Mostrar todos</button></div>{dateMode==='range'&&dateFrom&&dateTo&&dateFrom>dateTo&&<p className="error">La fecha inicial no puede ser posterior a la fecha final.</p>}</section><div className="summary-cards"><div className="summary"><span>Estudiantes registrados</span><b>{reports.length}</b></div><div className="summary"><span>Resultados de niveles guardados</span><b>{filteredRecords.length}</b></div><div className="summary"><span>Juegos</span><b>2 × 30</b></div></div>{(dateMode==='range'&&dateFrom>dateTo)||reports.length===0?<div className="empty panel"><div>📊</div><h2>{dateMode==='range'&&dateFrom>dateTo?'Revisa el rango de fechas':'No hay resultados en este periodo'}</h2><p>{dateMode==='range'&&dateFrom>dateTo?'La fecha inicial debe ser anterior o igual a la fecha final.':'Prueba otro día o rango de fechas. Los resultados deben tener una fecha guardada en Supabase.'}</p></div>:<div className="table-wrap"><table><thead><tr><th>Estudiante</th><th>Edad</th><th>Niveles registrados</th><th>Avance por juego</th><th>Desempeño observado</th><th>Evaluación por capacidad</th></tr></thead><tbody>{reports.map(r=><tr key={r.key}><td><strong>{r.name}</strong></td><td>{r.age}</td><td>{r.records}</td><td><div className="grade-list"><div><span>Teclado</span><b>{r.keyboardCount}/30 · {r.keyboardProgress}%</b></div><div><span>Mouse</span><b>{r.mouseCount}/30 · {r.mouseProgress}%</b></div></div></td><td>{typeof r.overall!=='number'?'Sin evidencia':`${r.overall}/100 (niveles completados)`}</td><td><div className="grade-list">{r.grades.map(g=><div key={g.name}><span>{g.name}</span><b>{g.percent===null?g.grade:`${g.percent}% · ${g.grade}`}</b></div>)}</div></td></tr>)}</tbody></table></div>}<div className="report-note">El avance indica niveles completados de 30 por juego y no equivale a una nota final. Personaliza usa provisionalmente la precisión de dibujo como evidencia inicial; para evaluarla con rigor se deberá registrar la selección de colores, figuras o herramientas. Gestiona usa búsqueda/clic y asociación/arrastre; Interactúa usa teclado; Crea usa dibujo. “En proceso” indica que aún falta completar el conjunto de actividades de esa capacidad. Los intentos fallidos no se guardan como registros independientes en esta versión.</div></main>}
 <footer><span>PequeMundo Digital</span><span>Docente: {TEACHER}</span><span>Aprender jugando ✦</span></footer>
 </div>
}
export default App;
