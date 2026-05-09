# Documentación Técnica Exhaustiva: Modelado Petri-TCP
## Proyecto de Autómatas — Segundo Corte

Este documento proporciona una descripción formal, matemática y técnica de los flujos de simulación implementados en el motor Petri-TCP, junto con una interpretación en lenguaje natural de su equivalencia en el mundo real.

---

## 1. Fundamentos del Modelo

### 1.1. Definición de la Red de Petri (PN)
La dinámica del canal se define como una Red de Petri $N = (P, T, F, W, M_0)$ donde:
- **Plazas ($P$):** Buffers de interfaz (`p_buf_C`, `p_buf_S`) y el medio de transmisión físico (`p_SYN`, `p_SYNACK`, `p_ACK`).
- **Transiciones ($T$):** Eventos de red: disparos de envío ($t_{env}$) y disparos de entrega/recepción ($t_{ent}$).
- **Ecuación de Estado:** $M_{k+1} = M_k + C \cdot u$.

**Interpretación en la vida real:**
En el mundo real, las "Plazas" representan la memoria volátil de las tarjetas de red y los buffers del kernel del sistema operativo. Las "Transiciones" son el trabajo del procesador y los protocolos de capa física (Ethernet/WiFi) que mueven los electrones o fotones a través del cable. 
*Nota sobre el modelo:* En la realidad, los paquetes no son "tokens" idénticos; cada uno tiene un encabezado único con IPs, puertos y números de secuencia. Nuestra aplicación simplifica esto para enfocarse en el flujo lógico.

---

## 2. Análisis Profundo de Escenarios

### 2.1. Handshake Normal (Sincronización)
Establece una conexión fiable mediante el intercambio de 3 segmentos.

*   **Lógica Matemática:** $\delta_C(CERRADO, active\_open) \to SYN\_SENT$. Disparo de $t_{env\_SYN}$ al haber $M(p\_buf\_C) \ge 1$.
*   **Vida Real:** Cuando escribes `google.com` en tu navegador, tu sistema operativo envía un paquete con el bit **SYN** (Synchronize) activo. Es como tocar la puerta y preguntar: "¿Podemos hablar?". El servidor responde con **SYN-ACK**, que significa "Sí, te escucho, yo también quiero hablar contigo". Finalmente, tú envías un **ACK**, confirmando que escuchaste su respuesta.
*   **Fidelidad:** Nuestra aplicación sigue este flujo al 100% según el estándar RFC 793. Es la base de casi todo el tráfico de internet actual.

---

### 2.2. Pérdida de Paquete y Arcos Inhibidores
Simula la falta de fiabilidad del medio físico.

*   **Lógica Matemática:** $Enabled(t_{ent\_SYN}) \iff (M(p\_SYN) \ge 1) \wedge (M(p\_perdido) = 0)$. El arco inhibidor bloquea la entrega si hay un fallo.
*   **Vida Real:** Los cables pueden tener ruido electromagnético, los routers pueden saturarse y descartar paquetes ("packet drop"), o una señal WiFi puede perderse. TCP está diseñado para ser "paranoico": si no recibe confirmación en un tiempo X (RTO - Retransmission Timeout), asume que el paquete murió y lo intenta de nuevo.
*   **Diferencia con la Realidad:** En la vida real, TCP intentará retransmitir varias veces (generalmente hasta 15 veces) antes de rendirse y volver a `CERRADO`. Nuestro simulador vuelve a `CERRADO` al primer fallo para simplificar la enseñanza del concepto de timeout.

---

### 2.3. Rechazo de Conexión (RST)
Modelamos el intento de conexión a un puerto que no está escuchando.

*   **Lógica Matemática:** Disparo de transición de error en el Servidor que genera un token RST en el canal de retorno.
*   **Vida Real:** Es como intentar entrar a una tienda que está cerrada con llave. El guardia (el sistema operativo) te dice inmediatamente: "No insistas, aquí no hay nadie atendiendo". Se envía un paquete con el bit **RST** (Reset) activo.
*   **Fidelidad:** Es muy fiel a la realidad. Los firewalls modernos a veces hacen "Stealth Mode" (simplemente ignoran el SYN para que el atacante crea que no hay nada), pero el comportamiento estándar es responder con un RST.

---

### 2.4. Apertura Simultánea (Cruce de SYNs)
Un caso donde ambos nodos inician la conexión al mismo tiempo.

*   **Lógica Matemática:** Concurrencia de SYNs en tránsito. $\delta_C(SYN\_SENT, rcv\_SYN) \to SYN\_RECEIVED$.
*   **Vida Real:** Imagina que dos amigos se llaman por teléfono exactamente al mismo segundo. En lugar de dar señal de ocupado, TCP permite que ambos se den cuenta de que el otro también quería hablar. Ambos pasan a un estado intermedio y luego se sincronizan. 
*   **Discrepancia:** Es un evento extremadamente raro en la internet moderna (ocurre más en redes P2P), pero el simulador lo implementa correctamente para demostrar que el autómata de TCP es una "máquina de estados completa".

---

### 2.5. Transmisión Masiva (Transferencia de Datos)
Fase de flujo continuo una vez establecida la sesión.

*   **Lógica Matemática:** Ciclo de disparos sucesivos en la cadena $p\_ACK$ (Cian) o $p\_SYNACK$ (Morado).
*   **Vida Real:** Aquí es donde ocurre la magia. Una vez "abierto el tubo", los datos fluyen. Si estás descargando un video, el servidor te envía ráfagas de paquetes (Morado) y tu computadora le envía ACKs constantes para decirle "Sigue así, lo recibí bien".
*   **Limitación del Modelo:** En la realidad, TCP usa una "Ventana Deslizante" (Sliding Window). No envía un solo paquete y espera; envía muchos al mismo tiempo para maximizar la velocidad. Nuestra aplicación simula un flujo secuencial ("Stop and Wait"), que es más fácil de visualizar pero menos eficiente que el TCP real.

---

## 3. Estructura Estática: Matriz de Incidencia ($C$)
La matriz de incidencia define la topología de la Red de Petri. Indica cómo cada transición ($t_j$) afecta el número de tokens en cada plaza ($p_i$).

| Plaza \ Trans | $t_{env\_SYN}$ | $t_{ent\_SYN}$ | $t_{env\_SACK}$ | $t_{ent\_SACK}$ | $t_{env\_ACK}$ | $t_{ent\_ACK}$ |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| $p_{buf\_C}$ | -1 | 0 | 0 | 0 | 0 | 0 |
| $p_{SYN}$ | +1 | -1 | 0 | 0 | 0 | 0 |
| $p_{buf\_S}$ | 0 | +1 | -1 | 0 | 0 | 0 |
| $p_{SYNACK}$ | 0 | 0 | +1 | -1 | 0 | 0 |
| $p_{buf\_C2}$ | 0 | 0 | 0 | +1 | -1 | 0 |
| $p_{ACK}$ | 0 | 0 | 0 | 0 | +1 | -1 |

*Leyenda:* **-1** (Consumo de token), **+1** (Producción de token), **0** (Sin conexión).

---

## 4. Evolución de Estados por Escenario

A continuación, se detalla la **Matriz de Transición de Estados** para cada flujo, correlacionando el evento físico con el cambio lógico.

### 4.1. Caso 1: Handshake Normal
| Paso | Evento (Transición) | Marcado resultante ($M$) | FSM Cliente ($Q_C$) | FSM Servidor ($Q_S$) | Argumento (Lenguaje Natural) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `active_open` | $M(p_{buf\_C})=1$ | SYN_ENV | LISTEN | El usuario inicia la conexión. |
| 2 | $t_{env\_SYN}$ | $M(p_{SYN})=1$ | SYN_ENV | LISTEN | El paquete SYN sale al cable. |
| 3 | $t_{ent\_SYN}$ | $M(p_{buf\_S})=1$ | SYN_ENV | LISTEN | El servidor detecta señal en su buffer. |
| 4 | `rcv_SYN` | $M(p_{SYNACK})=1$ | SYN_ENV | SYN_REC | El servidor acepta y responde. |
| 6 | $t_{ent\_SACK}$ | $M(p_{buf\_C2})=1$ | SYN_ENV | SYN_REC | El cliente recibe la respuesta. |
| 7 | `rcv_SACK` | $M(p_{ACK})=1$ | ESTAB | SYN_REC | El cliente se establece y confirma. |
| 8 | $t_{ent\_ACK}$ | $M=\vec{0}$ | ESTAB | ESTAB | Conexión lograda. |

---

### 4.2. Caso 2: Pérdida de Paquete (Arco Inhibidor)
| Paso | Evento | Marcado / Lógica | Estado FSM | Por qué pasa (Realidad) |
| :--- | :--- | :--- | :--- | :--- |
| 2 | $t_{env\_SYN}$ | $M(p_{SYN})=1$ | SYN_ENV | Paquete en tránsito. |
| 3 | **Fallo** | $M(p_{perdido})=1$ | SYN_ENV | Congestión severa o cable roto. |
| 4 | **Bloqueo** | $M(p_{SYN})=1$ (Atrapado) | SYN_ENV | El arco inhibidor impide que el servidor lo vea. |
| 5 | **Timeout** | $M(p_{SYN}) \to 0$ | CERRADO | El cliente se rinde tras esperar respuesta. |

---

### 4.3. Caso 3: Rechazo (RST)
| Paso | Evento | Marcado resultante | Estado FSM | Por qué pasa (Realidad) |
| :--- | :--- | :--- | :--- | :--- |
| 3 | $t_{ent\_SYN}$ | $M(p_{buf\_S})=1$ | LISTEN $\to$ CERRADO | El servidor recibe pero no puede conectar. |
| 4 | $t_{env\_RST}$ | $M(p_{RST})=1$ | CERRADO | El servidor envía un "No molestar". |
| 5 | `rcv_RST` | $M=\vec{0}$ | CERRADO | El cliente cancela y libera recursos. |

---

### 4.4. Caso 4: Apertura Simultánea
| Paso | Evento | $M(p_{SYN})$ | $M(p_{SYNACK})$ | Cliente | Servidor | Argumento |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `init` dual | 1 (buf) | 1 (buf) | SYN_ENV | SYN_ENV | Ambos disparan a la vez. |
| 2 | Cruce | 1 (red) | 1 (red) | SYN_ENV | SYN_ENV | Los paquetes se cruzan en el aire. |
| 3 | Recepción | 0 | 0 | SYN_REC | SYN_REC | Ambos ven que el otro también inició. |
| 4 | Confirmación| 0 | 0 | ESTAB | ESTAB | Ambos envían ACKs y se establecen. |

---

### 4.5. Caso 5: Transmisión Masiva (Modo Auto)
| Ciclo | Transición | Marcado (Dinámico) | Estado | Propósito Real |
| :--- | :--- | :--- | :--- | :--- |
| 1..N | $t_{env\_ACK}$ | $M(p_{ACK})=1$ | ESTAB | Envío de ráfaga de datos (Upload). |
| 1..N | $t_{ent\_ACK}$ | $M(p_{ACK})=0$ | ESTAB | Recepción y procesamiento de datos. |

---

## 5. Conclusión
El simulador es una aproximación **didáctica de alta fidelidad**. Aunque simplifica conceptos avanzados como la gestión de buffers dinámicos y algoritmos de congestión (como TCP Reno o Cubic), captura la esencia lógica del protocolo y el poder de las Redes de Petri para modelar sistemas asíncronos y distribuidos.

---
*Autor: Antigravity AI Assistant*
*Validación Técnica: Proyecto Automatas 2024*
