// ================================================================
//  TCP PETRI NET SIMULATOR — main.js  (v2: animaciones fluidas)
// ================================================================

// ─── CARGA DE COMPONENTES ────────────────────────────────────────
async function iniciarApp() {
  const app = document.getElementById('app');
  const componentes = ['components/header.html','components/definitions.html','components/simulator-ui.html','components/properties.html'];
  try {
    const htmls = await Promise.all(componentes.map(u => fetch(u).then(r => r.text())));
    document.getElementById('loading-screen').style.opacity = '0';
    setTimeout(() => { app.innerHTML = htmls.join('\n'); iniciarCanvas(); iniciarSimulador(); }, 420);
  } catch(e) {
    app.innerHTML = `<div style="padding:4rem;text-align:center;font-family:monospace;color:#f85149">
      Error cargando componentes.<br><small style="color:#8b949e">Usa un servidor local: python -m http.server 8080</small></div>`;
  }
}

// ─── CANVAS PARTÍCULAS ───────────────────────────────────────────
function iniciarCanvas() {
  const canvas = document.getElementById('canvas-fondo');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
  resize(); window.addEventListener('resize', resize);
  const pts = Array.from({length:55}, () => ({
    x: Math.random()*canvas.width, y: Math.random()*canvas.height,
    r: Math.random()*1.4+0.3,
    vx: (Math.random()-.5)*.22, vy: (Math.random()-.5)*.22,
    color: ['#388bfd','#3fb950','#d29922','#bc8cff'][Math.floor(Math.random()*4)]
  }));
  (function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pts.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = p.color; ctx.fill();
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0) p.x=canvas.width; if(p.x>canvas.width) p.x=0;
      if(p.y<0) p.y=canvas.height; if(p.y>canvas.height) p.y=0;
    });
    requestAnimationFrame(draw);
  })();
}

// ─── POSICIONES SVG DE NODOS (para animación de tokens) ──────────
// Coordenadas exactas del centro de cada plaza/transición en el SVG
const POS = {
  // FSM Cliente
  'ec-cerrado':  { x:94,  y:88  },
  'ec-synenv':   { x:94,  y:208 },
  'ec-estab':    { x:94,  y:338 },
  'ec-fin':      { x:94,  y:450 },
  // FSM Servidor
  'es-escucha':  { x:906, y:88  },
  'es-synrec':   { x:906, y:248 },
  'es-estab':    { x:906, y:368 },
  'es-cerrando': { x:906, y:458 },
  // Plazas PN
  'pn-bufc':     { x:260, y:88  },
  'tr-env-syn':  { x:376, y:88  },
  'pn-syn':      { x:470, y:88  },
  'tr-ent-syn':  { x:576, y:88  },
  'pn-bufs':     { x:670, y:88  },
  'tr-env-sack': { x:660, y:248 },
  'pn-synack':   { x:530, y:248 },
  'tr-ent-sack': { x:380, y:248 },
  'pn-bufc2':    { x:260, y:248 },
  'tr-env-ack':  { x:316, y:368 },
  'pn-ack':      { x:440, y:368 },
  'tr-ent-ack':  { x:566, y:368 },
  'pn-perdido':  { x:470, y:458 },
  // Waypoints visuales para animaciones por aristas curvas
  'pto-inhibidor': { x:470, y:300 }, // Para curvar la caída hacia la pérdida
  'pto-to-c1':   { x:40,  y:195 },   // Curva izquierda (timeout cliente)
  'pto-to-c2':   { x:32,  y:148 },
  'pto-to-c3':   { x:40,  y:100 },
  'pto-to-s1':   { x:960, y:235 },   // Curva derecha (timeout servidor)
  'pto-to-s2':   { x:968, y:168 },
  'pto-to-s3':   { x:960, y:100 },
};

// ─── ANIMACIÓN FLUIDA DE TOKEN ────────────────────────────────────
// waypoints: array de nodeIds ['pn-bufc','tr-env-syn','pn-syn']
// El token viaja encadenado por todos los puntos
function animarToken(viajesData, color = '#f78166', baseDur = 420) {
  const svg = document.getElementById('diagrama-principal');
  if (!svg || !viajesData) return Promise.resolve();

  // Velocidad de la simulación
  const speedMult = window.sim ? (window.sim.velocidad || 1) : 1;
  const durPorSegmento = baseDur / speedMult;

  const viajes = (viajesData.length > 0 && Array.isArray(viajesData[0])) ? viajesData : [viajesData];

  const animaciones = viajes.map(waypoints => {
    return new Promise(resolve => {
      if (waypoints.length < 2) { resolve(); return; }

      const NS = 'http://www.w3.org/2000/svg';
      const circ = document.createElementNS(NS, 'circle');
      circ.setAttribute('r', '8');
      circ.setAttribute('fill', color);
      circ.style.filter = `drop-shadow(0 0 8px ${color})`;
      circ.style.pointerEvents = 'none';
      circ.classList.add('token-viajero');
      
      const p0 = POS[waypoints[0]];
      if (!p0) { resolve(); return; }
      circ.setAttribute('cx', p0.x); circ.setAttribute('cy', p0.y);
      svg.appendChild(circ);

      let segmento = 0;

      function animarSegmento() {
        if (segmento >= waypoints.length - 1) { 
           if(svg.contains(circ)) svg.removeChild(circ); 
           resolve(); 
           return; 
        }
        const origen  = POS[waypoints[segmento]];
        const destino = POS[waypoints[segmento + 1]];
        if (!origen || !destino) { segmento++; animarSegmento(); return; }
        const inicio = performance.now();

        const midId = waypoints[segmento + 1];
        if (midId && midId.startsWith('tr-')) {
          const el = document.getElementById(midId);
          if (el) {
            el.style.filter = 'drop-shadow(0 0 10px #d29922) brightness(2)';
            setTimeout(() => { if(el) el.style.filter = 'none'; }, durPorSegmento * 0.8);
          }
        }

        (function frame(now) {
          const t = Math.min((now - inicio) / durPorSegmento, 1);
          const e = t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
          circ.setAttribute('cx', origen.x + (destino.x - origen.x) * e);
          circ.setAttribute('cy', origen.y + (destino.y - origen.y) * e);
          const s = 8 + Math.sin(t * Math.PI) * 3;
          circ.setAttribute('r', s.toFixed(1));
          if (t < 1) { requestAnimationFrame(frame); }
          else { segmento++; animarSegmento(); }
        })(inicio);
      }
      animarSegmento();
    });
  });

  return Promise.all(animaciones);
}

// ─── ESCENARIOS ───────────────────────────────────────────────────
const ESCENARIOS = {
  normal: [
    {
      titulo: 'Estado Inicial',
      desc: 'Sistema en reposo. M₀(p)=0 ∀p ∈ P. Cliente en CERRADO, Servidor en ESCUCHA.',
      cliente:'CERRADO', servidor:'ESCUCHA', tokens:{}, trans:null,
      formula:'M₀(p)=0 ∀p', color:'#f78166',
      viaje: null,
      log:{tipo:'info', msg:'SIM INIT — M₀ aplicado'}
    },
    {
      titulo:'Paso 1 — Cliente inicia conexión',
      desc:'δ_C(CERRADO, iniciar_conexion) → SYN-ENVIADO. Token depositado en p_buf_C.',
      cliente:'SYN-ENVIADO', servidor:'ESCUCHA', tokens:{'tk-bufc':true}, trans:null,
      formula:'M(p_buf_C)=1',
      viaje: ['ec-cerrado','pn-bufc'],
      log:{tipo:'ok', msg:'[SYN] generado → token en p_buf_C'}
    },
    {
      titulo:'Paso 2 — enviar_SYN dispara',
      desc:'Habilitada: M(p_buf_C)≥1. Disparo: M(p_buf_C)=0, M(p_SYN)=1. SYN en tránsito.',
      cliente:'SYN-ENVIADO', servidor:'ESCUCHA', tokens:{'tk-syn':true}, trans:'tr-env-syn',
      formula:"M'=M−W(p,t)+W(t,p)",
      viaje: ['pn-bufc','tr-env-syn','pn-syn'],
      log:{tipo:'token', msg:'env_SYN disparada → p_SYN'}
    },
    {
      titulo:'Paso 3 — entregar_SYN dispara',
      desc:'Habilitada: M(p_SYN)≥1 ∧ ¬M(p_perdido). Disparo: M(p_SYN)=0, M(p_buf_S)=1.',
      cliente:'SYN-ENVIADO', servidor:'ESCUCHA', tokens:{'tk-bufs':true}, trans:'tr-ent-syn',
      formula:'ent_SYN: M(p_SYN)≥1 ∧ ¬M(p_perd)',
      viaje: ['pn-syn','tr-ent-syn','pn-bufs'],
      log:{tipo:'token', msg:'ent_SYN disparada → p_buf_S'}
    },
    {
      titulo:'Paso 4 — Servidor recibe SYN',
      desc:'δ_S(ESCUCHA, rcv_SYN) → SYN-RECIBIDO. Servidor coloca SYNACK en p_SYNACK.',
      cliente:'SYN-ENVIADO', servidor:'SYN-RECIBIDO', tokens:{'tk-synack':true}, trans:null,
      formula:'δ_S(ESCUCHA,rcvSYN)=SYN-REC',
      viaje: ['pn-bufs','es-escucha','es-synrec','tr-env-sack','pn-synack'],
      log:{tipo:'ok', msg:'[SYN] entregado → Servidor → SYN-RECIBIDO'}
    },
    {
      titulo:'Paso 5 — entregar_SYNACK dispara',
      desc:'SYNACK viaja por el canal. Disparo ent_SYNACK: token llega a p_buf_C₂. Cliente recibirá SYNACK.',
      cliente:'SYN-ENVIADO', servidor:'SYN-RECIBIDO', tokens:{'tk-bufc2':true}, trans:'tr-ent-sack',
      formula:'Concurrencia: P(SYN)∩P(SYNACK)=∅',
      viaje: ['pn-synack','tr-ent-sack','pn-bufc2'],
      log:{tipo:'token', msg:'ent_SYNACK disparada → p_buf_C₂'}
    },
    {
      titulo:'Paso 6 — Cliente recibe SYNACK → ESTABLECIDO',
      desc:'δ_C(SYN-ENVIADO, rcv_SYNACK) → ESTABLECIDO. Cliente envía ACK. Token a p_ACK.',
      cliente:'ESTABLECIDO', servidor:'SYN-RECIBIDO', tokens:{'tk-ack':true}, trans:null,
      formula:'δ_C(SYN-ENV,rcvSYNACK)=ESTAB',
      viaje: ['pn-bufc2','ec-synenv','ec-estab','tr-env-ack','pn-ack'],
      log:{tipo:'ok', msg:'[SYNACK] recibido → Cliente → ESTABLECIDO'}
    },
    {
      titulo:'Paso 7 — Handshake completo ✓',
      desc:'δ_S(SYN-RECIBIDO, rcv_ACK) → ESTABLECIDO. Ambos FSMs en ESTABLECIDO. Conexión TCP activa.',
      cliente:'ESTABLECIDO', servidor:'ESTABLECIDO', tokens:{}, trans:'tr-ent-ack',
      formula:'∃σ: A_C=ESTAB ∧ A_S=ESTAB',
      viaje: ['pn-ack','tr-ent-ack','es-estab'],
      log:{tipo:'ok', msg:'✓ HANDSHAKE COMPLETO — Conexión TCP activa'}
    }
  ],

  perdida: [
    {
      titulo:'Estado Inicial — Pérdida de Paquete',
      desc:'Escenario con canal con pérdida. La plaza inhibidora p_perdido bloqueará la entrega del SYN.',
      cliente:'CERRADO', servidor:'ESCUCHA', tokens:{}, trans:null,
      formula:'M₀(p)=0 ∀p', viaje:null,
      log:{tipo:'warn', msg:'ESCENARIO: pérdida de paquete'}
    },
    {
      titulo:'Paso 1 — SYN enviado al canal',
      desc:'Cliente transiciona. Token SYN viaja por el canal: p_buf_C → env_SYN → p_SYN.',
      cliente:'SYN-ENVIADO', servidor:'ESCUCHA', tokens:{'tk-syn':true}, trans:'tr-env-syn',
      formula:'M(p_SYN)=1', viaje:['ec-cerrado','pn-bufc','tr-env-syn','pn-syn'],
      log:{tipo:'token', msg:'[SYN] en tránsito → p_SYN'}
    },
    {
      titulo:'Paso 2 — Paquete perdido',
      desc:'p_perdido se activa (M=1). ent_SYN queda inhabilitada (arco inhibidor). SYN nunca llega.',
      cliente:'SYN-ENVIADO', servidor:'ESCUCHA', tokens:{'tk-perdido':true}, trans:null,
      formula:'¬hab(ent_SYN): M(p_perd)=1', viaje:['pn-syn', 'tr-ent-syn', 'pto-inhibidor', 'pn-perdido'],
      log:{tipo:'error', msg:'✗ PAQUETE PERDIDO — ent_SYN inhabilitada'}
    },
    {
      titulo:'Paso 3 — Timeout → CERRADO',
      desc:'Temporizador expira. δ_C(SYN-ENVIADO, timeout) → CERRADO. Canal se vacía.',
      cliente:'CERRADO', servidor:'ESCUCHA', tokens:{}, trans:null,
      formula:'δ_C(SYN-ENV,timeout)=CERRADO', viaje:['ec-synenv', 'pto-to-c1', 'pto-to-c2', 'pto-to-c3', 'ec-cerrado'],
      log:{tipo:'warn', msg:'TIMEOUT — Cliente regresa a CERRADO'}
    },
    {
      titulo:'Paso 4 — Retransmisión',
      desc:'Cliente retransmite SYN. p_perdido inactivo. Flujo normal se restablece.',
      cliente:'SYN-ENVIADO', servidor:'ESCUCHA', tokens:{'tk-bufc':true}, trans:null,
      formula:'M(p_buf_C)=1 (retx)', viaje:['ec-cerrado','pn-bufc'],
      log:{tipo:'info', msg:'RETX — Nuevo [SYN] generado'}
    }
  ],

  rst: [
    {
      titulo:'Estado Inicial — Servidor OFF',
      desc:'Servidor inactivo (modo OFF). Cualquier SYN recibido genera RST. No acepta conexiones.',
      cliente:'CERRADO', servidor:'ESCUCHA', tokens:{}, trans:null,
      formula:'A_S modo=OFF', viaje:null,
      log:{tipo:'warn', msg:'ESCENARIO: Servidor OFF (RST)'}
    },
    {
      titulo:'Paso 1 — Cliente envía SYN',
      desc:'Cliente intenta conectar. Token SYN viaja por el canal.',
      cliente:'SYN-ENVIADO', servidor:'ESCUCHA', tokens:{'tk-syn':true}, trans:'tr-env-syn',
      formula:'M(p_SYN)=1', viaje:['ec-cerrado','pn-bufc','tr-env-syn','pn-syn'],
      log:{tipo:'token', msg:'[SYN] enviado → en tránsito'}
    },
    {
      titulo:'Paso 2 — Servidor OFF emite RST',
      desc:'SYN llega a servidor OFF. δ_S → ESCUCHA (emite RST). Canal limpiado.',
      cliente:'SYN-ENVIADO', servidor:'ESCUCHA', tokens:{}, trans:null,
      formula:'A_S_OFF: ∀SYN→RST', viaje:['pn-syn','tr-ent-syn','pn-bufs','es-escucha'],
      log:{tipo:'error', msg:'[RST] emitido — conexión rechazada'}
    },
    {
      titulo:'Paso 3 — Cliente recibe RST → CERRADO',
      desc:'δ_C(SYN-ENVIADO, rcv_RST) → CERRADO. Conexión abortada. Sin deadlock.',
      cliente:'CERRADO', servidor:'ESCUCHA', tokens:{}, trans:null,
      formula:'δ_C(SYN-ENV,rcvRST)=CERRADO', viaje:['ec-synenv', 'pto-to-c1', 'pto-to-c2', 'pto-to-c3', 'ec-cerrado'],
      log:{tipo:'error', msg:'[RST] procesado → Cliente → CERRADO'}
    }
  ],

  simultaneous: [
    {
      titulo:'Estado Inicial — Apertura Simultánea',
      desc:'Ambos nodos inician conexión al mismo tiempo. S envía un SYN (activo) en vez de esperar en ESCUCHA.',
      cliente:'CERRADO', servidor:'CERRADO', tokens:{}, trans:null,
      formula:'Active Open en C y S', viaje:null,
      log:{tipo:'warn', msg:'ESCENARIO: Apertura Simultánea'}
    },
    {
      titulo:'Paso 1 — Envío Simultáneo de SYN',
      desc:'Ambos envían SYN. Los tokens viajan en sentidos opuestos cruzando la red.',
      cliente:'SYN-ENVIADO', servidor:'SYN-RECIBIDO', tokens:{'tk-syn':true,'tk-synack':true}, trans:null,
      formula:'M(p_SYN)=1 ∧ M(p_SYNACK)=1', 
      viaje:[
        ['ec-cerrado','pn-bufc','tr-env-syn','pn-syn'], 
        ['es-synrec','tr-env-sack','pn-synack']
      ],
      log:{tipo:'token', msg:'SYN cruzados — tokens concurrentes'}
    },
    {
      titulo:'Paso 2 — Recepción Mutua de SYN',
      desc:'Cada extremo recibe el SYN del otro nodo estando en estado de sincronización.',
      cliente:'SYN-ENVIADO', servidor:'SYN-RECIBIDO', tokens:{}, trans:null,
      formula:'δ(SYN-ENV,rcvSYN)=SYN-REC', 
      viaje:[
        ['pn-syn','tr-ent-syn','pn-bufs','es-escucha','es-synrec'], 
        ['pn-synack','tr-ent-sack','pn-bufc2','ec-synenv']
      ],
      log:{tipo:'info', msg:'Ambos reciben SYN del otro'}
    },
    {
      titulo:'Paso 3 — Envío de SYN-ACKs',
      desc:'Como respuesta al SYN recibido, ambos extremos generan y envían un paquete de confirmación (ACK).',
      cliente:'ESTABLECIDO', servidor:'SYN-RECIBIDO', tokens:{'tk-synack':true, 'tk-ack':true}, trans:null,
      formula:'Generación simétrica de ACKs', 
      viaje:[
        ['ec-synenv', 'ec-estab', 'tr-env-ack', 'pn-ack'], 
        ['es-synrec', 'tr-env-sack', 'pn-synack'] 
      ],
      log:{tipo:'token', msg:'ACKs cruzados en el canal'}
    },
    {
      titulo:'Paso 4 — ESTABLECIDO (ambos lados)',
      desc:'Cada nodo recibe el ACK del otro. Ambos alcanzan el estado ESTABLECIDO. ¡Simulación exitosa!',
      cliente:'ESTABLECIDO', servidor:'ESTABLECIDO', tokens:{}, trans:null,
      formula:'∃σ: A_C=A_S=ESTAB ✓', 
      viaje:[
        ['pn-ack', 'tr-ent-ack', 'es-estab'],
        ['pn-synack', 'tr-ent-sack', 'pn-bufc2', 'ec-synenv', 'ec-estab']
      ],
      log:{tipo:'ok', msg:'✓ APERTURA SIMULTÁNEA completada'}
    }
  ]
};

// ─── MOTOR DEL SIMULADOR ─────────────────────────────────────────
const sim = { escenario:'normal', paso:0, pasos:[], logN:0, animando:false };

const MAP_C = { 'CERRADO':'ec-cerrado','SYN-ENVIADO':'ec-synenv','SYN-RECIBIDO':'ec-synenv','ESTABLECIDO':'ec-estab','FIN-ESPERA':'ec-fin' };
const MAP_S = { 'ESCUCHA':'es-escucha','SYN-RECIBIDO':'es-synrec','CERRADO':null,'SYN-ENVIADO':'es-synrec','ESTABLECIDO':'es-estab','CERRANDO':'es-cerrando' };
const IDS_C = ['ec-cerrado','ec-synenv','ec-estab','ec-fin'];
const IDS_S = ['es-escucha','es-synrec','es-estab','es-cerrando'];
const TODOS_TK = ['tk-bufc','tk-syn','tk-bufs','tk-synack','tk-bufc2','tk-ack','tk-perdido'];
const TODAS_TR = ['tr-env-syn','tr-ent-syn','tr-env-sack','tr-ent-sack','tr-env-ack','tr-ent-ack'];

function iniciarSimulador() {
  sim.velocidad = 1;
  sim.autoPlay = false;
  sim.autoPlayTimeout = null;

  document.querySelectorAll('.btn-escenario').forEach(b => {
    b.addEventListener('click', () => {
      if (sim.animando) return;
      document.querySelectorAll('.btn-escenario').forEach(x => x.classList.remove('activo'));
      b.classList.add('activo');
      sim.escenario = b.dataset.esc;
      
      const panelAuto = document.getElementById('panel-autoplay');
      if (sim.escenario === 'masiva') {
        panelAuto.style.display = 'block';
        document.getElementById('btn-auto-play').style.display = 'block';
        document.getElementById('btn-auto-pause').style.display = 'none';
        sim.autoPlay = false;
        clearTimeout(sim.autoPlayTimeout);
        // Generar default inicial
        generarEscenarioMasivo(parseInt(document.getElementById('input-n-paquetes').value) || 5);
        sim.pasos = ESCENARIOS['masiva'];
      } else {
        sim.pasos = ESCENARIOS[sim.escenario];
        panelAuto.style.display = 'none';
        sim.autoPlay = false;
        clearTimeout(sim.autoPlayTimeout);
      }
      
      aplicarPaso(0, true);
      log('info', `Escenario: ${b.textContent.trim()}`);
    });
  });

  // Eventos Auto-Play
  document.getElementById('btn-auto-play').addEventListener('click', () => {
    if (sim.escenario === 'masiva') {
      const n = parseInt(document.getElementById('input-n-paquetes').value) || 5;
      const dir = document.getElementById('select-direccion').value;
      generarEscenarioMasivo(n, dir);
      sim.pasos = ESCENARIOS['masiva'];
    }
    
    if (sim.paso >= sim.pasos.length - 1) aplicarPaso(0, true);
    sim.autoPlay = true;
    document.getElementById('btn-auto-play').style.display = 'none';
    document.getElementById('btn-auto-pause').style.display = 'block';
    log('info', `▶ Auto-Play activado (${sim.escenario === 'masiva' ? 'N=' + document.getElementById('input-n-paquetes').value : ''})`);
    if (!sim.animando) procesarAutoPlay();
  });

  document.getElementById('btn-auto-pause').addEventListener('click', () => {
    sim.autoPlay = false;
    clearTimeout(sim.autoPlayTimeout);
    document.getElementById('btn-auto-play').style.display = 'block';
    document.getElementById('btn-auto-pause').style.display = 'none';
    log('warn', '⏸ Auto-Play en pausa');
  });

  document.getElementById('slider-velocidad').addEventListener('input', (e) => {
    sim.velocidad = parseInt(e.target.value);
    document.getElementById('disp-velocidad').textContent = sim.velocidad + 'x';
  });

  document.getElementById('btn-next').addEventListener('click', () => {
    if (!sim.animando && sim.paso < sim.pasos.length - 1) aplicarPaso(sim.paso + 1, false);
  });
  document.getElementById('btn-prev').addEventListener('click', () => {
    if (!sim.animando && sim.paso > 0) aplicarPaso(sim.paso - 1, true);
  });
  document.getElementById('btn-reset').addEventListener('click', () => {
    if (!sim.animando) { 
      sim.autoPlay = false;
      clearTimeout(sim.autoPlayTimeout);
      document.getElementById('btn-auto-play').style.display = 'block';
      document.getElementById('btn-auto-pause').style.display = 'none';
      aplicarPaso(0, true); 
      log('info','Reset → M₀ aplicado'); 
    }
  });

  sim.pasos = ESCENARIOS.normal;
  aplicarPaso(0, true);
  initTooltips();
}

async function aplicarPaso(idx, instantaneo) {
  const p = sim.pasos[idx];
  if (!p) return;

  sim.animando = true;
  sim.paso = idx;

  // 1. Limpiar tokens y transiciones ANTES de animar
  //    Así no hay token "original" visible mientras viaja el clon
  limpiarTokens();
  limpiarTrans();

  // 2. Animar token viajero (canal ya limpio)
  if (!instantaneo && p.viaje && p.viaje.length >= 2) {
    let color = '#f78166'; // default naranja
    if (p.color) color = p.color;
    else if (p.tokens && Object.keys(p.tokens).includes('tk-perdido')) color = '#f85149';
    
    await animarToken(p.viaje, color, 420);
  }

  // 3. Actualizar FSMs (al mismo tiempo que el token llega)
  actualizarFSM(p.cliente, IDS_C, MAP_C, '#388bfd');
  actualizarFSM(p.servidor, IDS_S, MAP_S, '#3fb950');

  // 4. Mostrar tokens estáticos finales (destino del viaje)
  Object.entries(p.tokens || {}).forEach(([id, v]) => { if(v) mostrarToken(id); });

  // 5. Parpadeo de transición activa
  if (p.trans) { dispararTrans(p.trans); }

  // Panel
  const total = sim.pasos.length - 1;
  document.getElementById('paso-num').textContent    = `Paso ${idx} / ${total}`;
  document.getElementById('paso-titulo').textContent = p.titulo;
  document.getElementById('paso-desc').textContent   = p.desc;
  document.getElementById('paso-formula').textContent = p.formula;
  document.getElementById('disp-cliente').textContent  = p.cliente;
  document.getElementById('disp-servidor').textContent = p.servidor;

  const tkActivos = Object.entries(p.tokens||{}).filter(([,v])=>v).map(([k])=>k.replace('tk-','p_'));
  document.getElementById('tokens-display').innerHTML = tkActivos.length
    ? tkActivos.map(t=>`<span style="color:var(--c-token)">● ${t}</span>`).join('  ')
    : '<span style="color:var(--c-texto-dim)">Todas las plazas vacías</span>';

  document.getElementById('barra-prog').style.width = `${(idx/total)*100}%`;
  document.getElementById('btn-prev').disabled = idx === 0;
  document.getElementById('btn-next').disabled = idx === total;

  if (p.log) log(p.log.tipo, p.log.msg);
  sim.animando = false;

  // Si Auto-Play está activo y no hemos llegado al final, agendar el siguiente paso
  if (sim.autoPlay && sim.paso < sim.pasos.length - 1) {
    const espera = 600 / (sim.velocidad || 1);
    sim.autoPlayTimeout = setTimeout(procesarAutoPlay, espera);
  } else if (sim.autoPlay && sim.paso >= sim.pasos.length - 1) {
    // Apagar auto-play al terminar
    sim.autoPlay = false;
    document.getElementById('btn-auto-play').style.display = 'block';
    document.getElementById('btn-auto-pause').style.display = 'none';
    log('warn', '⏹ Auto-Play finalizado');
  }
}

function procesarAutoPlay() {
  if (!sim.autoPlay) return;
  if (sim.paso < sim.pasos.length - 1) {
    aplicarPaso(sim.paso + 1, false);
  }
}

function generarEscenarioMasivo(n, dir = 'cs') {
  // Copiar los pasos del Handshake Normal (Pasos 0 a 7)
  const base = JSON.parse(JSON.stringify(ESCENARIOS.normal));
  
  const esCS = dir === 'cs';
  const color = esCS ? '#79c0ff' : '#bc8cff'; // Cian para C->S, Morado para S->C
  const tituloDir = esCS ? 'Cliente ➔ Servidor' : 'Servidor ➔ Cliente';
  
  // Agregar N pasos de transmisión
  for (let i = 1; i <= n; i++) {
    const paso = {
      titulo: `Datos (${tituloDir}) — ${i}/${n}`,
      desc: esCS 
        ? `Cliente envía datos al Servidor (Carril inferior).`
        : `Servidor envía datos al Cliente (Carril central).`,
      cliente: 'ESTABLECIDO', servidor: 'ESTABLECIDO', 
      tokens: {},
      color: color,
      formula: `Tx_${dir}(${i})`,
      log: { tipo: 'token', msg: `[DATA] ${i}/${n} transmitido (${esCS?'Cian':'Morado'})` }
    };

    if (esCS) {
      paso.trans = 'tr-ent-ack';
      paso.viaje = ['ec-estab', 'tr-env-ack', 'pn-ack', 'tr-ent-ack', 'es-estab'];
    } else {
      paso.trans = 'tr-ent-sack';
      paso.viaje = ['es-estab', 'es-synrec', 'tr-env-sack', 'pn-synack', 'tr-ent-sack', 'pn-bufc2', 'ec-synenv', 'ec-estab'];
    }
    
    base.push(paso);
  }
  
  base.push({
    titulo: 'Transmisión Completada',
    desc: `Se han procesado los ${n} paquetes en sentido ${tituloDir}.`,
    cliente: 'ESTABLECIDO', servidor: 'ESTABLECIDO', 
    tokens: {}, trans: null,
    formula: 'Fin Tx',
    viaje: null,
    log: { tipo: 'ok', msg: `✓ FLUJO ${dir.toUpperCase()} COMPLETADO` }
  });
  
  ESCENARIOS['masiva'] = base;
}

// ─── FUNCIONES SVG ───────────────────────────────────────────────
function actualizarFSM(estadoActivo, ids, mapa, color) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const activo = mapa[estadoActivo] === id;
    el.style.transition = 'fill .35s, filter .35s';
    el.style.fill   = activo ? color   : '#060b14';
    el.style.filter = activo ? `drop-shadow(0 0 12px ${color})` : 'none';
  });
}

function mostrarToken(id) {
  const el = document.getElementById(id);
  if (!el) return;
  // Solo opacidad — sin scale/transform para evitar el bug de SVG transform-origin
  el.style.transition = 'opacity 0.2s ease';
  el.style.opacity = '1';
}

function limpiarTokens() {
  TODOS_TK.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      // Reset transición para evitar que el fade-out interfiera con el viajero
      el.style.transition = 'none';
      el.style.opacity = '0';
    }
  });
}

function dispararTrans(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.animation = 'none'; void el.offsetWidth;
  el.style.filter = 'drop-shadow(0 0 10px #d29922) brightness(2.2)';
  el.style.animation = 'trans-fire .7s cubic-bezier(.4,0,.2,1) both';
  setTimeout(() => { if(el) el.style.filter='none'; }, 750);
}

function limpiarTrans() {
  TODAS_TR.forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.style.filter='none'; el.style.animation='none'; }
  });
}

// ─── CONSOLA ─────────────────────────────────────────────────────
function log(tipo, msg) {
  const c = document.getElementById('consola-body');
  if (!c) return;
  sim.logN++;
  const n = String(sim.logN).padStart(2,'0');
  const span = document.createElement('span');
  span.className = 'log-line';
  span.innerHTML = `<span class="log-time">[${n}]</span><span class="log-${tipo}"> ${msg}</span>`;
  c.appendChild(span);
  c.scrollTop = c.scrollHeight;
  while(c.children.length > 60) c.removeChild(c.firstChild);
}

// ─── INIT ────────────────────────────────────────────────────────
iniciarApp();
