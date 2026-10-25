import React, { useEffect, useMemo, useState } from 'react';
import pixelArtData from './miniexcel-pixelart-niveles-21-30.json';

// Vite carga automáticamente los PNG que estén en src/imagenes (21.png ... 30.png).
const miniExcelImages = import.meta.glob('./imagenes/*.png', {
  eager: true,
  query: '?url',
  import: 'default'
});

const COLORS = [
  { name: 'Amarillo', value: '#FFDF32' },
  { name: 'Rojo', value: '#F12F3B' },
  { name: 'Azul', value: '#168BE8' },
  { name: 'Verde', value: '#16964F' },
  { name: 'Negro', value: '#202124' },
  { name: 'Marrón', value: '#8B4A20' },
  { name: 'Blanco', value: '#FFFFFF' },
  { name: 'Rosa', value: '#FF7F8A' },
  { name: 'Celeste', value: '#47B9E8' }
];
const COLS = 'ABCDEFGHIJKL'.split('');
const SESSION_KEY = 'pmd_miniexcel_progress_v3';
const SESSION_TTL = 2 * 60 * 60 * 1000;
function progressKey(level) { return `${SESSION_KEY}_${level}`; }
function readMiniProgress(level) {
  try {
    const saved = JSON.parse(localStorage.getItem(progressKey(level)) || 'null');
    if (saved && Date.now() - saved.updatedAt < SESSION_TTL && saved.level === level) return saved;
    // No recuperar patrones de versiones anteriores: los dibujos fueron rediseñados.
  } catch {}
  return null;
}
const coordinateMissions = [
  { cells: ['A4','A8','A9'], color: 0 },
  { cells: ['B3','B4','B5'], color: 1 },
  { cells: ['C2','C3','D3'], color: 2 },
  { cells: ['A2','B2','C2','D2'], color: 3 },
  { cells: ['E4','E5','E6','F6'], color: 4 },
  { cells: ['G2','G3','G4','H4'], color: 5 },
  { cells: ['C6','D6','E6','F6'], color: 0 },
  { cells: ['D3','D4','D5','D6','E6'], color: 1 },
  { cells: ['F2','G2','F3','G3'], color: 2 },
  { cells: ['B7','C7','D7','E7','F7'], color: 3 }
];
// Niveles 21–30 se leen exclusivamente del JSON compartido.
// El modelo, el tablero y la validación usan la misma matriz de colores.
function pixelColorAt(level, row, col) {
  const rows = pixelArtData?.levels?.[String(level)]?.rows;
  const value = rows?.[row]?.[col];
  return typeof value === 'string' ? value.trim().toUpperCase() : '#FFFFFF';
}

function buildPixelMap(level) {
  const map = {};
  for (let row = 0; row < 12; row++) {
    for (let col = 0; col < 12; col++) {
      const color = pixelColorAt(level, row, col);
      // El fondo blanco queda vacío; solo las celdas de color forman el objetivo.
      if (color !== '#FFFFFF') map[row * 12 + col + 1] = color;
    }
  }
  return map;
}

function coordToIndex(coord, width = 10) {
  const col = coord.charCodeAt(0) - 65;
  const row = Number(coord.slice(1)) - 1;
  return row * width + col;
}
export default function MiniExcel({ level, onLevelComplete, onContinue, onExit, studentName }) {
  const mission = coordinateMissions[(level - 1) % coordinateMissions.length];
  const pixelMode = level >= 21;
  const pixelModelImage = miniExcelImages[`./imagenes/${level}.png`];
  const shapeMode = level >= 11 && level <= 20;
  // Niveles 1-20 conservan la hoja clásica de 10x10; solo pixel art usa 12x12.
  const boardSize = pixelMode ? 12 : 10;
  const boardCols = COLS.slice(0, boardSize);
  const targetMap = useMemo(() => {
    if (pixelMode) return buildPixelMap(level);
    if (shapeMode) {
      const pattern = coordinateMissions[(level - 11) % coordinateMissions.length];
      const result = {};
      pattern.cells.forEach((coord, i) => { result[coordToIndex(coord, boardSize) + 1] = COLORS[(pattern.color + (i % 2)) % 4].value; });
      return result;
    }
    const result = {};
    mission.cells.forEach(coord => { result[coordToIndex(coord, boardSize) + 1] = COLORS[mission.color].value; });
    return result;
  }, [level, pixelMode, shapeMode, mission, boardSize]);
  const expectedCoords = useMemo(() => Object.keys(targetMap).map(Number), [targetMap]);
  const [painted, setPainted] = useState(() => readMiniProgress(level)?.painted || {});
  const [selectedColor, setSelectedColor] = useState(() => readMiniProgress(level)?.selectedColor || COLORS[0].value);
  const [wrongPaints, setWrongPaints] = useState(0);
  const [cellClicks, setCellClicks] = useState(0);
  const [hints, setHints] = useState(0);
  const [notice, setNotice] = useState('Selecciona el color y pinta las celdas indicadas.');
  const [startedAt, setStartedAt] = useState(Date.now());
  const [done, setDone] = useState(false);

  useEffect(() => {
    const saved = readMiniProgress(level); setPainted(saved?.painted || {}); setSelectedColor(saved?.selectedColor || COLORS[0].value); setWrongPaints(0); setCellClicks(0); setHints(0);
    setNotice('Selecciona el color y pinta las celdas indicadas.'); setStartedAt(Date.now()); setDone(false);
  }, [level]);

  useEffect(() => {
    try { localStorage.setItem(progressKey(level), JSON.stringify({ level, painted, selectedColor, updatedAt: Date.now() })); } catch {}
  }, [level, painted, selectedColor]);

  const requiredColor = pixelMode || shapeMode ? null : COLORS[mission.color];
  const instruction = pixelMode
    ? 'Mira el dibujo de abajo. Copia sus cuadritos en la hoja grande, usando los mismos colores.'
    : shapeMode
      ? 'Mira cada tarjeta: busca esa celda en la hoja, elige el color que aparece y tócala.'
      : `Busca las celdas indicadas y píntalas de color ${requiredColor.name.toLowerCase()}.`;
  const visualTargets = expectedCoords.map(index => ({
    index,
    coord: `${boardCols[(index - 1) % boardSize]}${Math.floor((index - 1) / boardSize) + 1}`,
    color: targetMap[index]
  }));

  function paintCell(index) {
    if (done) return;
    setCellClicks(v => v + 1);
    const expected = targetMap[index + 1];
    if (expected && expected !== selectedColor) setWrongPaints(v => v + 1);
    setPainted(old => ({ ...old, [index + 1]: selectedColor }));
  }

  function checkWork() {
    let correct = 0;
    expectedCoords.forEach(index => { if (painted[index] === targetMap[index]) correct += 1; });
    const wrongCells = Object.entries(painted).filter(([index, color]) => !targetMap[Number(index)] || targetMap[Number(index)] !== color).length;
    const pct = expectedCoords.length ? Math.round((correct / expectedCoords.length) * 100) : 0;
    if (correct === expectedCoords.length && wrongCells === 0) {
      setDone(true);
      setNotice('¡Muy bien! Completaste todas las celdas correctas.');
      const elapsedMs = Date.now() - startedAt;
      onLevelComplete(100, {
        activity: 'miniexcel', levelType: pixelMode ? 'pixel-art' : shapeMode ? 'mosaic' : 'coordinates',
        cellsExpected: expectedCoords.length, cellsCorrect: correct, cellsIncorrect: wrongPaints + wrongCells,
        cellClicks, hintsUsed: hints, accuracyPercent: pct, elapsedMs,
        coordinates: expectedCoords.map(i => `${boardCols[(i - 1) % boardSize]}${Math.floor((i - 1) / boardSize) + 1}`),
        actionAccuracyPercent: cellClicks ? Math.max(0, Math.round(((cellClicks - wrongPaints) / cellClicks) * 100)) : 100,
        selectedColors: [...new Set(Object.values(painted))], levelOutcome: 'completed'
      });
    } else {
      setWrongPaints(v => v + Math.max(0, wrongCells));
      setNotice(`Llevas ${correct} de ${expectedCoords.length} celdas correctas. Revisa los colores y vuelve a comprobar.`);
    }
  }

  function showHint() {
    setHints(v => v + 1);
    if (!pixelMode && !shapeMode) {
      setNotice(`Busca las celdas ${mission.cells.join(', ')} y usa el color ${requiredColor.name.toLowerCase()}.`);
    } else {
      const next = expectedCoords.find(index => painted[index] !== targetMap[index]);
      if (next) setNotice(`Pista: revisa la celda ${COLS[(next - 1) % boardSize]}${Math.floor((next - 1) / boardSize) + 1}.`);
    }
  }

  return <div className={`mini-layout-shell ${pixelMode ? 'mini-layout-pixel' : ''}`}>
    <aside className="miniexcel-task-panel mini-external-task-panel" aria-label="Misión del nivel">
      <div className="mini-task-head">MISIÓN</div><h3>{pixelMode ? 'Copia el dibujo' : shapeMode ? 'Completa el mosaico' : 'Pinta las celdas'}</h3>
      <p>{instruction}</p>
      {!pixelMode && <div className="mini-target-list" aria-label="Guía visual de celdas que debes pintar"><div className="mini-target-list-title">🎯 {shapeMode ? 'COPIA ESTAS CELDAS' : 'BUSCA ESTAS CELDAS'}</div>{visualTargets.map(({coord,color}) => <div className="mini-target-item" key={coord}><span className="mini-target-coordinate">{coord}</span><span className="mini-target-arrow" aria-hidden="true">➜</span><span className="mini-target-swatch" style={{background: color}} aria-label="Color que debes usar"/></div>)}<div className="mini-target-caption">{shapeMode ? 'Busca cada código en la hoja y usa el color de su tarjeta.' : 'Busca el código, elige el color y haz clic en la celda.'}</div></div>}
      {pixelMode && <><div className="mini-model-label">👀 MIRA EL MODELO Y CÓPIALO</div><div className="mini-model-image-wrap" aria-label="Modelo del dibujo para copiar">{pixelModelImage ? <img className="mini-model-image" src={pixelModelImage} alt={`Modelo del nivel ${level}`} /> : <div className="mini-model-coordinate-grid mini-model-coordinate-grid-12" aria-label="Modelo pixelado generado desde la matriz JSON"><div className="mini-model-corner"/><div className="mini-model-col-heads">{'ABCDEFGHIJKL'.split('').map(col=><b key={col}>{col}</b>)}</div><div className="mini-model-row-heads">{Array.from({length:12},(_,i)=><b key={i}>{i+1}</b>)}</div><div className="mini-model-grid mini-model-grid-12">{Array.from({length:144},(_,i)=>{const r=Math.floor(i/12),c=i%12;return <span key={i} style={{background:pixelColorAt(level,r,c)}}/>})}</div></div>}</div><div className="mini-target-caption">Copia el dibujo en la misma posición: usa la letra de arriba y el número del lado.</div></>}
      {!shapeMode && <div className="mini-required-color"><span style={{background: requiredColor?.value || selectedColor}}/>{requiredColor?.name || 'Colores del modelo'}</div>}
      <div className="mini-task-progress"><b>{expectedCoords.filter(i => painted[i] === targetMap[i]).length}</b> / {expectedCoords.length} celdas correctas</div>
      <button className="mini-hint-btn" onClick={showHint}>💡 Dame una pista</button>
    </aside>
    <section className={`miniexcel-window ${pixelMode ? 'mini-board-pixel' : 'mini-board-classic'} ${done ? 'mini-level-done' : ''}`} aria-label="MiniExcel para niños de cinco años">
    <div className="miniexcel-titlebar"><span className="mini-excel-logo">X</span><strong>MiniExcel · Hoja de cálculo</strong><span className="mini-title-spacer"/><span>Estudiante: {studentName} · 5 años</span><button onClick={onExit}>Salir ✕</button></div>
    <div className="miniexcel-ribbon"><div className="mini-ribbon-tab active">Inicio</div><div className="mini-ribbon-tab">Celdas</div><div className="mini-ribbon-tab">Colores</div><div className="mini-ribbon-note">Nivel {level} de 30 · MiniExcel</div></div>
    <div className="mini-formula-row"><div className="mini-name-box">{!pixelMode && !shapeMode ? mission.cells[0] : 'A1'}</div><div className="mini-fx">fx</div><div className="mini-formula">{!pixelMode && !shapeMode ? `Pinta las celdas de color ${requiredColor.name.toLowerCase()}` : pixelMode ? 'Copia el modelo pixelado' : 'Completa el mosaico'}</div></div>
    <div className="miniexcel-workspace">
      <div className="miniexcel-sheet-wrap"><div className="miniexcel-sheet">
        <div className="mini-corner-cell"/><div className="mini-col-heads">{boardCols.map(col=><div key={col}>{col}</div>)}</div>
        <div className="mini-row-heads">{Array.from({length:boardSize},(_,i)=><div key={i}>{i+1}</div>)}</div>
        <div className="mini-grid-cells">{Array.from({length:boardSize * boardSize},(_,i)=>{const index=i+1;const expected=targetMap[index];const value=painted[index];const targetColor=expectedCoords.includes(index);const coord=`${boardCols[i%boardSize]}${Math.floor(i/boardSize)+1}`;return <button key={index} title={`Celda ${coord}`} aria-label={`Celda ${coord}`} className={`mini-cell ${targetColor?'mini-target-cell':''}`} style={{background:value||'#fff'}} onClick={()=>paintCell(i)}>{!value && !pixelMode && !shapeMode && targetColor ? '•' : ''}</button>})}</div>
      </div></div>
    </div>
    <div className="miniexcel-bottom"><div className="mini-palette" aria-label="Paleta de colores">{COLORS.map(color=><button key={color.value} title={color.name} aria-label={`Seleccionar ${color.name}`} className={selectedColor===color.value?'selected':''} style={{background:color.value}} onClick={()=>setSelectedColor(color.value)}/>)}</div><div className="mini-current-color"><span style={{background:selectedColor}}/> Color seleccionado</div><button className="mini-clear-btn" onClick={()=>{setPainted({});setNotice('Cuadrícula limpia. Inténtalo de nuevo.')}}>Borrar</button><button className="mini-check-btn" onClick={checkWork} disabled={done}>✓ Comprobar</button></div>
    <div className={`mini-feedback ${done?'success':''}`} role="status">{notice}</div>
    {done && <div className="mini-congrats-backdrop"><div className="mini-congrats-card" role="dialog" aria-modal="true" aria-labelledby="mini-congrats-title"><div className="mini-congrats-star" aria-hidden="true">★</div><h2 id="mini-congrats-title">¡FELICITACIONES!</h2><p>¡Lo hiciste muy bien!</p><p className="mini-congrats-detail">Completaste todas las celdas correctamente.</p><button className="mini-next-btn" onClick={()=>{try{localStorage.removeItem(progressKey(level));localStorage.removeItem('pmd_miniexcel_progress_v1'); localStorage.removeItem('pmd_miniexcel_progress_v2')}catch{} onContinue()}}>{level >= 30 ? '¡Terminé los 30 niveles!' : '¡Haz clic para el siguiente nivel!'} ➜</button></div></div>}
    </section>
  </div>;
}
