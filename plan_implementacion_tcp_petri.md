# Plan de Implementacion: Verificacion Formal del TCP Three-Way Handshake
## Autómatas Finitos y Redes de Petri — Aplicacion Web Interactiva

**Asignatura:** Teoria de la Computacion  
**Aplicacion seleccionada:** Protocolos de Comunicacion — TCP Three-Way Handshake  
**Entregable:** Pagina web estatica, interactiva y desplegable en clase  
**Fecha:** Mayo 2026

---

## 1. Vision General del Proyecto

El objetivo de esta implementacion es construir una **pagina web de una sola pagina (SPA estatica)** que sirva como herramienta de presentacion y demostracion del modelo formal combinado de Automatas Finitos (FSM) + Redes de Petri aplicado al protocolo TCP Three-Way Handshake.

La pagina debe cumplir tres funciones simultaneas:

1. **Presentar** las definiciones formales del modelo (los dos FSMs y la Red de Petri del canal).
2. **Visualizar** el diagrama combinado de manera clara y academica.
3. **Simular** el handshake paso a paso, mostrando como los tokens fluyen en la Red de Petri y como transicionan los automatas.

---

## 2. Especificacion Tecnica

### 2.1 Restricciones de Tecnologia

| Criterio | Decision | Justificacion |
|---|---|---|
| Lenguajes | HTML5, CSS3, Vanilla JavaScript (ES6+) | Sin dependencias externas pesadas. |
| Dependencias externas | Ninguna | El proyecto debe funcionar sin conexion a internet durante la presentacion. |
| Numero de archivos | **Arquitectura Modular de Sub-archivos** (`index.html`, `components/*.html`, `styles.css`, `main.js`) | Separacion extrema de responsabilidades y prevencion de limites de tokens. El HTML se divide en sub-archivos que se inyectan dinamicamente. Un unico CSS y JS centralizan el diseno premium y logica. |
| Compatibilidad | Chrome 90+, Firefox 88+, Edge 90+ | Navegadores modernos con soporte completo de CSS Grid, SVG, ES6 y fetch. |
| Despliegue | GitHub Pages o Netlify (gratuito) | URL publica accesible desde cualquier dispositivo en clase. |

### 2.2 Estructura del Proyecto (Modular)

Para no exceder los límites de tokens durante la generación y mantener un nivel de calidad de código de nivel de producción, el HTML se fragmentará en sub-archivos. El proyecto se estructura de la siguiente manera:

```
Proyecto Automatas Segundo Corte/
├── index.html                 — Esqueleto principal que carga los componentes
├── styles.css                 — Todo el CSS: variables premium, glassmorphism, animaciones
├── main.js                    — Archivo JS único: carga de HTML, simulador y controladores
└── components/                — Sub-archivos HTML
    ├── header.html            — Encabezado dinámico
    ├── definitions.html       — Definiciones formales (Cards)
    ├── diagram.html           — SVG interactivo (TCP Petri)
    ├── simulator-ui.html      — UI del panel de simulación
    └── properties.html        — Tabla de propiedades verificables
```

**`index.html`** actúa como orquestador vacío que importa los estilos y el script principal:
```html
<head>
    ...
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="app"></div> <!-- Contenedor donde main.js inyectará los componentes -->
    <script type="module" src="main.js"></script>
</body>
```

**Ventajas de esta arquitectura:**
- **Previene límites de tokens:** Evita cortes de código al aislar la creación de cada parte en llamadas separadas.
- **Diseño Wow:** Permite aplicar un nivel de detalle extremo y animaciones premium en cada componente.
- **Centralizado:** Mantiene un único punto de entrada para estilos (`styles.css`) y lógica (`main.js`).

---

## 3. Diseno Visual Premium y Dinamico (Efecto WOW)

El objetivo es demostrar **la verdadera potencia de la herramienta**, generando una aplicación web de vanguardia, con una estética rica, vibrante y profesional que impresione a primera vista. Se evitarán los diseños básicos (MVP), apostando por una experiencia interactiva fluida.

### 3.1 Estética, Glassmorphism y Paleta de Colores

Se utilizará una paleta de colores curada y armoniosa, con fondos dinámicos y superficies que empleen **Glassmorphism** (fondos translúcidos con desenfoque, bordes sutiles iluminados). 

Definir todas las variables de color al inicio del bloque `<style>` usando `:root`. Esto garantiza consistencia y facilita cambios globales.

```css
:root {
    /* Fondo y superficies premium */
    --color-fondo:         #0d1117;   /* Fondo principal: negro azulado oscuro */
    --color-superficie:    #161b22;   /* Cards y paneles: gris muy oscuro */
    --color-borde:         #30363d;   /* Bordes sutiles */

    /* Texto */
    --color-texto-primario:   #e6edf3;  /* Texto principal: blanco suave */
    --color-texto-secundario: #8b949e;  /* Texto auxiliar: gris medio */
    --color-texto-codigo:     #79c0ff;  /* Codigo y formulas: azul claro */

    /* Accentos semanticos */
    --color-cliente:    #388bfd;   /* Azul — elementos del FSM Cliente */
    --color-servidor:   #3fb950;   /* Verde — elementos del FSM Servidor */
    --color-canal:      #d29922;   /* Dorado — elementos de la Red de Petri */
    --color-token:      #f78166;   /* Rojo coral — tokens activos */
    --color-acento:     #bc8cff;   /* Purpura — elementos de integracion */
    --color-error:      #f85149;   /* Rojo — estados de error/timeout */

    /* Tipografia */
    --fuente-principal: 'IBM Plex Sans', sans-serif;
    --fuente-codigo:    'IBM Plex Mono', monospace;

    /* Dimensiones y Efectos Premium */
    --radio-borde:       12px;
    --espaciado-md:      1.5rem;
    --espaciado-lg:      4rem;
    --sombra-premium:    0 8px 32px 0 rgba(0, 0, 0, 0.37);
    --efecto-glass:      blur(12px);
    --transicion-suave:  all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

### 3.1.1 Micro-animaciones e Interactividad
Cada interacción del usuario debe sentirse viva, elevando la calidad a un estándar de alto nivel.
- **Hover States:** Botones, cards y enlaces deben tener efectos de elevación, cambios de borde iluminado y brillos.
- **Transiciones:** El flujo de tokens en el SVG y los cambios de estado deben ocurrir con animaciones suaves.
- **Feedback Visual:** Uso de resplandores (glows) y sombras dinámicas al activar componentes clave.
```

### 3.2 Tipografia

Importar desde Google Fonts al inicio del `<head>`. Se elige IBM Plex por su caracter tecnico y su excelente legibilidad en fondos oscuros.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
```

### 3.3 Layout General

La pagina usa un layout de columna unica con `max-width: 1200px` centrado. Cada seccion es un bloque `<section>` con `padding` generoso. El orden visual de arriba hacia abajo sigue la logica academica del trabajo: primero las definiciones, luego el diagrama, luego la simulacion.

```css
body {
    font-family: var(--fuente-principal);
    background-color: var(--color-fondo);
    color: var(--color-texto-primario);
    line-height: 1.7;
    margin: 0;
}

.contenedor {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--espaciado-md);
}

section {
    padding: var(--espaciado-lg) 0;
    border-bottom: 1px solid var(--color-borde);
}
```

---

## 4. Seccion 1 — Encabezado

### Que debe mostrar

El encabezado fija el contexto academico: titulo del trabajo, asignatura, y una descripcion de una linea.

### Estructura HTML (Archivo: `components/header.html`)

```html
<header class="hero-premium glass-panel">
    <div class="contenedor">
        <div class="encabezado-etiqueta">Teoria de la Computacion — Mayo 2026</div>
        <h1 class="encabezado-titulo">
            Autómatas y Redes de Petri
        </h1>
        <p class="encabezado-subtitulo">
            Verificacion Formal del TCP Three-Way Handshake
        </p>
        <div class="encabezado-chips">
            <span class="chip chip-cliente">FSM Cliente</span>
            <span class="chip chip-canal">Red de Petri</span>
            <span class="chip chip-servidor">FSM Servidor</span>
        </div>
    </div>
</header>
```

### CSS del encabezado

```css
header {
    padding: 5rem 0 4rem;
    border-bottom: 1px solid var(--color-borde);
    position: relative;
    overflow: hidden;
}

/* Gradiente decorativo de fondo */
header::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -20%;
    width: 140%;
    height: 200%;
    background: radial-gradient(
        ellipse at 30% 50%,
        rgba(56, 139, 253, 0.08) 0%,
        transparent 60%
    ),
    radial-gradient(
        ellipse at 70% 50%,
        rgba(63, 185, 80, 0.06) 0%,
        transparent 60%
    );
    pointer-events: none;
}

.encabezado-etiqueta {
    font-family: var(--fuente-codigo);
    font-size: 0.75rem;
    color: var(--color-texto-secundario);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 1.5rem;
}

.encabezado-titulo {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.1;
    margin: 0 0 1rem;
}

.encabezado-subtitulo {
    font-size: 1.2rem;
    color: var(--color-texto-secundario);
    font-weight: 300;
    margin: 0 0 2rem;
}

/* Chips de identificacion de modelos */
.encabezado-chips {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.chip {
    font-family: var(--fuente-codigo);
    font-size: 0.8rem;
    padding: 0.3rem 0.9rem;
    border-radius: 20px;
    border: 1px solid;
}

.chip-cliente  { color: var(--color-cliente);  border-color: rgba(56,139,253,0.4);  background: rgba(56,139,253,0.08);  }
.chip-canal    { color: var(--color-canal);    border-color: rgba(210,153,34,0.4);  background: rgba(210,153,34,0.08);  }
.chip-servidor { color: var(--color-servidor); border-color: rgba(63,185,80,0.4);   background: rgba(63,185,80,0.08);   }
```

---

## 5. Seccion 2 — Definiciones Formales

### Que debe mostrar

Dos cards lado a lado (en pantalla ancha) o apiladas (en movil): una para el FSM Cliente y otra para el FSM Servidor. Cada card muestra la definicion formal de la quintupla y la tabla de transiciones.

### Estructura HTML (Archivo: `components/definitions.html`)

```html
<section id="definiciones" class="seccion-premium">
    <div class="contenedor">
        <h2 class="seccion-titulo">Definiciones Formales</h2>

        <div class="grid-dos-columnas">

            <!-- Card FSM Cliente -->
            <div class="card card-cliente">
                <div class="card-encabezado">
                    <span class="card-etiqueta">Automata Finito Determinista</span>
                    <h3 class="card-titulo">FSM Cliente</h3>
                </div>
                <div class="formula-bloque">
                    <code>A_C = (Q_C, Sigma, delta_C, CERRADO, {ESTABLECIDO})</code>
                </div>
                <table class="tabla-transiciones">
                    <thead>
                        <tr>
                            <th>Estado Actual</th>
                            <th>Evento</th>
                            <th>Estado Siguiente</th>
                            <th>Accion</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>CERRADO</td>
                            <td>iniciar_conexion</td>
                            <td>SYN-ENVIADO</td>
                            <td>Enviar SYN</td>
                        </tr>
                        <tr>
                            <td>SYN-ENVIADO</td>
                            <td>recibir_SYN-ACK</td>
                            <td>ESTABLECIDO</td>
                            <td>Enviar ACK</td>
                        </tr>
                        <tr>
                            <td>SYN-ENVIADO</td>
                            <td>timeout</td>
                            <td>CERRADO</td>
                            <td>Retransmitir o abortar</td>
                        </tr>
                        <tr>
                            <td>ESTABLECIDO</td>
                            <td>iniciar_cierre</td>
                            <td>FIN-ESPERA</td>
                            <td>Enviar FIN</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Card FSM Servidor (estructura identica, datos distintos) -->
            <div class="card card-servidor">
                <!-- ... mismo patron, con datos del servidor -->
            </div>

        </div>
    </div>
</section>
```

### CSS de las cards

```css
.grid-dos-columnas {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
    gap: var(--espaciado-md);
    margin-top: 2rem;
}

.card {
    background: var(--color-superficie);
    border: 1px solid var(--color-borde);
    border-radius: var(--radio-borde);
    padding: 1.75rem;
    border-top: 3px solid;  /* El color lo define la variante */
}

.card-cliente  { border-top-color: var(--color-cliente);  }
.card-servidor { border-top-color: var(--color-servidor); }
.card-canal    { border-top-color: var(--color-canal);    }

.card-etiqueta {
    font-family: var(--fuente-codigo);
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-texto-secundario);
}

.card-titulo {
    font-size: 1.3rem;
    font-weight: 600;
    margin: 0.4rem 0 1.2rem;
}

.formula-bloque {
    background: var(--color-fondo);
    border: 1px solid var(--color-borde);
    border-left: 3px solid var(--color-acento);
    padding: 0.9rem 1.2rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
}

.formula-bloque code {
    font-family: var(--fuente-codigo);
    font-size: 0.85rem;
    color: var(--color-texto-codigo);
    word-break: break-all;
}

/* Tabla de transiciones */
.tabla-transiciones {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
}

.tabla-transiciones th {
    text-align: left;
    padding: 0.6rem 0.8rem;
    background: var(--color-fondo);
    color: var(--color-texto-secundario);
    font-weight: 500;
    font-family: var(--fuente-codigo);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid var(--color-borde);
}

.tabla-transiciones td {
    padding: 0.55rem 0.8rem;
    border-bottom: 1px solid rgba(48, 54, 61, 0.6);
    vertical-align: middle;
}

.tabla-transiciones tr:last-child td {
    border-bottom: none;
}

.tabla-transiciones tr:hover td {
    background: rgba(255,255,255,0.02);
}
```

---

## 6. Seccion 3 — Diagrama Combinado SVG

### Principio de implementacion

El diagrama es un elemento `<svg>` incrustado directamente en el HTML. No se usa ninguna libreria externa. Todos los elementos son formas SVG nativas: `<circle>`, `<rect>`, `<line>`, `<path>`, `<text>`, `<marker>`.

### Por que SVG incrustado y no una imagen

- El SVG incrustado permite que JavaScript modifique los elementos del diagrama en tiempo real durante la simulacion (cambio de color de estados, aparicion de tokens).
- No requiere archivos externos.
- Es infinitamente escalable: se ve bien en cualquier pantalla.

### Estructura logica del diagrama

El SVG se divide en tres zonas horizontales con `viewBox="0 0 900 500"`:

```
viewBox: 0 0 900 500

Zona izquierda  (x: 0   - 280):  FSM Cliente
Zona central    (x: 280 - 620):  Red de Petri del Canal
Zona derecha    (x: 620 - 900):  FSM Servidor
```

### Definicion del marcador de flecha (Archivo: `components/diagram.html`)

Antes de dibujar cualquier elemento, definir los marcadores de flechas en `<defs>`:

```html
<svg id="diagrama-principal" class="diagrama-premium-svg" viewBox="0 0 900 520" xmlns="http://www.w3.org/2000/svg">
<defs>
    <!-- Flecha para transiciones de FSM (cliente) -->
    <marker id="flecha-cliente" markerWidth="8" markerHeight="8"
            refX="6" refY="3" orient="auto">
        <path d="M0,0 L0,6 L8,3 z" fill="#388bfd"/>
    </marker>

    <!-- Flecha para transiciones de FSM (servidor) -->
    <marker id="flecha-servidor" markerWidth="8" markerHeight="8"
            refX="6" refY="3" orient="auto">
        <path d="M0,0 L0,6 L8,3 z" fill="#3fb950"/>
    </marker>

    <!-- Flecha para arcos de la Red de Petri -->
    <marker id="flecha-canal" markerWidth="8" markerHeight="8"
            refX="6" refY="3" orient="auto">
        <path d="M0,0 L0,6 L8,3 z" fill="#d29922"/>
    </marker>

    <!-- Flecha punteada para conexiones FSM <-> PN -->
    <marker id="flecha-integracion" markerWidth="8" markerHeight="8"
            refX="6" refY="3" orient="auto">
        <path d="M0,0 L0,6 L8,3 z" fill="#bc8cff"/>
    </marker>
</defs>
```

### Zona 1 — FSM Cliente (lado izquierdo del SVG)

Los estados del autómata son circulos `<circle>`. El estado inicial tiene una flecha sin origen. El estado de aceptacion (ESTABLECIDO) tiene un doble borde (dos circulos concentricos).

```html
<!-- Etiqueta de zona -->
<text x="140" y="25" text-anchor="middle"
      font-family="IBM Plex Mono" font-size="11"
      fill="#8b949e" letter-spacing="1">FSM CLIENTE (A_C)</text>

<!-- Estado: CERRADO (estado inicial) -->
<!-- Flecha de inicio (sin origen) -->
<line x1="55" y1="90" x2="80" y2="90"
      stroke="#388bfd" stroke-width="1.5"
      marker-end="url(#flecha-cliente)"/>
<circle id="estado-cerrado-c" cx="110" cy="90" r="24"
        fill="#161b22" stroke="#388bfd" stroke-width="1.5"/>
<text x="110" y="87" text-anchor="middle"
      font-family="IBM Plex Mono" font-size="8" fill="#e6edf3">CERRADO</text>

<!-- Estado: SYN-ENVIADO -->
<circle id="estado-syn-enviado" cx="110" cy="200" r="24"
        fill="#161b22" stroke="#388bfd" stroke-width="1.5"/>
<text x="110" y="197" text-anchor="middle"
      font-family="IBM Plex Mono" font-size="7.5" fill="#e6edf3">SYN-</text>
<text x="110" y="208" text-anchor="middle"
      font-family="IBM Plex Mono" font-size="7.5" fill="#e6edf3">ENVIADO</text>

<!-- Estado: ESTABLECIDO (estado de aceptacion — doble circulo) -->
<circle id="estado-establecido-c" cx="110" cy="320" r="26"
        fill="#161b22" stroke="#388bfd" stroke-width="1.5"/>
<circle cx="110" cy="320" r="21"
        fill="none" stroke="#388bfd" stroke-width="1"/>
<text x="110" y="317" text-anchor="middle"
      font-family="IBM Plex Mono" font-size="7" fill="#e6edf3">ESTABLE-</text>
<text x="110" y="328" text-anchor="middle"
      font-family="IBM Plex Mono" font-size="7" fill="#e6edf3">CIDO</text>

<!-- Estado: FIN-ESPERA -->
<circle id="estado-fin-espera" cx="110" cy="430" r="24"
        fill="#161b22" stroke="#388bfd" stroke-width="1.5"/>
<text x="110" y="427" text-anchor="middle"
      font-family="IBM Plex Mono" font-size="7.5" fill="#e6edf3">FIN-</text>
<text x="110" y="438" text-anchor="middle"
      font-family="IBM Plex Mono" font-size="7.5" fill="#e6edf3">ESPERA</text>

<!-- Transiciones entre estados del cliente -->
<!-- CERRADO → SYN-ENVIADO -->
<line x1="110" y1="114" x2="110" y2="176"
      stroke="#388bfd" stroke-width="1.2"
      marker-end="url(#flecha-cliente)"/>
<rect x="113" y="137" width="75" height="16" fill="#0d1117" rx="3"/>
<text x="150" y="149" text-anchor="middle"
      font-family="IBM Plex Mono" font-size="7.5" fill="#388bfd">iniciar_conexion</text>

<!-- SYN-ENVIADO → ESTABLECIDO -->
<line x1="110" y1="224" x2="110" y2="292"
      stroke="#388bfd" stroke-width="1.2"
      marker-end="url(#flecha-cliente)"/>
<rect x="113" y="250" width="78" height="16" fill="#0d1117" rx="3"/>
<text x="152" y="262" text-anchor="middle"
      font-family="IBM Plex Mono" font-size="7.5" fill="#388bfd">recibir_SYN-ACK</text>

<!-- SYN-ENVIADO → CERRADO (timeout, flecha curva a la izquierda) -->
<path d="M88,200 Q50,200 50,145 Q50,90 86,90"
      fill="none" stroke="#f85149" stroke-width="1.2" stroke-dasharray="4,2"
      marker-end="url(#flecha-cliente)"/>
<text x="30" y="148" text-anchor="middle"
      font-family="IBM Plex Mono" font-size="7" fill="#f85149">timeout</text>
```

El mismo patron se repite para la Zona 3 (FSM Servidor) en el lado derecho del SVG, usando `stroke="#3fb950"` y los estados ESCUCHA, SYN-RECIBIDO, ESTABLECIDO, CERRANDO.

### Zona 2 — Red de Petri del Canal (centro del SVG)

Las plazas son circulos con `stroke="#d29922"`. Las transiciones son rectangulos delgados y alargados horizontalmente, tambien con `stroke="#d29922"`. Los tokens son circulos solidos pequenos `r="6"` en color `var(--color-token)`.

```html
<!-- Etiqueta de zona -->
<text x="450" y="25" text-anchor="middle"
      font-family="IBM Plex Mono" font-size="11"
      fill="#8b949e" letter-spacing="1">CANAL DE COMUNICACION (N_canal)</text>

<!-- Plaza: p_buffer_C -->
<circle id="plaza-buffer-c" cx="310" cy="100" r="18"
        fill="#161b22" stroke="#d29922" stroke-width="1.5"/>
<text x="310" y="127" text-anchor="middle"
      font-family="IBM Plex Mono" font-size="7" fill="#d29922">p_buffer_C</text>

<!-- Token inicial (aparece/desaparece en simulacion) -->
<circle id="token-buffer-c" cx="310" cy="100" r="6"
        fill="#f78166" opacity="0"/>

<!-- Transicion: enviar_SYN -->
<!-- Las transiciones son rectangulos delgados (30px de alto, 10px de ancho) -->
<rect id="trans-enviar-syn" x="421" y="88" width="38" height="14"
      fill="#d29922" rx="2" opacity="0.9"/>
<text x="440" y="115" text-anchor="middle"
      font-family="IBM Plex Mono" font-size="6.5" fill="#d29922">enviar_SYN</text>

<!-- Plaza: p_SYN -->
<circle id="plaza-syn" cx="520" cy="100" r="18"
        fill="#161b22" stroke="#d29922" stroke-width="1.5"/>
<text x="520" y="127" text-anchor="middle"
      font-family="IBM Plex Mono" font-size="7" fill="#d29922">p_SYN</text>

<!-- Token (inicialmente invisible) -->
<circle id="token-syn" cx="520" cy="100" r="6"
        fill="#f78166" opacity="0"/>

<!-- Transicion: perder_paquete (rama alternativa en rojo) -->
<rect id="trans-perder" x="551" y="155" width="38" height="14"
      fill="#f85149" rx="2" opacity="0.7"/>
<text x="570" y="178" text-anchor="middle"
      font-family="IBM Plex Mono" font-size="6.5" fill="#f85149">perder_paquete</text>

<!-- Plaza: p_perdido -->
<circle id="plaza-perdida" cx="570" cy="210" r="18"
        fill="#161b22" stroke="#f85149" stroke-width="1.5" stroke-dasharray="4,2"/>
<text x="570" y="237" text-anchor="middle"
      font-family="IBM Plex Mono" font-size="7" fill="#f85149">p_perdido</text>

<!-- (continuar con p_SYNACK, p_ACK, p_buffer_S, y sus transiciones) -->
```

### Conexiones FSM <-> Red de Petri (flechas punteadas)

Estas flechas muestran exactamente como el FSM Cliente "coloca un token" en la Red de Petri al transicionar:

```html
<!-- Conexion: FSM Cliente CERRADO → p_buffer_C -->
<!-- Cuando el cliente transiciona a SYN-ENVIADO, coloca token en p_buffer_C -->
<line x1="134" y1="110" x2="292" y2="100"
      stroke="#bc8cff" stroke-width="1"
      stroke-dasharray="5,3"
      marker-end="url(#flecha-integracion)"/>
<text x="213" y="95" text-anchor="middle"
      font-family="IBM Plex Mono" font-size="6.5"
      fill="#bc8cff">coloca token</text>
```

### IDs de los elementos que JavaScript debe modificar

Para que la simulacion funcione, cada elemento del SVG que cambia de estado necesita un `id` unico. La lista completa:

| ID del Elemento | Tipo | Que cambia en la simulacion |
|---|---|---|
| `estado-cerrado-c` | circle | Relleno cambia a color activo cuando el cliente esta en ese estado |
| `estado-syn-enviado` | circle | Idem |
| `estado-establecido-c` | circle | Idem |
| `estado-fin-espera` | circle | Idem |
| `estado-escucha` | circle | Estado del servidor |
| `estado-syn-recibido` | circle | Estado del servidor |
| `estado-establecido-s` | circle | Estado del servidor |
| `estado-cerrando` | circle | Estado del servidor |
| `token-buffer-c` | circle | `opacity` cambia entre 0 (sin token) y 1 (con token) |
| `token-syn` | circle | Idem |
| `token-synack` | circle | Idem |
| `token-ack` | circle | Idem |
| `token-buffer-s` | circle | Idem |
| `trans-enviar-syn` | rect | Brillo/highlight cuando la transicion dispara |
| `trans-entregar-syn` | rect | Idem |
| `trans-enviar-synack` | rect | Idem |
| `trans-entregar-synack` | rect | Idem |
| `trans-enviar-ack` | rect | Idem |
| `trans-entregar-ack` | rect | Idem |

---

## 7. Seccion 4 — Simulador Interactivo

### Logica del simulador

El simulador es el elemento central de la presentacion en clase. Permite avanzar el handshake paso a paso, mostrando en cada paso:

- Que estado tiene cada FSM actualmente.
- Que tokens existen en cada plaza de la Red de Petri.
- Que transicion acaba de dispararse.
- Una descripcion textual del evento.

### Estructura de datos del simulador (JavaScript)

```javascript
// Estado global de la simulacion
const estadoSimulacion = {
    pasoActual: 0,
    estadoCliente: 'CERRADO',
    estadoServidor: 'ESCUCHA',
    tokens: {
        bufferC: 0,
        syn: 0,
        synack: 0,
        ack: 0,
        bufferS: 0,
        perdido: 0
    }
};

// Definicion de los pasos del handshake
// Cada paso describe la transicion que ocurre y el nuevo estado del sistema
const PASOS_HANDSHAKE = [
    {
        id: 0,
        titulo: 'Estado Inicial',
        descripcion: 'El cliente esta en CERRADO. El servidor escucha en el puerto. El canal esta vacio (M0 = 0 para todas las plazas).',
        estadoCliente: 'CERRADO',
        estadoServidor: 'ESCUCHA',
        tokens: { bufferC: 0, syn: 0, synack: 0, ack: 0, bufferS: 0, perdido: 0 },
        transicionActiva: null,
        formula: 'M₀(p) = 0 ∀p ∈ P_c'
    },
    {
        id: 1,
        titulo: 'Paso 1: Cliente inicia la conexion',
        descripcion: 'delta_C(CERRADO, iniciar_conexion) → SYN-ENVIADO. El FSM Cliente transiciona y coloca un token en p_buffer_C de la Red de Petri.',
        estadoCliente: 'SYN-ENVIADO',
        estadoServidor: 'ESCUCHA',
        tokens: { bufferC: 1, syn: 0, synack: 0, ack: 0, bufferS: 0, perdido: 0 },
        transicionActiva: 'ninguna-aun',
        formula: 'M(p_buffer_C) = 1'
    },
    {
        id: 2,
        titulo: 'Paso 2: Red de Petri — enviar_SYN dispara',
        descripcion: 'La transicion enviar_SYN esta habilitada porque M(p_buffer_C) ≥ 1. Al disparar: M(p_buffer_C) = 0, M(p_SYN) = 1. El segmento SYN esta en transito.',
        estadoCliente: 'SYN-ENVIADO',
        estadoServidor: 'ESCUCHA',
        tokens: { bufferC: 0, syn: 1, synack: 0, ack: 0, bufferS: 0, perdido: 0 },
        transicionActiva: 'trans-enviar-syn',
        formula: 'M\'(p) = M(p) − W(p,t) + W(t,p)'
    },
    {
        id: 3,
        titulo: 'Paso 3: Red de Petri — entregar_SYN dispara',
        descripcion: 'La transicion entregar_SYN esta habilitada porque M(p_SYN) ≥ 1 y M(p_perdido) = 0. Al disparar: M(p_SYN) = 0, M(p_buffer_S) = 1.',
        estadoCliente: 'SYN-ENVIADO',
        estadoServidor: 'ESCUCHA',
        tokens: { bufferC: 0, syn: 0, synack: 0, ack: 0, bufferS: 1, perdido: 0 },
        transicionActiva: 'trans-entregar-syn',
        formula: 'entregar_SYN: M(p_SYN) ≥ 1 ∧ M(p_perdido) = 0'
    },
    {
        id: 4,
        titulo: 'Paso 4: Servidor recibe SYN',
        descripcion: 'El token en p_buffer_S genera el evento recibir_SYN en el FSM Servidor. delta_S(ESCUCHA, recibir_SYN) → SYN-RECIBIDO. El servidor coloca token en p_buffer_SYNACK.',
        estadoCliente: 'SYN-ENVIADO',
        estadoServidor: 'SYN-RECIBIDO',
        tokens: { bufferC: 0, syn: 0, synack: 1, ack: 0, bufferS: 0, perdido: 0 },
        transicionActiva: null,
        formula: 'delta_S(ESCUCHA, recibir_SYN) = SYN-RECIBIDO'
    },
    {
        id: 5,
        titulo: 'Paso 5: Red de Petri — entregar_SYN-ACK dispara',
        descripcion: 'El token con SYN-ACK viaja por el canal. Al llegar: M(p_buffer_SYNACK) = 0, M(p_buffer_C) = 1. El cliente recibe la respuesta del servidor.',
        estadoCliente: 'SYN-ENVIADO',
        estadoServidor: 'SYN-RECIBIDO',
        tokens: { bufferC: 1, syn: 0, synack: 0, ack: 0, bufferS: 0, perdido: 0 },
        transicionActiva: 'trans-entregar-synack',
        formula: 'Concurrencia verdadera: P(SYN) ∩ P(SYN-ACK) = ∅'
    },
    {
        id: 6,
        titulo: 'Paso 6: Cliente recibe SYN-ACK — CONEXION ESTABLECIDA',
        descripcion: 'delta_C(SYN-ENVIADO, recibir_SYN-ACK) → ESTABLECIDO. El cliente envia ACK final y coloca token en p_buffer_ACK.',
        estadoCliente: 'ESTABLECIDO',
        estadoServidor: 'SYN-RECIBIDO',
        tokens: { bufferC: 0, syn: 0, synack: 0, ack: 1, bufferS: 0, perdido: 0 },
        transicionActiva: null,
        formula: 'delta_C(SYN-ENVIADO, recibir_SYN-ACK) = ESTABLECIDO'
    },
    {
        id: 7,
        titulo: 'Paso 7: Servidor recibe ACK — HANDSHAKE COMPLETO',
        descripcion: 'El ACK llega al servidor. delta_S(SYN-RECIBIDO, recibir_ACK) → ESTABLECIDO. Ambos FSMs estan en el estado ESTABLECIDO. La conexion TCP esta activa.',
        estadoCliente: 'ESTABLECIDO',
        estadoServidor: 'ESTABLECIDO',
        tokens: { bufferC: 0, syn: 0, synack: 0, ack: 0, bufferS: 0, perdido: 0 },
        transicionActiva: 'trans-entregar-ack',
        formula: '∃ secuencia de disparos: A_C = ESTABLECIDO ∧ A_S = ESTABLECIDO'
    }
];
```

### Funcion principal del simulador

Esta funcion se llama cada vez que el usuario presiona "Siguiente Paso". Recibe el indice del paso y actualiza el SVG y la interfaz:

```javascript
function aplicarPaso(indicePaso) {
    const paso = PASOS_HANDSHAKE[indicePaso];
    if (!paso) return;

    // 1. Actualizar estado del objeto global
    estadoSimulacion.pasoActual = indicePaso;
    estadoSimulacion.estadoCliente = paso.estadoCliente;
    estadoSimulacion.estadoServidor = paso.estadoServidor;
    estadoSimulacion.tokens = { ...paso.tokens };

    // 2. Actualizar el SVG — estados del FSM Cliente
    actualizarEstadosFSM(
        paso.estadoCliente,
        ['estado-cerrado-c', 'estado-syn-enviado', 'estado-establecido-c', 'estado-fin-espera'],
        {
            'CERRADO':       'estado-cerrado-c',
            'SYN-ENVIADO':   'estado-syn-enviado',
            'ESTABLECIDO':   'estado-establecido-c',
            'FIN-ESPERA':    'estado-fin-espera'
        },
        '#388bfd'  // color del cliente
    );

    // 3. Actualizar el SVG — estados del FSM Servidor
    actualizarEstadosFSM(
        paso.estadoServidor,
        ['estado-escucha', 'estado-syn-recibido', 'estado-establecido-s', 'estado-cerrando'],
        {
            'ESCUCHA':       'estado-escucha',
            'SYN-RECIBIDO':  'estado-syn-recibido',
            'ESTABLECIDO':   'estado-establecido-s',
            'CERRANDO':      'estado-cerrando'
        },
        '#3fb950'  // color del servidor
    );

    // 4. Actualizar tokens en la Red de Petri
    actualizarToken('token-buffer-c',  paso.tokens.bufferC  > 0);
    actualizarToken('token-syn',       paso.tokens.syn      > 0);
    actualizarToken('token-synack',    paso.tokens.synack   > 0);
    actualizarToken('token-ack',       paso.tokens.ack      > 0);
    actualizarToken('token-buffer-s',  paso.tokens.bufferS  > 0);

    // 5. Destacar la transicion activa
    limpiarTransicionesActivas();
    if (paso.transicionActiva) {
        destacarTransicion(paso.transicionActiva);
    }

    // 6. Actualizar el panel de informacion textual
    document.getElementById('paso-numero').textContent  = `Paso ${indicePaso} de ${PASOS_HANDSHAKE.length - 1}`;
    document.getElementById('paso-titulo').textContent  = paso.titulo;
    document.getElementById('paso-descripcion').textContent = paso.descripcion;
    document.getElementById('paso-formula').textContent = paso.formula;

    // 7. Actualizar botones (desactivar "Anterior" en paso 0, "Siguiente" en el ultimo)
    document.getElementById('btn-anterior').disabled = (indicePaso === 0);
    document.getElementById('btn-siguiente').disabled = (indicePaso === PASOS_HANDSHAKE.length - 1);

    // 8. Indicador de progreso
    const porcentaje = (indicePaso / (PASOS_HANDSHAKE.length - 1)) * 100;
    document.getElementById('barra-progreso').style.width = porcentaje + '%';
}
```

### Funciones auxiliares

```javascript
// Resalta el estado activo del FSM y desactiva los demas
function actualizarEstadosFSM(estadoActivo, todosLosIds, mapeoEstadoId, color) {
    todosLosIds.forEach(id => {
        const elemento = document.getElementById(id);
        if (!elemento) return;

        if (mapeoEstadoId[estadoActivo] === id) {
            // Estado activo: relleno con color del modelo
            elemento.style.fill = color;
            elemento.style.filter = `drop-shadow(0 0 8px ${color})`;
        } else {
            // Estado inactivo: relleno oscuro
            elemento.style.fill = '#161b22';
            elemento.style.filter = 'none';
        }
    });
}

// Muestra u oculta un token en una plaza
function actualizarToken(tokenId, visible) {
    const token = document.getElementById(tokenId);
    if (!token) return;

    if (visible) {
        token.style.opacity = '1';
        // Pequeña animacion de aparicion
        token.style.transform = 'scale(1.2)';
        setTimeout(() => { token.style.transform = 'scale(1)'; }, 150);
    } else {
        token.style.opacity = '0';
    }
}

// Destaca visualmente la transicion que esta disparando
function destacarTransicion(transId) {
    const trans = document.getElementById(transId);
    if (!trans) return;
    trans.style.filter = 'drop-shadow(0 0 6px #d29922) brightness(1.5)';
}

// Limpia todos los highlights de transiciones
function limpiarTransicionesActivas() {
    const transiciones = document.querySelectorAll('[id^="trans-"]');
    transiciones.forEach(t => {
        t.style.filter = 'none';
        t.style.brightness = '1';
    });
}

// Controladores de los botones
document.getElementById('btn-siguiente').addEventListener('click', () => {
    if (estadoSimulacion.pasoActual < PASOS_HANDSHAKE.length - 1) {
        aplicarPaso(estadoSimulacion.pasoActual + 1);
    }
});

document.getElementById('btn-anterior').addEventListener('click', () => {
    if (estadoSimulacion.pasoActual > 0) {
        aplicarPaso(estadoSimulacion.pasoActual - 1);
    }
});

document.getElementById('btn-reiniciar').addEventListener('click', () => {
    aplicarPaso(0);
});

// Inicializar en el paso 0 al cargar la pagina
window.addEventListener('DOMContentLoaded', () => {
    aplicarPaso(0);
});
```

### HTML del panel de control del simulador (Archivo: `components/simulator-ui.html`)

```html
<section id="simulador" class="seccion-premium">
    <div class="contenedor">
        <h2 class="seccion-titulo">Simulacion del Handshake</h2>
        <p class="seccion-descripcion">
            Avanza paso a paso para observar como transicionan los automatas
            y como fluyen los tokens en la Red de Petri.
        </p>

        <!-- Panel de estado actual -->
        <div class="panel-simulador">

            <!-- Indicadores de estado FSM -->
            <div class="indicadores-estado">
                <div class="indicador-fsm indicador-cliente">
                    <span class="indicador-etiqueta">FSM Cliente</span>
                    <span id="display-estado-cliente" class="indicador-valor">CERRADO</span>
                </div>
                <div class="indicador-canal">
                    <span class="indicador-etiqueta">Tokens activos</span>
                    <span id="display-tokens" class="indicador-valor">0</span>
                </div>
                <div class="indicador-fsm indicador-servidor">
                    <span class="indicador-etiqueta">FSM Servidor</span>
                    <span id="display-estado-servidor" class="indicador-valor">ESCUCHA</span>
                </div>
            </div>

            <!-- Barra de progreso -->
            <div class="progreso-contenedor">
                <div id="barra-progreso" class="barra-progreso" style="width: 0%"></div>
            </div>

            <!-- Informacion del paso actual -->
            <div class="info-paso">
                <div class="info-paso-encabezado">
                    <span id="paso-numero" class="paso-numero">Paso 0 de 7</span>
                    <span id="paso-formula" class="paso-formula"></span>
                </div>
                <h4 id="paso-titulo" class="paso-titulo">Estado Inicial</h4>
                <p id="paso-descripcion" class="paso-descripcion-texto"></p>
            </div>

            <!-- Controles -->
            <div class="controles">
                <button id="btn-reiniciar" class="btn btn-secundario">Reiniciar</button>
                <button id="btn-anterior" class="btn btn-primario" disabled>Anterior</button>
                <button id="btn-siguiente" class="btn btn-primario">Siguiente</button>
            </div>

        </div>
    </div>
</section>
```

### CSS del simulador

```css
.panel-simulador {
    background: var(--color-superficie);
    border: 1px solid var(--color-borde);
    border-radius: var(--radio-borde);
    padding: 2rem;
    margin-top: 1.5rem;
}

.indicadores-estado {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.indicador-fsm {
    background: var(--color-fondo);
    border: 1px solid var(--color-borde);
    border-radius: 6px;
    padding: 1rem;
    text-align: center;
}

.indicador-etiqueta {
    display: block;
    font-family: var(--fuente-codigo);
    font-size: 0.7rem;
    color: var(--color-texto-secundario);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 0.5rem;
}

.indicador-valor {
    display: block;
    font-family: var(--fuente-codigo);
    font-size: 1rem;
    font-weight: 600;
    transition: color 0.3s ease;
}

.indicador-cliente .indicador-valor { color: var(--color-cliente);  }
.indicador-servidor .indicador-valor { color: var(--color-servidor); }

/* Barra de progreso */
.progreso-contenedor {
    height: 3px;
    background: var(--color-borde);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 1.5rem;
}

.barra-progreso {
    height: 100%;
    background: linear-gradient(90deg, var(--color-cliente), var(--color-servidor));
    border-radius: 2px;
    transition: width 0.4s ease;
}

/* Panel de informacion */
.info-paso {
    background: var(--color-fondo);
    border: 1px solid var(--color-borde);
    border-left: 3px solid var(--color-canal);
    border-radius: 4px;
    padding: 1.2rem;
    margin-bottom: 1.5rem;
}

.info-paso-encabezado {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.6rem;
}

.paso-numero {
    font-family: var(--fuente-codigo);
    font-size: 0.75rem;
    color: var(--color-texto-secundario);
}

.paso-formula {
    font-family: var(--fuente-codigo);
    font-size: 0.75rem;
    color: var(--color-acento);
}

.paso-titulo {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.5rem;
    color: var(--color-texto-primario);
}

.paso-descripcion-texto {
    font-size: 0.9rem;
    color: var(--color-texto-secundario);
    margin: 0;
    line-height: 1.6;
}

/* Botones */
.controles {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
}

.btn {
    font-family: var(--fuente-codigo);
    font-size: 0.85rem;
    padding: 0.6rem 1.8rem;
    border-radius: 5px;
    border: 1px solid;
    cursor: pointer;
    transition: all 0.15s ease;
    letter-spacing: 0.03em;
}

.btn-primario {
    background: var(--color-cliente);
    border-color: var(--color-cliente);
    color: #0d1117;
    font-weight: 600;
}

.btn-primario:hover:not(:disabled) {
    background: #58a6ff;
    border-color: #58a6ff;
}

.btn-primario:disabled {
    opacity: 0.35;
    cursor: not-allowed;
}

.btn-secundario {
    background: transparent;
    border-color: var(--color-borde);
    color: var(--color-texto-secundario);
}

.btn-secundario:hover {
    border-color: var(--color-texto-secundario);
    color: var(--color-texto-primario);
}
```

---

## 8. Seccion 5 — Propiedades Verificables

### Que debe mostrar

Una tabla con las cinco propiedades formales del modelo (deadlock, acotacion, vivacidad, alcanzabilidad, correccion bajo perdida) y su descripcion en el contexto del TCP.

### Estructura HTML (Archivo: `components/properties.html`)

```html
<section id="propiedades" class="seccion-premium">
    <div class="contenedor">
        <h2 class="seccion-titulo">Propiedades Verificables del Modelo</h2>
        <table class="tabla-propiedades">
            <thead>
                <tr>
                    <th>Propiedad</th>
                    <th>Definicion Formal</th>
                    <th>En el Contexto TCP</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="prop-nombre">Ausencia de Deadlock</td>
                    <td class="prop-formula"><code>¬∃M : ∀t ∈ T, t no habilitada en M</code></td>
                    <td>Ningun segmento queda en el canal sin ser entregado o descartado.</td>
                    <td><span class="badge badge-ok">Verificable</span></td>
                </tr>
                <tr>
                    <td class="prop-nombre">Acotacion del Canal</td>
                    <td class="prop-formula"><code>∃k : M(p_SYN) ≤ k ∀M alcanzable</code></td>
                    <td>El buffer del canal no desborda. Garantia de que no hay acumulacion infinita de segmentos.</td>
                    <td><span class="badge badge-ok">Verificable</span></td>
                </tr>
                <tr>
                    <td class="prop-nombre">Vivacidad</td>
                    <td class="prop-formula"><code>∀t ∈ T, ∀M alcanzable, ∃ secuencia desde M donde t es habilitada</code></td>
                    <td>Cada tipo de segmento (SYN, SYN-ACK, ACK) puede ser eventualmente entregado.</td>
                    <td><span class="badge badge-ok">Verificable</span></td>
                </tr>
                <tr>
                    <td class="prop-nombre">Alcanzabilidad del Estado ESTABLECIDO</td>
                    <td class="prop-formula"><code>E&lt;&gt; (Cliente.ESTABLECIDO ∧ Servidor.ESTABLECIDO)</code></td>
                    <td>Existe al menos una traza de ejecucion que lleva a ambos automatas al estado ESTABLECIDO simultaneamente.</td>
                    <td><span class="badge badge-ok">Verificable en UPPAAL</span></td>
                </tr>
                <tr>
                    <td class="prop-nombre">Correccion bajo Perdida</td>
                    <td class="prop-formula"><code>A[] not deadlock (con perder_paquete activa)</code></td>
                    <td>Aun con perdida de paquetes activa en la PN, el mecanismo de timeout y retransmision del FSM Cliente garantiza que el sistema no entra en deadlock.</td>
                    <td><span class="badge badge-parcial">Condicional al timeout</span></td>
                </tr>
            </tbody>
        </table>
    </div>
</section>
```

---

## 9. Despliegue

### Opcion A — Despliegue Local (para clase sin internet)

Abrir el archivo `index.html` directamente en el navegador haciendo doble clic. No requiere servidor. Todos los recursos (fuentes) estan referenciados por CDN, pero el diagrama SVG y la logica de simulacion funcionan sin internet.

**Nota:** Para que las fuentes de Google Fonts carguen, se necesita conexion a internet. Si no hay internet, agregar al `<head>` un fallback:

```css
body {
    font-family: 'IBM Plex Sans', 'Courier New', monospace;
}
```

### Opcion B — GitHub Pages (URL publica)

1. Crear un repositorio publico en GitHub con el nombre `tcp-handshake-model`.
2. Subir el archivo `index.html` a la raiz del repositorio.
3. Ir a `Settings > Pages > Branch: main > /(root)` y hacer clic en "Save".
4. La pagina estara disponible en: `https://<usuario>.github.io/tcp-handshake-model`

### Opcion C — Netlify Drop (mas rapido)

1. Ir a [https://app.netlify.com/drop](https://app.netlify.com/drop).
2. Arrastrar el archivo `index.html` al area de drop.
3. Netlify genera una URL publica en menos de 30 segundos.

---

## 10. Lista de Verificacion Final

Antes de presentar, confirmar que cada uno de estos elementos esta correctamente implementado:

| Item | Criterio de Aceptacion |
|---|---|
| Encabezado | Muestra titulo, asignatura y los tres chips de modelo |
| Seccion de definiciones | Ambas cards (FSM Cliente y FSM Servidor) con formulas y tablas de transicion |
| Diagrama SVG | Tres zonas visibles, convenciones correctas (circulo=plaza, rectangulo=transicion, doble-circulo=estado-aceptacion) |
| Conexiones FSM-PN | Flechas punteadas moradas visibles en el SVG |
| Simulador | Avanza 7 pasos. Cada paso cambia el estado activo del SVG |
| Tokens | Aparecen y desaparecen correctamente en cada plaza |
| Botones | "Anterior" desactivado en paso 0, "Siguiente" desactivado en paso 7 |
| Tabla de propiedades | Las 5 propiedades con sus formulas y badges |
| Fuentes | IBM Plex Sans y IBM Plex Mono cargando correctamente |
| Responsive | La pagina se ve correctamente en una pantalla de proyector (1280x720 o superior) |

---

## 11. Evolucion del Simulador: Escenarios Avanzados e Interaccion Pro

Durante la fase de desarrollo iterativo, el simulador ha evolucionado de una visualizacion lineal a un motor de simulacion completo capaz de manejar casos de borde y situaciones de red reales.

### 11.1 Nuevos Escenarios de Protocolo Implementados

1.  **Cierre de Conexion (Teardown):**
    *   Implementacion del flujo "Active Close".
    *   Nuevos estados visuales en el SVG: `FIN-ESPERA` (Cliente) y `CERRANDO` (Servidor).
    *   Uso de tokens de control (gris) para representar segmentos `[FIN]`.

2.  **Rechazo por Servidor (RST - Reset):**
    *   Control de estado de poder del Servidor (ON/OFF).
    *   Logica de intercepcion: si un `[SYN]` llega a un servidor en modo OFF, el sistema genera un paquete de reset `[RST]` (rojo) que aborta la conexion.

3.  **Apertura Simultanea (Simultaneous Open):**
    *   Soporte para el escenario donde ambos nodos inician la conexion al mismo tiempo.
    *   Animacion sincronizada de tokens cruzandose en el canal y transicion mutua al estado `SYN-RECIBIDO`.

4.  **Timeouts Bidireccionales:**
    *   El Servidor ahora cuenta con su propio temporizador de retransmision si se queda atascado en `SYN-RECIBIDO` (por perdida del `[ACK]` final).

### 11.2 Mejoras en la Experiencia de Usuario (UX)

*   **Consola de Red (Wireshark Sim):** Se integro una bitácora tecnica que registra cada evento con marcas de tiempo, mejorando la trazabilidad de la simulacion.
*   **Optimizacion de Layout:** Uso de CSS Grid (60/40) para mantener el diagrama y los controles siempre visibles de forma profesional.
*   **Descripciones Dinamicas:** El motor asíncrono actualiza en tiempo real las explicaciones pedagogicas de cada paso, vinculando la teoria de Automatas con la de Redes de Petri.
*   **Limpieza Estetica:** Se eliminaron elementos decorativos (emojis) para cumplir con un estándar de presentacion academica y técnica.

### 11.3 Refactorizacion del Motor (`simulator.js`)

Se migro de una logica de pasos fijos a una arquitectura dirigida por eventos y promesas asíncronas, permitiendo animaciones complejas, colisiones de tokens y estados de error dinámicos sin perder la coherencia matematica del modelo.

---

*Plan actualizado con las mejoras de la fase de expansion de logica.*
