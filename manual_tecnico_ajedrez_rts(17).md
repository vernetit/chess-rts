# Ajedrez RTS — manual técnico para continuar el desarrollo

Este documento acompaña a `ajedrez-rts.html` y, desde v30, al archivo del tutorial `ajedrez-rts-tutorial.js` (van juntos en la misma carpeta). Está pensado para que un modelo de lenguaje (ChatGPT, Gemini, Claude, etc.) entienda el juego y el código antes de modificarlo. Leelo completo y después abrí el HTML.

## 0. Historial de versiones

- **v30 — Tutorial en video (archivo aparte)** (esta versión): botón **🎬 Tutorial** (junto al selector de velocidad y en el menú de inicio) que abre un reproductor con escenas SVG animadas de todo el juego: reproducir/pausa, ±5 s, tema anterior/siguiente, velocidad 0,5x–2x, barra de tiempo con marcas de color por tema y lista de 18 capítulos. El tutorial vive en **`ajedrez-rts-tutorial.js`**, que el HTML carga la primera vez que se toca 🎬; si el navegador no lo encuentra, se puede elegir el archivo a mano. Mientras el tutorial está abierto el juego queda en pausa. Esta versión se armó sobre el v28 y **reincorpora lo de v29** (pasar hierba automático, «Elegir a quién», botón 🌿 Hierbas). Ver la sección **1q**.
- **v29 — Pasar hierba automático y Menú Herbal**: «Pasar hierba 🌿» ahora busca solo la aliada compatible más cercana (`nearestHerbReceiver`) y la pieza sale caminando a entregársela; el modo manual quedó en el botón «Elegir a quién». Botón **🌿 Hierbas** arriba a la derecha (en `#rot`) que abre `#herbBox`: reglas sintetizadas y las 8 hierbas con sus piezas compatibles y su efecto. Ver la sección **1p**.
- **v28 — Hierbas, Parte 3: los poderes**: las 8 hierbas hacen efecto cuando las lleva una pieza que las puede usar (`canUseHerb(u)`). Dama: resucitar en su casilla (1), resucitar junto al castillo (2), teletransporte con enfriamiento de 18 s (3). Compartidas: disparo a distancia (4), sobrevolar edificios/árboles/murallas y salto de 2 del peón (5), +35 % velocidad, −25 % recarga y +1 de daño (6), autocurado y curación a vecinas (7), −35 % de daño en un radio de 2 (8). `kill` ahora devuelve `true`/`false`. Ver la sección **1o**.
- **v27 — Hierbas, Parte 2: traspaso entre piezas aliadas**: orden `{k:'giveHerb', id}` (`orderGiveHerb`): la pieza camina hasta quedar al lado de una aliada de su misma capa y le pasa la hierba; si la otra llevaba una, se intercambian. En el panel, una pieza sola con hierba muestra la hierba, su poder y para qué piezas sirve, con los botones **Pasar hierba 🌿** (modo `'giveHerb'`: tocar o hacer clic en una aliada) y **Descartar hierba**. En PC, clic derecho sobre una aliada que **sí** puede usar la hierba que lleva la elegida (y la elegida no) se la pasa directo. Los efectos de las hierbas siguen sin implementarse. Ver la sección **1n**.
- **v26 — Hierbas, Parte 1**: catálogo `HERBS` de 8 plantas con nombres botánicos en latín que camuflan a genios del ajedrez (Agustín Oro, Capablanca, Tal, Kaspárov, Morphy, Fischer, Carlsen y Polgár). Alrededor del 18 % de los árboles tiene una hierba (`G.herbs`, en pares simétricos), marcada con un ícono sobre la copa. El peón que va a talar un árbol con hierba **la saca primero para él** (`u.herb`) y, si la orden fue directa a ese árbol, se queda quieto con ella. La pieza que lleva hierba la muestra a su lado (con halo de color si la puede usar, gris si no). **Los efectos de las hierbas todavía no están implementados** (quedan para la Parte 2). Ver la sección **1m**.
- **v25 — Asimetría sutil entre Blancas y Negras**: **territorio negro** de radio 6,5 alrededor del castillo de las Negras que desgasta a las piezas blancas de la superficie a 0,015 de vida por segundo (marcado con un tinte rojizo muy suave y un borde fino). A cambio, cada pieza blanca nace con **2 ataques reforzados** (`u.bonus`) que solo se usan fuera de ese territorio: más daño y menos recarga en ese golpe, con un puntito amarillo arriba a la izquierda de la pieza. Ver la sección **1l**.
- **v24 — Muralla con sacrificio de peones**: botón 🧱 en el panel del peón. Se marca inicio y final de la muralla (como en Age of Empires); tiene tantas casillas como peones elegidos. Cada peón camina a su casilla y se sacrifica convirtiéndose en un tramo de piedra (edificio `muralla` 1×1). Los tramos cortan el paso a todo menos al caballo, se unen visualmente, se pueden destruir a golpes y eliminar con Supr. Ver la sección **1k**.
- **v23 — Edificios transparentes cuando tapan piezas**: si un edificio queda dibujado encima de una pieza que está detrás de él (por la perspectiva), el edificio se vuelve medio transparente (40 % de opacidad, con un fundido de 0,15 s) para ver qué hay detrás. Solo gráfico. Ver la sección **1j**.
- **v22 — Cámara con las flechas del teclado**: mantener apretada una flecha mueve la vista en esa dirección de pantalla; con Mayús va 2,2 veces más rápido. Ver la sección **1i**.
- **v21 — Alfil sanador y persistencia entre sesiones**: el alfil quieto cura sola a la pieza propia herida que tenga en una de sus 8 casillas vecinas (2 de vida por segundo, 3 si está mejorado). Orden activa `{k:'heal',id}`: con alfiles elegidos, tocar una pieza propia herida (o clic derecho sobre cualquier pieza propia en PC) los manda a ponerse al lado. Las piezas de 1 de vida muestran barra cuando están heridas. La velocidad del juego y el último tamaño de mapa se guardan en `localStorage`. Ver la sección **1h**.
- **v20 — Tala de árboles y velocidad del juego**: los peones talan árboles con una hachita animada (≈30 s por árbol con un peón; varios suman); la casilla queda como pasto. **Talado automático:** al caer un árbol, el peón pasa solo al árbol más cercano (hasta 8 casillas) hasta que reciba otra orden. **Abrir camino:** un peón mandado a un lugar sin camino libre atraviesa el bosque talando los árboles que haga falta. Selector de velocidad ⏩ arriba a la derecha (0,75x – 2x) y teclas `+` / `−`. Ver la sección **1g**.
- **v19 — Sombra del edificio y construir con clic derecho**: en modo construcción, con mouse, el edificio translúcido sigue al cursor (borde verde si se puede, rojo si no) y el clic derecho lo construye. Ver la sección **1f**.
- **v18 — Construir encima de piezas propias**: se puede colocar un edificio sobre casillas ocupadas por piezas **propias** (no vigías); al colocarlo, esas piezas salen solas a una casilla libre del anillo. Funciones nuevas `canEvacuate`, `evacuateFootprint` y `passFor`; campo nuevo `u.evac`; `canPlace` recibe `team`. Ver la sección **1e**.
- **v17 — Barra de estado estilo Age of Empires**: fila de íconos `#hud` arriba del minimapa con peones ociosos, ejército ocioso, edificios sin cola, estado del rey, alerta de ataque, puntaje de los dos bandos (con detalle) y reloj. Estadísticas nuevas `G.st` y alertas `G.alert`. Ver la sección **1d**.
- **v16 — Puerto y navegación**: edificio **Puerto** (1×1) que hace de puerta/esclusa entre tierra y agua. El agua pasa a ser ocupable en la superficie, pero solo se entra o se sale de ella a través de un puerto terminado (`navKind` / `navStep`). Las piezas en el agua se dibujan sobre un bote. Ver la sección **1c**.
- **v15 — Subsuelo y túneles**: dos capas de juego (`layer` 0 superficie / 1 subsuelo), mapa subterráneo `G.ug`, bajada por el castillo, excavación con peones, bocas de túnel por sacrificio de peón y cambio de vista con Tab / V / botón ⛏. Ver la sección **1b**.
- **v14 — Terreno, mapas grandes y elevación visual**:
  - Mapas **Muy grande (44)** y **Ultra grande (56)** en el menú; zoom mínimo un poco más alejado (`twLimits`, factor 0,9).
  - **Elevación visual estilo SimCity 2000** (`G.elev`, niveles 0–2): las casillas se dibujan escalonadas con faldones, estratos y un bisel de color. **No afecta la jugabilidad.**
  - **Montañas** (terreno 5): macizos sólidos de varias casillas, simétricos y lejos de las bases. Bloquean a todas las piezas, **incluido el salto del caballo** (`knightBlocked`).
- **v13 y anteriores:** todo lo descripto en el resto del documento (cristales, vigías, grupos, minimapa, rey en el castillo, etc.).

## 1. Qué es el juego

Estrategia en tiempo real (tipo Age of Empires) sobre un tablero de ajedrez isométrico. No hay turnos. Las piezas se mueven **con sus movimientos reales de ajedrez**, pero en tiempo real: cada movimiento tarda según la distancia recorrida y después la pieza espera un tiempo de recarga.

- Dos bandos: **0 = Blancas** (base abajo) y **1 = Negras** (base arriba).
- **Objetivo:** destruir el **castillo** rival. Matar al rey **no** gana la partida.
- **Economía:** el oro entra solo con el tiempo (ingreso base más un extra por cada peón), y se puede aumentar estacionando peones sobre **cristales**.
- **Peones:** construyen edificios, recolectan cristales de forma pasiva al quedarse quietos encima, **talan árboles** (v20), **juntan hierbas** de los árboles (v26), pueden convertirse en **vigías con arco** y pueden **sacrificarse para levantar murallas** (v24).
- **Asimetría (v25):** el castillo de las Negras irradia un territorio que desgasta muy de a poco a las Blancas; las piezas blancas nacen con 2 ataques reforzados (sección 1l).
- **Velocidad:** todo el tiempo de juego se puede acelerar o frenar entre 0,75x y 2x (v20).
- **Edificios productores:** producen piezas en una cola (hasta 20). El jugador puede configurar una casilla de salida (`b.exit`) o dejarla al azar entre las casillas libres del anillo.
- **Población:** cada pieza ocupa lugar, y las casas suben el límite.

### Modos (menú de inicio)

- **Contra otro humano** (por defecto): los dos bandos se manejan en la misma pantalla y a la vez. Tocar una pieza o edificio de un color cambia el bando activo (`me`). Cada bando conserva su oro, sus grupos y su selección.
- **Contra la IA:** el jugador maneja solo las Blancas.
- **Tamaño de mapa:** chico 16, mediano 24, grande 32, muy grande 44 y ultra grande 56 (el mapa es N×N con borde irregular). Las bases quedan siempre en las esquinas (castillos en (N-5,N-5) y (2,2)), así que en mapas grandes el centro queda más lejos.

### Reglas de las piezas

| Pieza | Movimiento | Velocidad (s/casilla) | Recarga (s) | Costo | Tiempo prod. (s) | Población | Vida (`hp`) | Daño a unidades | Daño a edificios (`dmg`) | Sale de |
|---|---|---|---|---|---|---|---|---|---|---|
| peon | 1 casilla ortogonal; **captura** en diagonal | 0,5 | 0,35 | 30 | 6 | 1 | 1 | 1 (vigía: 0,25 a dist. 3) | 1 | castillo |
| caballo | salto en L (por encima de todo, **menos montañas**) | salto 0,55 | 0,45 | 70 | 9 | 2 | 1 | 1 (+1 mejorado) | 2 (+2 mejorado) | establo |
| alfil | diagonal, cualquier distancia; **sana** a las aliadas de al lado (v21) | 0,22 | 0,7 | 70 | 9 | 2 | 1 | 1 (+1 mejorado) | 2 (+2 mejorado) | templo |
| torre | ortogonal, cualquier distancia | 0,42 | 0,9 | 120 | 12 | 3 | 1 | 1 (+1 mejorado) | 3 (+2 mejorado) | torreon |
| dama | ortogonal y diagonal | 0,17 | 0,5 | 220 | 16 | 4 | 1 | 1 (+1 mejorado) | 3 (+2 mejorado) | palacio |
| rey | 1 casilla en 8 direcciones | 1,1 | 0,8 | 160 | 14 | 3 | **24** | **6** (+1 mejorado) | **12** (+2 mejorado) | castillo |

- **Rey y guarnición en el castillo:** uno solo por bando, vivo, guardado en el castillo o en cola (`kingTaken`). Tiene **24 de vida**, pega **6 de daño** a unidades (12 a edificios) y cuando lo atacan sin matarlo, pierde vida y el atacante rebota sin ocupar su casilla.
  - **Restricción de peones:** mientras el rey está **afuera en el tablero** (`kingOutside(team)`), el castillo **no puede iniciar ni avanzar la producción de peones** (se pausa).
  - **Entrar/Salir del castillo:** seleccionando al rey y tocando/haciendo clic derecho en el propio castillo, recibe la orden `{k:'enter', id:b.id}`. Al llegar a una casilla adyacente, desaparece del mapa y se guarda en `b.kingInside` (sigue contando para la población). Desde el panel del castillo se lo puede volver a sacar (`releaseKing`).
- **Mejoras individuales (`upgraded`, costo 40 de oro):** cada unidad individual admite una mejora única seleccionándola sola (`upgradeUnit(u)`):
  - **Peón → Peón vigía (`isWatch(u)`):** se vuelve 65% más alto visualmente (animado con `upgradedAt`) y muestra el ícono `↗`. Queda **fijo en su casilla** (no se mueve ni construye) y dispara flechas (`fx` tipo `'arrow'`) a unidades enemigas en un radio de hasta **3 casillas** con línea de visión despejada (sin sólidos ni edificios en el medio), haciendo **0,25 de daño** cada **1,5 s** de recarga (4 flechas matan una pieza común de 1 de vida).
  - **Demás piezas → Mejor arma:** muestran una estrella `★`, suman **+1 de daño** contra unidades en `strike` y **+2 de daño** contra edificios en `hit`.
- **Alfil:** solo pisa casillas de un color. El color queda determinado por la casilla donde nace. Desde v21 **cura** a las piezas propias heridas que tiene al lado (sección 1h).
- **Caballo:** mientras está en el aire no se lo puede interceptar. No puede saltar si alguna de las 4 casillas intermedias del rectángulo 2×3 del salto es montaña (`knightBlocked(x,y,nx,ny)`, usado en `eachMove` y `captureCells`).
- **Choques:** si una pieza en movimiento entra en una casilla con un enemigo, lo golpea (`strike`). Si la víctima sobrevive (como el rey o una unidad herida por flechas), el atacante frena en la casilla anterior (`endMove(u, true)`). Si los dos se movían, gana el que arrancó primero (`mvStart` menor).
- **Ataque a edificios:** una pieza "golpea" un edificio cuando una de sus casillas está a tiro de captura legal. No entra en el edificio: hace daño y espera su recarga más 0,9 s.
- **Automático:** una pieza quieta y sin orden captura sola a cualquier enemigo a tiro, o golpea un edificio a tiro. Con órdenes de ataque (`atk` / `atkB`) también captura lo que encuentre en el camino.

### Edificios

| Tipo | Tamaño (w×h) | Costo | Construcción (s) | Vida | Población que da | Produce |
|---|---|---|---|---|---|---|
| castillo | 3×3 | — (inicial) | — | 60 | 5 | peon, rey |
| casa | 1×1 | 40 | 6 | 10 | 3 | — |
| casona | 2×1 | 70 | 9 | 14 | 6 | — |
| establo | 2×2 | 120 | 12 | 20 | 0 | caballo |
| templo | 2×3 | 120 | 14 | 22 | 0 | alfil |
| torreon | 2×2 | 160 | 16 | 30 | 0 | torre |
| palacio | 3×2 | 220 | 20 | 30 | 0 | dama |
| puerto | 1×1 | 80 | 10 | 16 | 0 | — (puerta tierra↔agua, ver 1c) |
| muralla | 1×1 por tramo | 0 oro: 1 peón sacrificado por tramo | 1 s (el peón parado en su casilla) | 16 | 0 | — (corta el paso, ver 1k) |

- El tope de población es `POP_MAX` = 60. Las piezas en cola y el rey guardado en el castillo (`b.kingInside`) ya cuentan.
- **Cola de producción y punto de salida:** cada clic en una pieza suma una a `b.queue` (hasta `QUEUE_LIMIT` = 20), descontando el oro al encolar. El edificio tiene una propiedad opcional `b.exit = {x,y}`:
  - Si `b.exit` está definido (`Elegir salida`), las unidades nacen en la casilla libre del anillo más cercana a `b.exit`.
  - Si `b.exit` es `null` (`Salida al azar`), nacen en una casilla libre aleatoria del anillo (`spawnCell`).
- La construcción avanza mientras haya peones (que no sean vigías) con orden de construir parados en casillas adyacentes al edificio. Varios peones suman velocidad.

### Economía y Cristales

- **Ingreso base:** `INCOME` = [3, 2,7] por segundo (en modo humano, los dos bandos usan 3), más `PER_PEON` = 0,25 por cada peón.
- **Cristales (`G.crystals`):** casillas transitables con gemas turquesas generadas en terreno accesible (`seedCrystals()`, 7,5% de probabilidad general más 5 garantizados cerca de cada castillo).
  - Cuando un peón común (no vigía) está quieto, sin construir y sin una orden de movimiento pendiente sobre una casilla con cristal (`harvesting(u)`), recolecta oro extra sin agotar el depósito y muestra una gemita flotante encima.
  - **Rendimiento por distancia (`crystalYield(u)`):** rinde entre **+0,20 y +0,30 de oro/s**. Cuanto más lejos esté la casilla del propio castillo, mayor es el bonus (0,20 base + hasta 0,10 proporcional a la distancia al castillo propio).

### Terreno

`G.ter[i]` vale 0 vacío (fuera del mapa), 1 pasto, 2 arena, 3 agua, 4 árbol o **5 montaña**. Agua, árboles, montañas y vacío siguen marcados en `G.solid` (no se construye, no nacen piezas, cortan la vista del vigía), **pero desde v16 el agua se puede ocupar** en la superficie: `passable` la deja pasar y la regla `navStep` decide cuándo se entra o se sale (sección 1c). El caballo salta por encima de agua y árboles, pero **no** de montañas. **Desde v20 los árboles se pueden talar**: al caer, la casilla pasa a pasto (`ter` = 1, `solid` = 0) (sección 1g). Es el único cambio de terreno durante la partida en la superficie. Desde v26 algunos árboles llevan una **hierba** (`G.herbs`, sección 1m); al caer el árbol, la hierba que quedara se pierde.

El mapa se genera con **simetría puntual**: la casilla (x,y) es igual a (N-1-x, N-1-y), así que es justo para los dos bandos (también la elevación). Además se garantiza un camino por tierra entre las bases.

#### Montañas (terreno 5)

- Se generan en `genMap` con un ruido simétrico propio (`M`), después de la arena y antes de los bosques, solo sobre pasto o arena a más de `mD` casillas de cualquier base (`mD` = 5,5 si N < 20; si no, 7,5).
- Umbral por percentil (`pct`): el 28 % más alto de las candidatas en mapas chicos y el 15 % en el resto. Se descartan picos sueltos: una casilla queda como montaña solo si tiene al menos 2 vecinas montaña (8 direcciones).
- Son sólidas: no se puede pararse, construir (`canPlace`), atravesar deslizando ni saltarlas con el caballo. También cortan la línea de visión del peón vigía (porque usa `G.solid`).
- Si bloquean el único camino entre bases, `genMap` devuelve `null` y `buildMap` reintenta (hasta 40 semillas; si no, usa `carve`, que abre la diagonal).
- Se dibujan con `drawMountain(x,y)` dentro de la lista de objetos ordenada por profundidad de `draw()`: 1 a 3 picos piramidales por casilla (caras sombreadas, grietas y nieve si el pico supera 0,9·`tw`). Las casillas interiores del macizo (más vecinas montaña) son más altas. El minimapa las pinta de gris (`#8b8478`).

#### Elevación visual (`G.elev`)

- `G.elev[N*N]` es un `Uint8Array` con niveles **0, 1 o 2** (`ELEV_MAX` = 2). Se calcula al final de `genMap` con `Hn·0,65 + M·0,35` (así las montañas tienden a quedar en zonas altas) y percentiles 50 % y 80 % sobre las casillas no vacías y no agua a 6 o más casillas de una base.
- Las bases (a menos de 6 casillas) y el agua quedan en nivel 0. Un suavizado garantiza que dos casillas vecinas ortogonales no vacías difieran como máximo en 1 nivel.
- **Es solo gráfico:** no cambia movimiento, costos, alcance ni combate.
- Cada nivel sube la casilla `EH()` = `th·ELEV_K` píxeles en pantalla (`ELEV_K` = 0,35).
- `drawTerrain` dibuja las casillas de atrás hacia adelante (`terrainOrder()`, cacheado por N y rotación). Para cada casilla dibuja primero los **faldones** de las caras visibles (+vx y +vy de la vista) cuando la vecina es más baja o vacía: pared de tierra, una línea de estrato por nivel intermedio y un **bisel** del color del terreno arriba (`lipColor`). Las casillas altas se aclaran un 6 % por nivel (`tileColor`).
- Limitación conocida: piezas, árboles y edificios se dibujan después de todo el terreno, así que una pieza parada detrás de un escalón alto no queda tapada por él (la diferencia es de pocos píxeles).

## 1b. Subsuelo y túneles (v15)

### Capas
- Cada pieza tiene `u.layer`: **0 = superficie**, **1 = subsuelo**. `addU(team,type,x,y,layer=0)`.
- `G.occ` y `G.res` son **arreglos por capa**: `G.occ[layer][i]`, `G.res[layer][i]`. Las piezas de distinta capa no chocan, no se capturan (`findCapturable` filtra por capa) y no se ven entre sí.
- `passable(L,i)` (desde v18 las piezas usan `passFor(u,i)`, que además deja salir de la huella de `u.evac`; ver 1e): en la capa 0 es «no sólido **o agua**» y «sin edificio **o con un puerto terminado**» (v16); en la capa 1 es `G.ug[i] === UG_OPEN`. `blockedFor`, `updSlide`, `updJump` y `orderMove` usan esta función.
- Los edificios, árboles, montañas, cristales y la elevación existen solo en la superficie. Las piezas del subsuelo no golpean edificios (`findBInRange` devuelve null) ni recolectan cristales (`harvesting` exige capa 0).
- El caballo, en el subsuelo, no puede saltar por encima de **roca** (`knightBlocked(x,y,nx,ny,L)`; en la superficie siguen siendo las montañas). Sí puede saltar por encima de tierra sin excavar.

### Vista (`viewLayer`)
- Variable global `viewLayer` (0 o 1). Se cambia con `setView(L)`: botón `#layerBtn` (arriba a la izquierda del minimapa; muestra ⛏ Subsuelo o 🌱 Superficie), tecla **Tab** o **V**. La letra V queda reservada y no se asigna como atajo del panel.
- `setView` cancela los modos `place`/`spawn` y, al bajar, deselecciona el edificio. **La selección de piezas se conserva entre capas**, pero las órdenes de toque solo afectan a las piezas de la capa que se mira.
- Canvas: con `viewLayer = 1` se dibuja `drawUnderground()` en lugar de `drawTerrain()`; solo se dibujan piezas, efectos (`f.layer`) y rutas de esa capa. Los efectos sin `layer` se ven en las dos capas.
- Minimapa: en el subsuelo pinta `G.ug` (tierra marrón, túnel claro, roca gris oscura). Las bocas de túnel (amarillas) se ven en las dos capas.
- Alturas en pantalla: `tileZ(x,y)` devuelve la elevación en la superficie y, en el subsuelo, `ugH(i)` (tierra = 0,42·`th`, roca = 0,62·`th`, abierto = 0). `tilePts` y `unIsoE` la usan; `zAt` devuelve 0 en el subsuelo (las piezas solo pisan casillas abiertas).

### Mapa subterráneo (`G.ug[N*N]`)
- Valores: `UG_EARTH` = 0 (tierra excavable), `UG_OPEN` = 1 (túnel abierto), `UG_ROCK` = 2 (roca/abismo inexcavable), `UG_OUT` = 3 (fuera del mapa).
- Se genera en `newGame` con `genUnderground()`, después de colocar los castillos, con ruido simétrico (`noiseField`):
  - **Cámara de 5×5** abierta bajo cada castillo: distancia de Chebyshev ≤ 2 al centro del castillo (`chamberRect`, `inChamber`, `chamberCells`).
  - **Vetas de roca:** casillas cuyo ruido `R` queda cerca de su mediana (el 11 % más cercano), a más de 3,5 casillas de una cámara.
  - **Cavernas:** el 12 % más alto del ruido `C`, a más de 4,5 casillas de una cámara.
  - `ugConnected` comprueba que las dos cámaras se puedan unir cavando sin cruzar roca; si no, reintenta (hasta 30 veces) y, como último recurso, convierte la roca en tierra.
- `G.digP[N*N]`: progreso de excavación (0..1) por casilla. Persiste si el peón se va.
- `G.holes[N*N]`: 1 si hay boca de túnel en esa casilla. Conecta (x,y) de las dos capas. `canPlace` no deja construir encima.

### Bajar y subir por el castillo
- Con piezas seleccionadas, tocar (o clic derecho en) el **propio castillo**: el rey recibe `{k:'enter'}` como antes y el resto recibe `{k:'down',id}` (`orderDown`). Bajan todas menos el rey y el peón vigía (`canDescend(u)`).
- `think` con `down`: camina hasta una casilla adyacente al castillo y llama a `changeLayer(u,1,cámara)`, que la ubica en la casilla libre de la cámara más cercana.
- Botón del panel **«Subir por el castillo»** (aparece si hay piezas seleccionadas en el subsuelo): `orderUp` → `{k:'up',id}`. La pieza camina hasta la cámara y sube a una casilla libre del anillo del castillo.
- `changeLayer(u,to,cells)` es la **única** forma de cambiar de capa: actualiza `G.occ` de las dos capas, limpia la orden y respeta el color del alfil.

### Excavar (solo peones en el subsuelo)
- Con peones del subsuelo seleccionados, tocar tierra → `orderDig` → `{k:'dig',x,y}`. Las demás piezas seleccionadas se acercan con `orderMove`.
- `think` con `dig`: busca camino con `plan(u,…,digMoves)`, que acepta **túnel y tierra** (la tierra cuesta `DIG_TIME` extra), hasta una casilla **ortogonalmente** adyacente al objetivo. Si el próximo paso es tierra, el peón la excava antes de avanzar, así que **una orden lejana cava todo el túnel**.
- Mientras cava, `u.dig = {x,y,g}` y el bucle llama a `digTick` en lugar de `think`: suma `dt / DIG_TIME` (2,5 s) a `G.digP`, genera polvo (`fx` tipo `'dust'`) y al llegar a 1 convierte la casilla en `UG_OPEN`. Varios peones sobre la misma casilla suman velocidad. La barra de progreso se dibuja sobre el bloque de tierra.
- En el subsuelo los peones no construyen (los botones de construcción solo aparecen si hay peones en la superficie) y no pueden mejorarse a vigía.

### Boca de túnel (sacrificio del peón)
- `holeOK(u)`: peón no vigía, en el subsuelo, quieto, sobre túnel abierto, y en la superficie esa casilla no es sólida (agua, árbol, montaña), no tiene edificio ni boca.
- Si se cumple con un solo peón seleccionado, aparece el botón **«Abrir salida a superficie (sacrifica peón)»** → `u.goal = {k:'surface',t:0}`.
- `surfaceTick` (en el bucle) suma tiempo hasta `SURFACE_TIME` (3 s), con barra sobre el peón y polvo. Después marca `G.holes[i] = 1` y mata al peón (`kill`).
- **Usar la boca:** tocar la boca con piezas de la capa que se mira → `orderPortal` → `{k:'portal',x,y,from}`. La pieza camina hasta la boca o una casilla vecina (8 direcciones) y cambia de capa en la boca o en la casilla libre más cercana alrededor. Funciona en los dos sentidos. El rey no la usa.
- Dibujo: en la superficie, pozo con borde de madera y escalera (`drawHole(x,y,0)`); en el subsuelo, luz que entra y escalera (`drawHole(x,y,1)`).

### Órdenes nuevas de `goal`
- `{k:'down',id}`, `{k:'up',id}`, `{k:'portal',x,y,from}`, `{k:'dig',x,y}`, `{k:'surface',t}`.

### IA
- La IA no usa el subsuelo. Solo defiende contra piezas en la superficie, y sus órdenes de ataque se cancelan si el objetivo está en otra capa.

## 1c. Puerto y navegación (v16)

### Edificio
- `BDEF.puerto = {icon:'⚓', name:'Puerto', hp:16, cost:80, build:10, w:1, h:1, pop:0, wall:0.25, dock:1}`. Está en `BICON` (`⚓`) y en `BUILDABLE`, así que aparece en el panel de construcción del peón. No produce piezas.
- `canPlace(bx,by,w,h,type)` recibe ahora el **tipo**. Si `type === 'puerto'` exige además: `viewLayer === 0`, casilla de pasto o arena (`ter` 1 o 2) y al menos una casilla **ortogonal** de agua (`isWater`). Todas las llamadas pasan el tipo (`placeTap`, fantasma de `draw()`, `aiBuild`).
- Se construye y se destruye como cualquier edificio (`addB`, peones con `{k:'build'}`, `hit`, `destroyB`). Si se destruye con piezas encima, la casilla vuelve a ser tierra común y las piezas que estén en el agua quedan sin esa salida.
- El puerto **no es de un bando para pisarlo**: cualquier pieza (propia o enemiga) puede usar un puerto terminado. El enemigo lo puede atacar con `atkB` como a cualquier edificio.

### Helpers (sección `/* ---------- navegación ---------- */`, justo antes de `passable`)
- `isWater(x,y)`: `G.ter[idx(x,y)] === 3` (con control de borde).
- `portB(id)`: el edificio con ese id es un `puerto` con `b.done`.
- `isPort(x,y)`: hay un puerto terminado en (x,y).
- `navKind(x,y)`: **0 tierra, 1 agua, 2 puerto**.
- `navStep(a,b)`: `a===2 || b===2 || a===b`. Es decir: tierra↔tierra, agua↔agua y cualquier cosa desde/hacia un puerto; **nunca tierra→agua ni agua→tierra directo**.

### Pasabilidad
- `passable(0,i)` deja pisar el agua y el puerto terminado (es el único edificio pisable). Como `blockedFor`, `updSlide` y `updJump` usan `passable`, el cambio cubre las tres funciones. Un puerto **en construcción** sigue bloqueando como cualquier edificio.
- `free()` no cambió: el agua y los puertos no sirven como casilla de nacimiento ni para construir.
- `changeLayer` no deja aparecer en el agua al subir a la superficie (castillo o boca de túnel).

### Regla de transición (solo capa 0)
- `eachMove`: cada paso del peón y del rey, y cada salto del caballo, exige `navStep(navKind(origen), navKind(destino))`. El caballo sigue saltando agua de tierra a tierra (los casilleros intermedios no cuentan), pero solo aterriza en agua si sale de un puerto o de otra agua, y solo vuelve a tierra aterrizando en un puerto o saliendo de uno.
- **Deslizantes** (`alfil`, `torre`, `dama`): a lo largo del rayo se aplica `navStep` casilla por casilla y, **al pisar un puerto, el rayo termina ahí** (se agrega como destino y se corta). Resultado: desde tierra solo se desliza por tierra hasta un puerto; desde un puerto, por agua o por tierra; desde el agua, por agua hasta un puerto. Un solo movimiento nunca cruza tierra↔agua.
- `captureCells`: misma regla. En las piezas de un paso, `navStep(origen, objetivo)`; en las deslizantes, un puerto intermedio corta el rayo y el objetivo tiene que cumplir `navStep` con la casilla anterior. Esto vale también para golpear edificios (`bCellIn`): desde el agua solo se golpean puertos, no edificios en tierra (la casilla de un edificio común cuenta como tierra).
- `plan()` (Dijkstra) usa `eachMove`, así que encuentra solo la ruta «caminar hasta un puerto → pisarlo → salir al agua» y la inversa. No hubo que tocar `plan`.

### `orderMove`
- Si el destino tocado es agua, las casillas candidatas para repartir el grupo son **agua o puerto**; si es tierra, **tierra o puerto**. Así un grupo mandado a la orilla no reparte piezas al agua (que las obligaría a rodear hasta un puerto).

### Entrada
- `tap` y `desktopOrder`: con piezas propias seleccionadas, tocar (o clic derecho en) un **puerto propio terminado** da `orderMove` a esa casilla en vez de seleccionar el edificio. Sin piezas seleccionadas, el toque lo selecciona como siempre. Un puerto enemigo con piezas seleccionadas se ataca (`orderAtkB`).
- `buildingAt` ignora el puerto en la búsqueda por recuadro (es plano): solo cuenta tocar su casilla, así no tapa el agua de atrás.

### Dibujo
- `drawB` desvía a `drawDock(b)` cuando `BDEF[b.type].dock`: plataforma baja de 6 tablones (altura `tw·wall·0,45`), canto con franja del color del bando, pilotes (los que caen sobre agua bajan hasta el nivel del agua) y un bolardo con soga en la esquina trasera derecha con el ícono ⚓ (`glyph`, color del bando). El muelle se estira 0,24 casillas sobre la primera casilla de agua vecina. En construcción se ve translúcido y los tablones aparecen de a uno según `b.prog`.
- `drawU`: si la pieza está en la capa 0, con `u.air === 0` y la casilla que se ve debajo (`Math.round(u.px)`, `Math.round(u.py)`) es agua, en lugar de la sombra se llama a `drawBoat(sx,sy,team)`: aro doble de espuma, casco de madera con franja del bando y piso de tablas; la pieza se balancea suavemente (`sin(G.t)`). Se usa la posición dibujada y no `u.x/u.y` para que el bote aparezca cuando la pieza efectivamente llega al agua (en un deslizamiento `u.x` ya apunta al destino).

### Interfaz
- Panel del puerto seleccionado: mensaje propio («puerta entre tierra y agua…»).
- `sig()` incluye el umbral de oro 80 para que el botón del Puerto se habilite a tiempo.
- Una línea sobre el Puerto en la ayuda de `#start`.

### IA
- La IA no construye puertos, pero sus piezas usan los que existan porque `plan` los encuentra solo.

## 1d. Barra de estado / HUD (v17)

Fila de botones-ícono `#hud` (posición fija, `right:8px; bottom:148px`, justo arriba de `#mapDock`). En celular (≤ 600 px) se achica y se parte en dos filas (`max-width:152px`). Todo se refiere al bando activo `me` (en modo humano cambia al tocar piezas del otro color); el puntaje muestra los dos bandos.

| Botón | id | Muestra | Al tocar |
|---|---|---|---|
| 💤 | `hIdleP` | cantidad de **peones ociosos** (`idlePeon`): peón propio, no vigía, quieto, sin `goal`, sin `dig` y **sin estar cosechando cristal**. Se pinta amarillo (`warn`) si hay alguno. | Elige el siguiente peón ocioso y centra la cámara (ciclo por id, `hudCycle.p`). **Mayús+clic**: elige a todos los ociosos de la capa que se mira (o de la capa del primero). Tecla **`.`** (Mayús+`.` = todos). |
| ⚔ | `hIdleA` | **piezas de combate ociosas** (`idleArmy`): todo lo que no es peón (incluido el rey afuera), quieto y sin `goal`. | Igual que el anterior (`hudCycle.a`). Tecla **`,`**. |
| 🏭 | `hIdleB` | **edificios productores sin cola** (`idleBuilding`): propio, terminado, con `makes` y `queue` vacía (incluye el castillo). | Selecciona el siguiente y centra la cámara (`hudCycle.b`). Abre su panel de producción. |
| ♚ | `hKing` | `kingInfo()`: vida del rey si está **afuera** (en amarillo), `adentro`, `en cola` o `—` (no hay rey). | Si está afuera, lo selecciona y centra; si no, selecciona el castillo. |
| ⚠ | `hAlert` | segundos (o minutos) desde el **último ataque recibido**. Parpadea en rojo (`alarm`) los primeros 5 s. | Centra la cámara en el lugar del ataque y cambia a su capa. |
| 🏆 | `hScore` | puntaje total `Blancas·Negras` (en modo IA: `vos·rival`). | Abre/cierra `#scoreBox`, una tabla con el detalle por categoría (`scoreOpen`). |
| ⏱ | `hClock` | tiempo de partida `m:ss` (`G.t`). No es botón (`div.clock`). | — |

### Datos nuevos en `G`
- `G.st[team] = {earned, kills, razed, upg}`:
  - `earned`: oro total ganado. Se suma en `update(dt)` junto con `G.gold` (el bucle de ingreso ahora es `for(const t of [0,1]){const g=income(t)*dt; G.gold[t]+=g; G.st[t].earned+=g;}`).
  - `kills`: suma de `VALUE` de las piezas enemigas matadas. Se suma en `strike(v,k)` cuando `k` es de otro bando y la víctima queda con `hp<=0` (incluye flechas de vigía).
  - `razed`: costo (`BDEF.cost`, el castillo cuenta 300) de los edificios enemigos destruidos con `hit`. Eliminar edificios propios con Supr no suma.
  - `upg`: mejoras compradas (`upgradeUnit`).
- `G.alert[team] = {x,y,t,layer}` | `null`: último golpe recibido por ese bando. Se escribe en `strike` (víctima pieza, con atacante de otro bando) y en `hit` (víctima edificio).

### Puntaje (`score(t)`)
- **Militar** = `kills·10 + floor(razed/2)`
- **Economía** = `floor(earned/10)`
- **Sociedad** = suma de `floor(cost/10)` de los edificios propios terminados que siguen en pie (castillo = 30)
- **Técnica** = `upg·5`
- **Total** = suma de las cuatro. Es una fórmula propia, inspirada en el puntaje de Age of Empires; no afecta la jugabilidad.

### Minimapa
- `drawMini` dibuja un anillo parpadeante (rojo/amarillo) en `G.alert[me]` durante 5 s después de un ataque.

### Código (sección `/* ---------- barra de estado (HUD estilo Age of Empires) ---------- */`, justo antes de `frame`)
- Estado: `hudCycle={p,a,b}` (índices de ciclo), `scoreOpen`, `lastHud`. `newGame` los reinicia y oculta `#scoreBox`.
- `idlePeon`, `idleArmy`, `idleBuilding`, `idleList(k)` (k = `'p'|'a'|'b'`, ordenado por id).
- `hudGo(x,y,L)`: `setView(L)` + `centerOn` + `clampCam`. `hudSelectUnit(u)`, `hudCycleGo(k,all)`, `kingInfo()`.
- `setHb(el,txt,cls)`: cambia el texto `<small>` y una sola clase de estado (`zero` atenuado, `warn` amarillo, `alarm` rojo parpadeante) sin rehacer el DOM.
- `refreshHud(now)`: se llama en `frame` y se recalcula como máximo cada 200 ms.
- Teclado: un `keydown` propio para `.` y `,` (no chocan con los atajos de letras del panel).
- Ayuda del menú `#start`: línea nueva «Íconos de estado».

## 1e. Construir encima de piezas propias (v18)

Antes, `canPlace` exigía `free(x,y)` en cada casilla de la huella, así que no se podía construir donde estaba parado un peón (justo donde suele estar el que construye). Ahora las piezas propias que estén en la huella se apartan solas.

### `canPlace(bx,by,w,h,type,team=me)`
- Cada casilla de la huella tiene que cumplir `inB`, `!G.solid`, `!G.bmap`, `!G.res[0]` y `!G.holes` (ya no se usa `free`).
- Si la casilla tiene una pieza en `G.occ[0][i]`, la colocación solo es válida si la pieza es **del bando `team`**, **no es vigía** y `canEvacuate` le encuentra una casilla de escape. Un `Set` `taken` evita que dos piezas de la misma huella reserven la misma casilla.
- Las piezas del subsuelo no cuentan (solo se mira la capa 0).
- La regla del puerto (`type === 'puerto'`) no cambió.
- `team` toma `me` por defecto. Lo usan `placeTap` y el fantasma de `draw()`. `aiBuild` no pasa `team`: en modo IA `me` siempre es 0, así que para la IA (bando 1) sus propias piezas siguen bloqueando como antes (la IA **no** usa la evacuación).

### `canEvacuate(u,bx,by,w,h,taken,team=me)`
- Devuelve la casilla `[rx,ry]` **más cercana** a la pieza dentro de `ring({bx,by,w,h})`, o `null`.
- Exige: pieza del bando `team`, en la capa 0, no vigía. La casilla tiene que ser `passable(0,i)`, sin pieza (`G.occ[0]`), sin reserva de caballo (`G.res[0]`), fuera de `taken`, respetar el color del alfil (`((rx+ry)&1) === ((u.x+u.y)&1)`) y `navStep(navKind(u.x,u.y), navKind(rx,ry))`.
- No verifica que exista un camino real; la ruta la busca después `plan`.

### `evacuateFootprint(b)`
- Se llama en `placeTap` inmediatamente después de `addB(...)` y **antes** de asignar las órdenes `{k:'build'}` a los peones elegidos.
- Para cada pieza propia (no vigía, capa 0) en `bCells(b)`: pone `u.evac = b.id`, busca su casilla con `canEvacuate` (con su propio `taken`) y le da `u.goal = {k:'move',x:rx,y:ry}`, `plan = null`, `fails = 0`.
- Un peón elegido que estaba adentro recibe enseguida la orden de construir (pisa la de mover), pero igual sale: `think` busca una casilla `adjB`, que siempre está afuera de la huella, y `u.evac` le permite atravesarla.

### Salir de la huella: `u.evac` y `passFor(u,i)`
- `passFor(u,i)` = `passable(u.layer,i)` **o** (capa 0, `u.evac` definido, `G.bmap[i] === u.evac` y la casilla no es sólida).
- `blockedFor`, `updSlide` y `updJump` usan ahora `passFor` en lugar de `passable`. `eachMove`, `captureCells` y `plan` lo heredan a través de `blockedFor`.
- En `update`, en la rama de pieza quieta, `u.evac` se borra cuando la pieza ya no está sobre una casilla de ese edificio (salió, o el edificio se destruyó).
- Diferencia con lo pedido: `passFor` no exige `!b.done`. Si el edificio se terminara con una pieza todavía adentro, la pieza igual puede salir en vez de quedar atrapada.
- El resto de las piezas sigue viendo el edificio en construcción como bloqueante.

### Dibujo e interfaz
- No hubo cambios visuales. Mientras sale, la pieza se dibuja un instante dentro del edificio.

## 1f. Sombra del edificio y clic derecho para construir (v19)

### El fantasma sigue al mouse (`pointermove`)
- Al principio del listener `pointermove` del canvas: si `mode === 'place'`, `e.pointerType === 'mouse'` y la partida corre, se recalcula `G.ghost` con `unIsoE(e.clientX,e.clientY)`:
  `G.ghost = {bx: clamp(round(fx - w/2)), by: clamp(round(fy - h/2)), w, h}` (acotado a `0..N-w` y `0..N-h`). Es la misma fórmula que usa `placeTap`.
- Funciona con el mouse sin apretar (hover). En táctil no cambia nada: se sigue tocando dónde va y después el verde.
- Con esa fórmula, el cursor queda sobre la casilla central de la huella (en 2×2, la casilla de arriba a la izquierda del centro); cerca del borde entre casillas el redondeo puede saltar una casilla.

### Dibujo de la sombra (`draw()`)
- Las baldosas verdes/rojas de siempre siguen; ahora `canPlace` se llama con `me` explícito.
- Si `mode === 'place' && G.ghost && !viewLayer`, se agrega a la lista `items` (ordenada por profundidad, `depth(bx+w/2, by+h/2)`) un edificio temporal `gb = {id:-1, team:me, type:placeType, bx, by, w, h, done:true, prog:1, hp:BDEF.hp, queue:[]}` que se dibuja con `drawB(gb)` (o `drawDock` si es un puerto) al 45 % de opacidad, más un borde punteado (`tilePtsRect`) **verde** `#50e678` si es válido o **rojo** `#f0463c` si no (válido = `canPlace` y oro suficiente).
- **`bAlpha`** (global, normalmente 1): `drawB` y `drawDock` asignan `ctx.globalAlpha` por su cuenta (1, 0,65 o 0,7), lo que pisaría cualquier transparencia puesta desde afuera. Ahora multiplican por `bAlpha` y, donde antes volvían a 1, vuelven a `bAlpha`. La sombra pone `bAlpha = 0.45` dentro de `ctx.save()/restore()` y lo devuelve a 1 en un `finally`.
- `drawBars` no dibuja nada si `b.id === -1` (la sombra no tiene barras de vida ni de cola).
- `gb` no está en `G.B` ni en `G.bmap`: no afecta la lógica, selección ni toques.

### Clic derecho construye (`endPtr`)
- En la rama del mouse con botón no izquierdo (`panM`), al soltar el **derecho sin arrastrar**:
  - si `mode === 'place'`: recalcula `G.ghost` en el punto del clic y llama a `placeTap({x:G.ghost.bx, y:G.ghost.by, fx, fy})`. Si el lugar es válido y alcanza el oro, construye (resta el oro, `addB`, `evacuateFootprint`, órdenes de construir a los peones elegidos, `mode = 'none'`). Si no, el modo sigue activo.
  - si no: `desktopOrder` como antes (que cancela `mode`, por eso no se llama en modo construcción).
- El clic izquierdo sigue funcionando como antes (pasa por `tap` → `placeTap`): como el fantasma ya está bajo el cursor, un clic izquierdo sobre él también confirma.
- Arrastrar con el derecho sigue moviendo la cámara; la sombra sigue al cursor mientras tanto.

### Panel
- Mensaje de `refreshPanel()` en modo `place`: «🐎 Establo 2×2: clic derecho para construir (en táctil: tocá dónde va y tocá el verde).»

## 1g. Tala de árboles y velocidad del juego (v20)

### Tala de árboles (peones con hachita)
- **Cómo se usa:** con peones elegidos en la superficie, tocar un árbol (o clic derecho en PC). Los peones van a cualquiera de las **8 casillas vecinas** del árbol y lo talan. Las demás piezas elegidas que no son peones solo se acercan (`orderMove`). Sin peones elegidos, tocar un árbol funciona como antes (mover cerca).
- **Tiempo:** `CHOP_TIME` = 30 s para un peón. Cada peón al lado suma `dt / CHOP_TIME` por cuadro, así que 2 peones tardan 15 s, 3 peones 10 s. El progreso (`G.chopP[i]`, 0..1) **persiste** si los peones se van y vuelven.
- **Resultado:** `fellTree(x,y)` pone `G.ter[i] = 1` (pasto), `G.solid[i] = 0`, borra el progreso y anula `miniTerrain` para que el minimapa se redibuje. La casilla queda pisable, construible (`canPlace`), apta para nacer piezas (`free`), para abrir una boca de túnel (`holeOK`) y deja pasar la línea de visión del vigía. No da oro ni recursos: solo despeja.
- **Talado automático:** cuando el árbol cae, en el siguiente `think` el peón busca el **árbol más cercano** a su posición (`nearestTree`, hasta `CHOP_RADIUS` = 8 casillas, distancia euclídea) y sigue talando. Sigue así hasta que no quede ninguno en el radio (queda ocioso y aparece en 💤) o hasta que el jugador le dé **cualquier otra orden** (mover, atacar, construir, etc. pisan `u.goal`).
- Si no puede llegar a un árbol (rodeado de agua, montañas o de otros peones que ocupan las 8 vecinas) durante más de 12 intentos (`u.fails > 12`), agrega ese árbol a `goal.skip` (un `Set` de índices que viaja con la orden) y pasa al siguiente más cercano. Así un grupo grande de peones se reparte solo entre varios árboles.
- Varios peones pueden elegir el mismo árbol: lo talan juntos y suman velocidad.
- La IA no tala. Los vigías no talan (no se mueven) y mejorar un peón a vigía mientras tala cancela la orden (`upgradeUnit` limpia `goal`).

### Abrir camino talando (orden de mover)
- Cuando un **peón** (no vigía, superficie) tiene orden `{k:'move'}` y `plan` **no encuentra camino libre** hasta el destino, `think` vuelve a planear con `chopMoves`, que también acepta casillas de **árbol** con un costo extra de `CHOP_TIME`. Solo se usa si ese segundo plan llega (`q.found`). Si existe un camino libre, aunque sea largo, se usa ese y no se tala nada.
- Si el próximo paso del camino es un árbol, el peón se queda al lado (ortogonal, porque el peón camina recto) y lo tala: `u.cut = {x,y,g}` (`g` = la orden de mover). Mientras `u.cut` existe, el bucle llama a `cutTick` en lugar de `think` (igual que `u.dig` con `digTick` en el subsuelo). Al caer el árbol, `u.cut = null` y `think` vuelve a planear; si queda más bosque, sigue talando.
- `cutTick` anula `u.cut` si la orden cambió (`u.goal !== c.g`), si el árbol ya no está, si la pieza cambió de capa o se volvió vigía, o si ya no está al lado. Por eso cualquier orden nueva lo frena.
- Las demás piezas no talan: si no hay camino, se acercan lo más posible como siempre.
- La tala para abrir camino usa el mismo progreso (`G.chopP`), los mismos efectos y la misma hachita; varios peones que pasan por el mismo árbol suman velocidad.
- `plan` ahora marca en el arreglo devuelto `path.found` (`true` si llega al objetivo; `false` si es solo el camino hasta lo más cerca posible). Un camino vacío con objetivo alcanzado devuelve `[]` con `found = true`. El resto del código no usa esa propiedad, así que no cambia nada más.

### Código (sección `/* ---------- tala de árboles ... ---------- */`, después de `surfaceTick`)
- `CHOP_TIME` = 30 y `CHOP_RADIUS` = 8 (constantes, junto a `DIG_TIME`).
- `nextTo(u,x,y)`: distancia de Chebyshev = 1 (8 vecinas).
- `chopping(u)`: orden `{k:'chop',x,y}`, peón no vigía, capa 0, quieto (`state==='idle'`), al lado del árbol y el árbol sigue en pie (`G.ter===4`).
- `chopHit(u,x,y,dt)`: el hachazo compartido por la tala y abrir camino.
- `cutTick(u,dt)`: tala el árbol de `u.cut` (abrir camino; ver arriba).
- `chopMoves(u,x,y,fn)`: vecinos del peón para `plan` al abrir camino: pasos normales (con `navStep`) o un árbol con costo `speed + cd + CHOP_TIME`.
- `chopTick(u,dt)`: llama a `chopHit` sobre el árbol de la orden `chop`; pone `u.building = true` (el peón rebota como cuando construye), suma progreso, guarda `G.chopAt[i] = G.t` (para que el árbol tiemble) y genera astillas (`fx` tipo `'chip'`). Al llegar a 1 llama a `fellTree`.
- `fellTree(x,y)`: cambia el terreno y genera los efectos `'leaves'`, `'chip'` y `'dust'`.
- `nearestTree(u,skip)`: árbol más cercano a la pieza dentro de `CHOP_RADIUS`, que no esté en `skip` y que tenga al menos una vecina (8 direcciones) `passable(0,…)` y que no sea agua. Devuelve `[x,y]` o `null`.
- `nextChop(u,skip)`: le da `{k:'chop',x,y,skip}` con el resultado de `nearestTree`, o `goal = null` si no hay.
- `orderChop(ids,x,y)`: da `{k:'chop',x,y}` a los peones no vigías de la capa 0 y una marca color madera. Devuelve cuántos recibieron la orden.
- `think`: rama `g.k==='chop'` dentro del bloque de órdenes. Si la pieza no es peón de superficie, borra la orden. Si el árbol ya cayó, llama a `nextChop` (talado automático). Si está al lado, `plan = null` y espera. Si no, busca camino con `plan` hasta una vecina del árbol; si no hay camino suma `fails` y, pasado 12, salta a otro árbol (no usa `follow`, que borraría la orden).
- `update`: en la rama de pieza quieta, después de `think`/`surfaceTick` y antes de la construcción: `if(chopping(u)) chopTick(u,dt);`.
- `cellOrder(cell)`: si `viewLayer === 0` y la casilla es árbol, llama a `orderChop` y manda a las demás piezas con `orderMove`. Lo usan `tap` y `desktopOrder`, así que funciona igual en táctil y con clic derecho.

### Estado nuevo en `G`
- `G.chopP[N*N]` (`Float32Array`): progreso de tala 0..1 por casilla.
- `G.chopAt[N*N]` (`Float32Array`, inicial −9): último `G.t` en que se dio un hachazo a ese árbol.

### Dibujo
- `drawAxe(x,y,dir,s)`: hachita (mango de madera con contorno, hoja gris con filo claro). Gira alrededor de la mano: ángulo `dir·(−0,55 + 1,45·k²)` con `k = 0,5 + 0,5·sin(G.t·9)`, o sea se levanta hacia atrás y golpea hacia el árbol. `dir` = 1 si el árbol queda a la derecha en pantalla, −1 si queda a la izquierda.
- `drawU`: si `u.building` y la pieza tiene `u.cut` o la orden es `chop`, dibuja la hachita al costado del glifo del lado del árbol (`sx + dir·gfs·0,24`, a media altura de la pieza).
- `drawTree`: tiembla (`sin(G.t·45)`) los 0,15 s siguientes a cada hachazo; si `chopP > 0`, dibuja una muesca clara en el tronco y una barra de progreso color madera arriba de la copa. La sombra queda quieta.
- Efectos nuevos en `draw()`: `'chip'` (astillas que saltan en arco) y `'leaves'` (la copa se deshace al caer).

### Interfaz de la tala
- Panel con un peón de superficie elegido: «· Tocá un árbol para talarlo 🪓» o, mientras tiene la orden, «· 🪓 Talando (≈30 s por árbol); sigue solo con el más cercano». Con varias piezas que incluyen peones de superficie: «· árbol = talar 🪓». Mientras abre camino: «· 🪓 Abriendo camino: tala el árbol que le tapa el paso». `sig()` incluye si cada pieza elegida tiene orden `chop` o `u.cut`.
- Ayuda del menú `#start`: líneas nuevas «Talar árboles» y «Velocidad».

### Velocidad del juego
- **Control:** `#speed` (posición fija, `top:48px; right:8px`, justo debajo de `#rot`) con un `<select id="spdSel">`: 0,75x · 1x · 1,25x · 1,5x · 1,75x · 2x. Se pinta amarillo (`fast`) si es > 1 y celeste (`slow`) si es < 1. Teclas **`+`** (o `=`) y **`−`** (o `_`) pasan a la velocidad siguiente / anterior de `SPEEDS`.
- **Variables:** `gameSpeed` (global, 1 por defecto) y `SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2]`. `setSpeed(v)` cambia la variable, el selector y su color. Después de elegir, el selector pierde el foco (`blur`) para que los atajos de teclado sigan andando (los `keydown` ignoran eventos con foco en un `SELECT`).
- **Cómo funciona:** en `frame(now)`, el `dt` real (tope 0,05 s) se multiplica por `gameSpeed` y se simula en **pasos de 0,05 s como máximo** (`while(left>0){update(min(0.05,left))}`), así a 2x no se saltean choques ni casillas. Todo lo que depende de `G.t` o del `dt` de `update` se acelera junto: movimientos, recargas, producción, construcción, tala, excavación, ingreso de oro, IA, efectos y el reloj ⏱ del HUD (que muestra tiempo **de juego**, no tiempo real).
- La cámara, el zoom, el panel y el minimapa no dependen de la velocidad (usan tiempo real o eventos).
- La velocidad elegida **se conserva** al volver al menú y empezar otra partida (no se reinicia en `newGame`).

## 1h. Alfil sanador y persistencia entre sesiones (v21)

### Curación pasiva
- Constantes (junto a `CHOP_RADIUS`): `HEAL_CD` = 1,0 s, `HEAL_AMOUNT` = 2, `HEAL_UPG` = 3 (alfil con `u.upgraded`).
- Campo nuevo en la pieza: `u.healCd` (0 al nacer). Se descuenta en `update` para **todas** las piezas, al lado de `u.hurt` (`if(u.healCd>0) u.healCd-=dt;`), así que el enfriamiento corre también mientras el alfil se mueve.
- `maxHp(v)` = `DEF[v.type].hp || 1`.
- `healTick(u)`: se llama en `update`, en la rama de pieza quieta, justo después de `chopTick`: `if(u.type==='alfil'&&u.state==='idle') healTick(u);`. Si `u.healCd > 0` no hace nada. Si no, revisa las 8 casillas vecinas con `G.occ[u.layer]` y elige una pieza `v` con: mismo bando, misma capa, distinta del alfil, `v.state !== 'jump'`, `nextTo(u,v.x,v.y)` y `v.hp < maxHp(v)`. Prioridad: la de la orden `heal` del alfil; si no, la de menor proporción `v.hp / maxHp(v)`. Le suma `HEAL_AMOUNT` (o `HEAL_UPG`) sin pasar del máximo, pone `u.healCd = HEAL_CD` y genera `{k:'heal', x:v.px, y:v.py, t:0, layer:v.layer}`.
- Si no hay nadie para curar, `healCd` queda en 0: el primer pulso sale apenas aparece una herida.
- La curación es independiente de la recarga de movimiento (`u.cd`) y del ataque: un alfil quieto puede curar y también capturar lo que tenga a tiro.
- Quién se puede herir sin morir: el **rey** (24 de vida) y cualquier pieza alcanzada por **flechas de vigía** (0,25 por flecha). Un pulso cura por completo a una pieza común; al rey lo regenera de a 2 (o 3).
- Funciona igual en el subsuelo (misma capa) y también para los alfiles de la IA (es pasivo; la IA no usa la orden activa).
- El color del alfil no es problema: de las 8 vecinas de una pieza, 4 son de cada color.

### Orden activa `{k:'heal', id}`
- `orderHeal(ids, tid)` (sección de órdenes, antes de `orderChop`): a cada alfil de `ids` del mismo bando y capa que `t = G.U.get(tid)`, con `u.id !== tid`, le da `u.goal = {k:'heal', id:tid}`, `plan = null`, `fails = 0`. Marca verde `#50e678` sobre `t`. Devuelve cuántos alfiles recibieron la orden.
- `think`, rama `g.k === 'heal'` (dentro del bloque de órdenes, antes de `chop`):
  - si `t` no existe, cambió de capa o la pieza ya no es alfil → `goal = null`;
  - si está al lado (`nextTo`) → `plan = null`; y si además `t` tiene la vida al máximo → `goal = null`;
  - si no está al lado → `follow(u, plan(u, (x,y) => Chebyshev(x,y,t) === 1, t.x, t.y), false)`. Como `follow` se recalcula al terminar cada movimiento, el alfil **persigue** a la pieza si se mueve.
- Mientras tiene la orden, el alfil no captura automáticamente (igual que con `move`); al llegar y quedar la pieza sana, la orden se borra y vuelve el comportamiento automático.

### Entrada
- **Táctil (`tap`)**: si se toca una pieza propia **herida** que **no** está en la selección y `orderHeal` encuentra al menos un alfil elegido, se da la orden y no se cambia la selección. Si no (pieza sana, pieza ya elegida o sin alfiles), sigue el comportamiento de antes (agregar/quitar de la selección).
- **PC (`desktopOrder`)**: clic derecho sobre **cualquier** pieza propia (herida o no) con alfiles elegidos → `orderHeal`. Las demás piezas elegidas que no reciben la orden se mueven a esa casilla como antes (`orderMove`, si la casilla es pisable). Si no hay alfiles válidos, todo sigue igual que en v20.

### Dibujo e interfaz
- `drawU`: la barra de vida ahora aparece también en piezas de 1 de vida heridas (`if(mx>1||u.hp<mx)`).
- `draw()`, efecto `'heal'`: tres cruces verdes `#50e678` que suben y un aro verde que se abre sobre la pieza curada (dura 0,8 s, como todos los efectos).
- `RULE.alfil`, ayuda de `#start` y panel: un alfil solo muestra «· Tocá una pieza propia herida para sanarla 💚» o «· 💚 Yendo a sanar»; varias piezas con algún alfil, «· pieza propia herida = sanar 💚». `sig()` incluye si cada pieza tiene orden `heal`.

### Persistencia (`localStorage`)
- Objeto `LS = {get(k), set(k,v)}` (junto a las constantes): envuelve `localStorage` en `try/catch`; si falla (modo privado, archivo bloqueado), devuelve `null` y el juego sigue igual.
- Claves: `LS_SPEED = 'ajedrez_rts_speed'` y `LS_MAP = 'ajedrez_rts_map'`. `MAP_SIZES = [16,24,32,44,56]`.
- **Velocidad:** `setSpeed(v)` guarda `v`. Justo después de definir `setSpeed`, se lee el valor guardado y, si está en `SPEEDS`, se llama a `setSpeed` (así `gameSpeed` y `#spdSel` arrancan con la velocidad anterior). Funciona para el selector y para las teclas `+`/`−`.
- **Mapa:** al tocar un botón `[data-n]` se guarda el tamaño y se resalta con `markMap(n)` (clase `.on`; CSS `button[data-n].on`, igual que `button.vs.on`). `savedMap()` devuelve el tamaño guardado o `null`. Al cargar la página: si hay uno guardado se resalta y se usa en `newGame(nSaved || 16)` (la partida de fondo detrás del menú). Si nunca se eligió, no se resalta ninguno y el fondo es 16.
- No se guarda el modo (humano/IA) ni nada de la partida.

## 1i. Cámara con las flechas del teclado (v22)

- Sección `/* ---------- cámara con las flechas del teclado ---------- */`, justo antes de `let last=performance.now()` y `frame`.
- `arrowKeys` (`Set` con las flechas apretadas) y `ARROW_DIR` (dirección en **pantalla** de cada flecha: arriba `[0,-1]`, abajo `[0,1]`, izquierda `[-1,0]`, derecha `[1,0]`). Como es dirección de pantalla, funciona igual con cualquier rotación de cámara (`rot`).
- `keydown`: si la tecla es una flecha y no hay Ctrl/Meta/Alt ni foco en `INPUT`/`TEXTAREA`/`SELECT`, hace `preventDefault` y la agrega. `keyup` la saca. `arrowFast` = estado de Mayús. En `blur` de la ventana se vacía el `Set` (para que no quede una flecha trabada al cambiar de pestaña).
- `arrowPan(dt)`: se llama en `frame` antes de `draw()`, con el `dt` **real** (no multiplicado por `gameSpeed`, como el resto de la cámara). Suma las direcciones (diagonal con dos flechas, normalizada), velocidad `max(450, tw·14)` px/s (×2,2 con Mayús), resta a `ox`/`oy` (la vista va hacia la flecha y el mapa se corre al revés) y llama a `clampCam()`. Solo actúa con `running`.
- No choca con otros atajos: los atajos de letras del panel ignoran teclas de más de un carácter, y el selector de velocidad pierde el foco al elegir.
- El rectángulo de vista del minimapa se actualiza solo (se redibuja cada 100 ms).

## 1j. Edificios transparentes cuando tapan piezas (v23)

- **Qué hace:** en la superficie, si la silueta de un edificio tapa en pantalla a alguna pieza (de cualquier bando) que se dibuja antes que él, el edificio se dibuja al **40 %** de opacidad (`OCC_ALPHA`). Entra y sale con un fundido lineal de **0,15 s** (`OCC_FADE`) en tiempo real (no depende de `gameSpeed`). Es **solo gráfico**: no cambia selección, toques, combate ni lógica.
- Constantes (junto a `HEAL_CD`): `OCC_ALPHA = 0.4`, `OCC_FADE = 0.15`.
- Sección `/* ---------- edificios transparentes cuando tapan piezas ---------- */`, justo después de `let bAlpha=1;`:
  - `occLast`: último `performance.now()` usado para el fundido.
  - `bSilhouette(b)`: hexágono en pantalla del prisma del edificio (esquinas izquierda/derecha/frente de la base en el nivel de elevación mínimo `bElev(b)[0]`, y esquinas izquierda/fondo/derecha de la tapa en el nivel máximo + altura). Altura = `tw·(wall·avance + techo)`: `roofH` en edificios con techo, 0,14 (almenas) en castillo y torreón; en construcción, la pared crece con `prog` y no hay techo. La bandera del castillo no cuenta.
  - `inPoly(x,y,pts)`: punto dentro de polígono (rayo par/impar).
  - `unitProbes()`: para cada pieza de la capa 0, su profundidad de dibujo (`depth(px+0,5, py+0,5) + 0,01`, la misma que usa `draw()`) y 5 puntos del glifo: base, medio, cabeza y dos costados (con la altura del caballo en el aire y la escala 1,65 del vigía).
  - `bHidesUnit(b,probes)`: `true` si alguna pieza con profundidad **menor** que la del edificio (`depth(bx+w/2, by+h/2)`, o sea, que se dibuja antes y queda debajo) tiene algún punto dentro de la silueta. Primero filtra por el rectángulo que encierra la silueta. El **puerto** nunca (es plano).
- `draw()`: en el armado de `items`, para cada edificio calcula el objetivo (1 si tapa, 0 si no), mueve `b.seeA` (0..1) hacia ese objetivo a razón de `odt / OCC_FADE` por cuadro (`odt` = tiempo real desde `occLast`, tope 0,1 s) y dibuja con opacidad `a = 1 − b.seeA·(1 − OCC_ALPHA)`. Si `a < 1`, dibuja igual que la sombra de construcción: `ctx.save()`, `bAlpha = a`, `ctx.globalAlpha = a`, `drawB(b)` dentro de `try/finally` (vuelve `bAlpha = 1`) y `ctx.restore()`. Las barras de vida/cola del edificio también salen translúcidas.
- Campo nuevo de dibujo en el edificio: `b.seeA` (no se crea en `addB`; arranca como `undefined` = 0).
- Efecto secundario útil: el orden por profundidad usa el **centro** del edificio, así que en edificios grandes una pieza parada al costado delantero a veces se dibujaba debajo aunque visualmente estuviera adelante. Ahora, en ese caso, el edificio también se vuelve transparente y la pieza se ve.
- No aplica a árboles ni montañas (también pueden tapar piezas, pero no se pidió). En el subsuelo no hay edificios.
- Rendimiento: `unitProbes` se calcula una vez por cuadro; el costo es edificios × piezas con filtro por rectángulo (despreciable con `POP_MAX` = 60 por bando).

## 1k. Muralla con sacrificio de peones (v24)

### Reglas
- Con peones de superficie elegidos (no vigías), el panel muestra el botón **🧱 Muralla** con la cantidad de peones (`N ♟`). Activa `mode = 'wall'`.
- La muralla tiene **como máximo tantas casillas válidas como peones elegidos** (`wallPeons()`). Cada peón se sacrifica por un tramo.
- **Colocación (estilo AoE):**
  - **Mouse:** 1.º clic (izquierdo o derecho) = inicio (`wallA`). La vista previa sigue al cursor (`wallHover`). 2.º clic = final (`wallB`) y se confirma (`confirmWall`). Si no hay casillas válidas no se confirma y sigue el modo.
  - **Táctil:** tocar inicio, tocar final (vista previa), tocar un tramo verde de la vista previa o el botón **«Confirmar muralla»** para levantarla. Tocar otra casilla cambia el final. «Otro inicio» vuelve a empezar; «Cancelar» sale.
  - La línea es **4-conexa** (`wallCells`): cada paso cambia x **o** y (escalera, sin huecos en diagonal), así no la atraviesan peón, rey ni deslizantes por una diagonal. Se corta cuando junta `n` casillas válidas.
  - Casilla válida (`wallCellOK`): pasto o arena, sin edificio, sin boca de túnel, sin reserva de caballo y sin pieza, o con una pieza **propia** que no sea vigía (se aparta sola). Las inválidas se ven **rojas** y se saltean (no gastan peón).
- **Al confirmar:** cada peón recibe `{k:'wall',x,y,t:0}`. Asignación: primero, el peón que ya está parado sobre una casilla se queda con esa; después, reparto voraz por distancia (pares peón-casilla ordenados). Las otras piezas propias que estén sobre una casilla de la muralla reciben una orden de mover a la casilla libre más cercana (radio 4, `wallEscape`). Los peones elegidos que sobran quedan como estaban.
- **El sacrificio:** el peón camina hasta **pisar** su casilla (`think`, rama `wall`, con `plan` y `follow`). Parado ahí, `wallTick` suma tiempo hasta `WALL_TIME` = 1 s (barra gris y polvo); después hace `kill(u)` y `addB(team,'muralla',x,y,true)` con `b.bornAt = G.t` (el tramo sube en 0,4 s).
  - Si la casilla deja de servir (`wallSiteOK` falla: alguien construyó ahí, etc.) la orden se cancela y el peón queda vivo.
  - Si la casilla está ocupada por otra pieza, el peón espera al lado; con `follow` en modo no-mover, después de 25 intentos fallidos (≈10 s) abandona y queda vivo.
  - Cualquier otra orden al peón antes de llegar cancela su tramo.
- **El tramo** (`BDEF.muralla = {icon:'🧱', name:'Muralla', hp:16, cost:0, score:20, build:1, w:1, h:1, pop:0, wall:0.55, stone:1, seg:1}`): es un edificio común de 1×1, así que:
  - Bloquea el paso (`passable` no deja pisar edificios). **El caballo lo salta** (como a cualquier edificio; `knightBlocked` solo mira montañas). Las piezas no nacen ahí ni se construye encima.
  - Se ataca y se destruye como cualquier edificio (`hit`, `destroyB`, captura automática con `findBInRange`, `orderAtkB`). Daño típico: torre 3, rey 12, peón 1 por golpe.
  - Supr/Retroceso lo elimina (`deleteSelection`).
  - Las **flechas del vigía pasan por encima** de los tramos: la línea de visión ignora edificios con `seg`.
  - No suma población. No está en `BUILDABLE` (tiene su propio botón) y la IA no la usa.
- **Puntaje:** helper nuevo `bScore(type) = BDEF.score ?? BDEF.cost ?? 300`, usado en `hit` (`razed`) y en «Sociedad» de `score()`. Antes se usaba `cost || 300`, que con costo 0 habría valido 300. Un tramo vale 20 (Militar +10 al destruirlo; Sociedad +2 por tramo en pie). Para los demás edificios no cambia nada.

### Dibujo
- `drawB` desvía a `drawWall(b)` cuando `BDEF[b.type].seg`.
- `drawWall`: bloque de piedra (`BPAL[team].stone`) de altura `tw·0,55`, dos caras visibles, hiladas y juntas, franja del color del bando, tapa y almenas. **Unión con los vecinos:** en coordenadas de mundo, cada lado sin tramo propio vecino se mete 0,2 casilla; los lados con vecino llegan al borde, así una fila de tramos se ve como un muro continuo de 0,6 de espesor y un tramo suelto como un pilar. Las almenas se dibujan solo en los bordes sin vecino, ordenadas por profundidad. `b.nb(dx,dy)` (opcional) reemplaza la búsqueda de vecinos (lo usa la sombra).
- Vista previa en `draw()`: baldosas verdes/rojas de `wallCells`, contorno amarillo en `wallA` y tramos translúcidos (`bAlpha = 0,45`, `id:-1`) como objetos ordenados por profundidad.
- Tramos planeados: mientras un peón va a su casilla, se dibuja una baldosa punteada con el color del bando.
- `drawU`: barra gris de transformación (`goal.t / WALL_TIME`).
- `bSilhouette` suma las almenas (0,14) para `seg`; los tramos también se vuelven transparentes si tapan piezas (v23).
- Minimapa: los tramos se pintan más oscuros que los demás edificios.

### Código (sección `/* ---------- muralla (peones que se sacrifican) ---------- */`, justo antes de la curación)
- Estado: `wallA`, `wallB`, `wallHover` (casillas `{x,y}` o `null`). `clearSel` los borra.
- `wallPeons()`, `wallSiteOK(x,y)`, `wallCellOK(x,y,team)`, `wallCells(a,b,n)`, `wallEscape(u,set)`, `confirmWall()` (devuelve `true` si levantó algo), `wallTap(cell,mouse)`, `wallTick(u,dt)`.
- Constante `WALL_TIME = 1.0` (junto a `OCC_ALPHA`).
- `update`: después de `surfaceTick`, `if(… u.goal.k==='wall' && u.x===u.goal.x && u.y===u.goal.y) wallTick(u,dt);`.
- Entrada: `tap` → `wallTap(cell, lastCanvasPointer==='mouse')` si `mode==='wall'`; `pointermove` (mouse) actualiza `wallHover`; `endPtr`, clic derecho sin arrastrar en modo muralla → `wallTap(…, true)`. El clic izquierdo llega por `desktopSelect` → `tap`.
- Panel: rama `mode==='wall'` con mensajes según el paso (mouse/táctil); si los peones elegidos desaparecen, sale del modo. Un tramo seleccionado muestra su propio mensaje. Un peón con orden `wall` muestra «🧱 Va a convertirse en muralla».
- `sig()` incluye `wallA`, `wallB`, la cantidad de peones y si cada pieza tiene orden `wall`.
- Ayuda de `#start`: línea «Muralla».
- `RULE.peon` menciona las murallas.

## 1l. Asimetría: territorio negro y bonus blanco (v25)

### Constantes (junto a `WALL_TIME`)
- `BLACK_AURA_R = 6.5`, `BLACK_AURA_DPS = 0.015` (vida por segundo de juego).
- `WHITE_BONUS_N = 2` (ataques reforzados por pieza blanca), `WB_STRIKE = 0.35` (daño extra en captura/choque directo), `WB_ARROW = 0.08` (daño extra en flecha de vigía), `WB_STRIKE_CD = 0.78` (recarga ×0,78 = −22 %), `WB_HIT = 0.5` (daño extra a edificios), `WB_HIT_CD = 0.85` (recarga ×0,85 = −15 %).
- De paso se arregló el comentario de `OCC_ALPHA`/`OCC_FADE`, que había quedado pegado a la línea de `WALL_TIME`.

### Territorio de las Negras
- Sección `/* ---------- asimetría: territorio negro y bonus blanco (v25) ---------- */`, justo antes de la curación.
- `blackCastleC()`: centro (`bCenter`) del castillo de las Negras (`team === 1 && type === 'castillo'`), con el id cacheado en `blackCastleId` (se revalida en cada llamada). `null` si no existe.
- `inBlackZone(x,y,L=0)`: `true` si `L === 0` y `hyp(x−cx, y−cy) ≤ BLACK_AURA_R`. En el subsuelo siempre es `false`.
- `update(dt)`: para cada pieza, justo después de descontar `healCd` y antes de `u.building = false`: si es blanca, de la capa 0, no está saltando (`state !== 'jump'`) y `inBlackZone(u.x,u.y,u.layer)`, resta `BLACK_AURA_DPS·dt` a `u.hp`. Si llega a `≤ 0`: `G.st[1].kills += VALUE[u.type]`, `kill(u,null)` y `continue`. No escribe `G.alert` (no cuenta como ataque).
- Usa `u.x/u.y` (la casilla lógica): durante un deslizamiento, la pieza ya cuenta en la casilla destino.
- Tiempos con 1 de vida: un peón dentro del territorio muere en ≈67 s de juego; el rey (24) en ≈27 min. Respeta la velocidad del juego (usa el `dt` de `update`).
- Rige en los dos modos (humano e IA). Las piezas de las Negras no se ven afectadas.
- **Interacción con el alfil (v21):** una pieza blanca desgastada tiene `hp < maxHp`, así que un alfil blanco al lado la cura. Si el alfil queda al lado dentro del territorio, cura un pulso por segundo que compensa el desgaste (se ve el efecto verde seguido).
- **Dibujo:** en `drawTerrain`, después de pintar la casilla, si `inBlackZone(x,y)`: relleno `rgba(110,20,45,.12)` y una línea fina `rgba(140,25,55,.4)` en los lados que limitan con una casilla fuera del territorio (o vacía). Solo superficie (`drawUnderground` no lo marca).
- `drawU`: la barra de vida se muestra si `mx > 1 || u.hp < mx − 0.005` (así el desgaste se ve en piezas de 1 de vida sin que aparezca la barra por errores de redondeo).

### Bonus de los primeros ataques de las Blancas
- `addU` inicializa `bonus: team === 0 ? WHITE_BONUS_N : 0` y `cdMul: 0`.
- `hasWhiteBonus(u)` = `!!u && u.team === 0 && u.bonus > 0 && !inBlackZone(u.x,u.y,u.layer)`. Se evalúa en la casilla **desde donde ataca** (en `updSlide`/`updJump` el golpe ocurre antes de que el atacante se mueva).
- **`strike(v,k,damage)`:** calcula el daño normal en `dmg`; si `k` es de otro bando y `hasWhiteBonus(k)`, suma `WB_ARROW` (flecha, `damage !== null`) o `WB_STRIKE` (directo, `damage === null`), pone `k.cdMul = WB_STRIKE_CD` y hace `k.bonus--`. El bonus se gasta aunque la víctima sobreviva (rey, piezas heridas).
- **Recarga reducida (`u.cdMul`):** `strike` ocurre en medio del movimiento y la recarga se fija después, así que se aplica en dos lugares:
  - `endMove(u,blocked)`: `u.cd = DEF.cd·(blocked?0.5:1)·(u.cdMul||1)`; luego `u.cdMul = 0`.
  - Flecha del vigía (`think`): `u.cd = 1.5·(u.cdMul||1)`; luego `u.cdMul = 0`.
- **`hit(u,b,c)`:** si `b.team !== u.team && hasWhiteBonus(u)`: `+WB_HIT` de daño, `u.cd = (DEF.cd + 0.9)·WB_HIT_CD` y `u.bonus--`.
- Los 2 usos son compartidos: el bonus se gasta en los dos primeros ataques válidos, contra piezas o edificios. Dentro del territorio negro no se gasta (queda en pausa) y vuelve a estar disponible al salir.
- Ejemplos: torre contra el rey: 1,35 en vez de 1; peón contra el castillo: 1,5 en vez de 1; flecha de vigía: 0,33 en vez de 0,25 (una pieza común muere con 3 flechas en lugar de 4 si las dos primeras tienen bonus).
- El rey guardado en el castillo conserva su `bonus` (es el mismo objeto).
- **Puntito:** en `drawU`, si `hasWhiteBonus(u)`, círculo `#ffd84a` de radio `max(2, tw·0,055)` con borde oscuro fino en `(sx − tw·0,26, gy − tw·0,42·tall)`. Se oculta al gastar el bonus o al entrar al territorio negro.

### Interfaz
- `sig()`: agrega por pieza `bonus`, `hasWhiteBonus` y si está (siendo blanca) en el territorio negro.
- `refreshPanel()`: una pieza blanca muestra «· 🟡 N ataques reforzados» o «· Bonus en pausa (territorio negro)», y «· ⚠ Territorio negro: pierde vida de a poco» si está adentro. Con varias piezas: «· 🟡 N con bonus» y «· ⚠ N en territorio negro». El castillo negro seleccionado: «· Su territorio desgasta de a poco a las Blancas».
- Ayuda de `#start`: línea «Asimetría».

### IA
- La IA (Negras) no hace nada distinto: el territorio es pasivo. Sus piezas tienen `bonus = 0`.

## 1m. Hierbas — Parte 1: catálogo, árboles con hierba y recolección (v26)

### Qué hace y qué no
- **Hace:** define las 8 hierbas, las siembra en árboles, las dibuja, deja que los peones las saquen al talar y muestra la hierba que lleva cada pieza.
- **No hacía en v26** (hecho en v28, sección 1o): ninguno de los efectos descriptos en `desc` (resurrección, teletransporte, proyectiles, atravesar obstáculos, velocidad, curación, escudo). En v26 tampoco había forma de pasar una hierba de una pieza a otra; **desde v27 sí** (sección 1n). `u.herbCd` se inicializa en 0; desde v28 lo usan el Paso del Mago (3) y el Fuego de Bakú (4).
- La IA no tala, así que no junta hierbas.

### Catálogo `HERBS` (sección de constantes, después de `WB_*`)
Diccionario con índices 1 a 8; cada entrada es `{id, latin, icon, color, forTypes, name, desc}`. `forTypes` dice qué tipos de pieza la pueden **usar** (cualquiera la puede **llevar**).

| id | latin (camufla a) | icon | color | forTypes | name | desc (efecto planeado) |
|---|---|---|---|---|---|---|
| 1 | Aurum Augustini (Agustín Oro) | 🌻 | `#ffd84a` | dama | Resurrección Áurea | si muere, resucita en esa casilla o una vecina libre con vida llena (1 uso) |
| 2 | Capablanca Fidelis (Capablanca) | 💮 | `#9cc0ff` | dama | Retorno Real | si muere, resucita junto a su castillo (1 uso) |
| 3 | Talia Transitus (Mijaíl Tal) | 🌸 | `#e580ff` | dama | Paso del Mago | teletransporte a cualquier casilla libre de su capa (enfriamiento 18 s) |
| 4 | Kasparovia Ignis (Kaspárov) | 🌺 | `#ff6a5a` | dama, torre | Fuego de Bakú | quieta, dispara proyectiles (radio 3,5; 0,35 de daño cada 1,2 s) |
| 5 | Morphya Saltus (Paul Morphy) | 🍃 | `#50e678` | dama, alfil, torre, peon | Salto de Ópera | atraviesa edificios, árboles y muros al moverse |
| 6 | Fischeriana Celeritas (Bobby Fischer) | 🌱 | `#7cf0a0` | alfil, caballo, torre, peon | Furia de Reikiavik | +35 % velocidad, menor recarga y +1 de daño |
| 7 | Magnusia Sanatio (Magnus Carlsen) | 🌼 | `#ffe08a` | alfil, caballo, rey | Savia Nórdica | autocurado +0,4 hp/s y +0,5 hp/s a aliadas al lado |
| 8 | Polgaria Scutum (Judit Polgár) | 🍀 | `#45cdb5` | torre, alfil, caballo, rey | Égida Húngara | −35 % de daño recibido por ella y aliadas a ≤ 2 casillas |

Constantes nuevas junto al catálogo: `HERB_N = 8` (cantidad de hierbas), `HERB_P = 0.18` (probabilidad por árbol) y `EMOJI_FONT` (lista de fuentes de emoji para dibujar los íconos en el canvas).

### Siembra (`G.herbs`, `seedHerbs`)
- `G.herbs[N*N]` (`Uint8Array`): 0 = sin hierba, 1..8 = id de la hierba. Se crea en `newGame` y se llena con `seedHerbs()`, que se llama justo después de `seedCrystals()`.
- `seedHerbs()` recorre solo la primera mitad del arreglo (`i < N*N-1-i`) y, si `i` y su simétrica `j = N*N-1-i` son árbol (`ter === 4`), con probabilidad `HERB_P` hace `G.herbs[i] = G.herbs[j] = 1 + floor(random·HERB_N)`. Se exige que **las dos** casillas sean árbol porque la limpieza de bolsones de `genMap` puede romper la simetría en algún caso raro. N es siempre par, así que no hay casilla central.
- La siembra usa `Math.random` (no la semilla del mapa).
- `fellTree(x,y)` pone `G.herbs[i] = 0`: si un árbol cae con la hierba puesta, se pierde.

### Recolección (sección `/* ---------- hierbas (v26, Parte 1: recolección) ---------- */`, justo después de `fellTree`)
- `canUseHerb(u, h = u.herb)` → `!!(h && HERBS[h] && HERBS[h].forTypes.includes(u.type))`.
- `takeHerb(u,x,y)`: si el árbol (x,y) tiene hierba y la pieza es un **peón** no vigía, de la superficie, **sin hierba** y al lado del árbol (`nextTo`), hace `u.herb = G.herbs[i]; G.herbs[i] = 0;`, agrega el efecto `{k:'spawn', x:u.x, y:u.y, t:0, layer:0}` y devuelve `true`. Si no, devuelve `false`. Un peón que ya lleva una hierba **no** saca otra.
- **Dónde se llama** (no en `think`, porque al llegar al árbol `chopTick` corre en el mismo cuadro, antes de que `think` vuelva a ejecutarse):
  - `chopTick(u,dt)` (orden `chop`): primero `takeHerb(u, g.x, g.y)`. Si la sacó **y** la orden es directa (`g.direct`), hace `u.goal = null; u.plan = null; return;` y el peón queda quieto con la hierba (aparece como ocioso en 💤). Si el jugador vuelve a tocar el árbol (ya sin hierba), lo tala normalmente. Si no la sacó, o si la orden era del talado automático, sigue con `chopHit`.
  - `cutTick(u,dt)` (abrir camino): `takeHerb(u, c.x, c.y)` y sigue talando (es una orden de mover, no se frena).
- **Orden directa:** `orderChop` crea ahora `{k:'chop', x, y, direct:true}`. `nextChop` (talado automático) crea la orden sin `direct`, así que en el talado automático el peón saca la hierba y sigue talando ese mismo árbol.
- **Talado automático y hierbas:** `nearestTree(u, skip)` saltea los árboles con hierba cuando el peón **ya lleva** una (si no, al talarlos la hierba se perdería). Un peón sin hierba sí los elige (y la saca primero). Con orden directa del jugador, un peón con hierba tala igual un árbol con hierba y esa hierba se pierde.
- La hierba viaja con la pieza (`u.herb`): se conserva al bajar al subsuelo, al subir, al navegar y al volverse vigía. Se pierde si la pieza muere, se elimina con Supr o se sacrifica (muralla, boca de túnel).

### Dibujo
- `drawTree(x,y)`: si `G.herbs[i] > 0`, después de la copa dibuja un círculo oscuro translúcido (`rgba(12,16,24,.62)`) de radio `hr = max(5, tw·0,12)`, con borde del color de la hierba, centrado sobre la copa (`sy − s·0,72` en árboles redondos, `sy − s·0,95` en pinos, menos `hr·0,75`), y encima el emoji `HERBS[h].icon` con `EMOJI_FONT`. Tiembla con el árbol. Si el árbol se está talando, la barra de progreso sube para no tapar el ícono.
- `drawU(u)`: si `u.herb > 0`, dibuja el emoji abajo a la derecha de la pieza (`sx + tw·0,3`, `gy − tw·0,08`, radio `max(5, tw·0,12)`):
  - `canUseHerb(u)` verdadero → halo radial del color de la hierba;
  - falso (solo la lleva) → disco gris claro, emoji al 55 % de opacidad y `ctx.filter = 'grayscale(1)'`.
  Va en `ctx.save()/restore()`, así no afecta el resto del dibujo. El puntito de bonus (arriba a la izquierda) y la ★/↗ (arriba a la derecha) no se superponen.
- Nota: si el navegador no tiene fuente de emoji a color (por ejemplo Chromium sin fuentes en Linux), el círculo de color se ve igual pero el emoji puede no aparecer. En Chrome de Android y en Windows se ve bien.

### Interfaz (agregado menor, fuera de lo pedido)
- `sig()` incluye `u.herb` de cada pieza elegida, para que el panel se actualice al juntar una hierba.
- `refreshPanel()`: con una sola pieza elegida que lleva hierba, agrega «· 🌼 Magnusia Sanatio (Savia Nórdica)» y « · en la mochila» si no la puede usar; el `title` del mensaje muestra `desc`.
- Ayuda de `#start`: línea «Hierbas».

### Campos nuevos
- Pieza: `u.herb` (0 o id 1..8), `u.herbCd` (0, sin uso todavía).
- Estado: `G.herbs[N*N]`.
- Orden: `{k:'chop', x, y, direct?, skip?}`.

### Sugerencias originales para los efectos (implementados en v28, ver 1o)
- Resurrección (1 y 2): en `kill(v,k)` o en `strike` antes de `kill`, si `canUseHerb(v)` con 1 o 2, consumir `v.herb` y reubicar con `addU`/`changeLayer` según el caso (cuidar `G.occ`, grupos y selección).
- Fuego de Bakú (4): rama en `think` parecida a la del vigía, con `u.herbCd`.
- Salto de Ópera (5): `passFor`/`blockedFor` por pieza; cuidar `navStep` y que la pieza no termine dentro de un edificio.
- Furia (6): multiplicar `speed`/`cd` en `startMove`/`updSlide`/`endMove` y sumar daño en `strike`/`hit` (como el bonus blanco de v25).
- Savia (7): un tick como `healTick`. Égida (8): reducir `dmg` en `strike` (y quizás en el desgaste del territorio negro).
- Transferencia: hecha en v27 (`{k:'giveHerb', id}`, sección 1n).

## 1n. Hierbas — Parte 2: traspaso entre piezas aliadas (v27)

El peón saca primero todas las hierbas para él, pero muchas solo sirven para la Dama u otras piezas. Ahora cualquier pieza que lleve una hierba (peón o no) puede dársela a una pieza aliada.

### Orden `{k:'giveHerb', id}`
- `orderGiveHerb(u, targetId)` (sección de órdenes, justo antes de `orderChop`): devuelve `false` si `u` no lleva hierba (`u.herb > 0`) o si `t = G.U.get(targetId)` no es aliada (`t.team === u.team`), es la misma pieza o está en otra capa. Si vale, pone `u.goal = {k:'giveHerb', id:targetId}`, `plan = null`, `fails = 0`, agrega la marca verde `{k:'mark', x:t.x, y:t.y, t:0, c:'#7cf0a0', layer:t.layer}` y devuelve `true`.
- `think(u)`, rama `g.k === 'giveHerb'` (justo antes de la rama `wall`, así va antes que el código del vigía):
  - si `t` no existe, cambió de bando o de capa, o `u` ya no lleva hierba → `goal = null`, `plan = null`;
  - si `nextTo(u, t.x, t.y)` (8 vecinas): `const tmp = t.herb || 0; t.herb = u.herb; u.herb = tmp;` (pasa o **intercambia**), efecto `{k:'spawn', x:t.x, y:t.y, t:0, layer:t.layer}` y `goal = null`;
  - si no está al lado y `u` es **vigía** → se cancela (el vigía no se mueve; solo entrega a una pieza que tenga al lado);
  - si no: `follow(u, plan(u, (x,y) => Chebyshev(x,y,t) === 1, t.x, t.y), false)`. Como `follow` se recalcula al terminar cada movimiento, la pieza **persigue** a la receptora si se mueve. Si no encuentra camino 25 veces seguidas, `follow` abandona la orden y la hierba queda donde estaba.
- La receptora no hace nada: no se detiene ni cambia su orden. La transferencia funciona igual en el subsuelo (misma capa) y para cualquier par de tipos de pieza.
- Si la pieza que entregó recibe una hierba en el intercambio y es un peón, puede volver a sacar hierbas de los árboles solo cuando quede vacío (regla de `takeHerb`, sin cambios).

### Modo `'giveHerb'` e interfaz
- Variable global nueva `giveFrom`: id de la pieza que va a entregar (la que estaba sola elegida al tocar el botón). `clearSel` la pone en 0.
- **Panel, una sola pieza elegida con hierba:** el mensaje agrega «· 💮 Capablanca Fidelis (Retorno Real): activa en esta pieza» o «…: sirve para Dama» (helper `herbTypes(h)`, que une los `DEF[t].name` de `forTypes`), y «· 🌿 Yendo a pasarla» mientras tiene la orden. El `title` del mensaje muestra el nombre y el poder (`desc`). Botones:
  - **Pasar hierba 🌿** → `mode = 'giveHerb'; giveFrom = u.id`.
  - **Descartar hierba** → `u.herb = 0` (y cancela una orden `giveHerb` pendiente). La hierba se pierde.
- **Panel en modo `'giveHerb'`:** «🌿 Tocá una pieza aliada para pasarle … · sirve para: … · si ya lleva otra, se intercambian» y botón **Cancelar**. Si `giveFrom` ya no existe, ya no lleva hierba o no es del bando activo, el modo se cierra solo.
- **Entrada:**
  - `tap(sx,sy)`: si `mode === 'giveHerb'` llama a `giveHerbTap(sx,sy,cell)` antes que cualquier otra cosa. `desktopSelect` (clic izquierdo) ya delegaba en `tap` cuando `mode !== 'none'`, así que cubre el mouse.
  - `giveHerbTap`: busca la pieza tocada (`unitAt` o `G.occ[viewLayer]`). Si es aliada de `giveFrom`, distinta y de la misma capa, llama a `orderGiveHerb` y vuelve a `mode = 'none'`. **La selección se mantiene** (queda elegida la que entrega, para ver su ruta). Tocar otra cosa no hace nada y el modo sigue activo.
  - `endPtr`: clic derecho sin arrastrar en modo `'giveHerb'` hace lo mismo que el izquierdo (`tap`), en vez de `desktopOrder`.
  - `desktopOrder` (clic derecho, sin modo): si se hace clic sobre una pieza aliada `v` y entre las elegidas hay alguna `p` (distinta de `v`, misma capa) con `p.herb > 0 && !canUseHerb(p) && canUseHerb(v, p.herb)`, la **más cercana** de esas recibe `orderGiveHerb(p, v.id)`. Las demás elegidas (menos `v`) se mueven a esa casilla como antes. Se evalúa **antes** que la orden de sanar del alfil. Se elige una sola entregadora para que dos piezas no se intercambien la hierba de ida y vuelta.
- `sig()`: por pieza elegida agrega `u.herb`, `u.herbCd` y si tiene orden `giveHerb`; y `giveFrom` cuando el modo es `'giveHerb'`.
- Ayuda de `#start`: la línea «Hierbas» explica cómo pasarla y descartarla.

### Sin cambios
- En v27 los efectos todavía no estaban implementados (llegaron en v28, sección 1o).
- La IA no pasa hierbas (tampoco las junta).

## 1o. Hierbas — Parte 3: los poderes (v28)

Cada poder solo actúa si `canUseHerb(u)` es verdadero (la pieza es de un tipo de `HERBS[h].forTypes`). Una pieza que lleva una hierba que no puede usar no gana nada. Las resurrecciones (1 y 2) **gastan** la hierba (`herb = 0`); las demás son **permanentes** mientras la pieza la lleve. Funcionan para los dos bandos (también la IA, si alguna vez recibiera una).

### Código
Sección `/* ---------- poderes de las hierbas (v28, Parte 3) ---------- */`, justo antes de `passFor`: `morph`, `morphPass`, `fischer`, `polgarShield`, `herbShot`, `herbHeal`, `herbRevive`. El teletransporte está en la sección de entrada (`teleFrom`, `teleTap`, junto a `clearSel` y `giveFrom`).

### 1 · Aurum Augustini — Resurrección Áurea (Dama)
- `kill(v,k)` llama primero a `herbRevive(v,k)`. Si `v` es Dama con `herb === 1` y **la mató otra pieza** (`k` no es `null`): `herb = 0`, vida llena (`DEF.dama.hp || 1`), `endMove(v,false)`, `goal/plan/dig/cut = null`, `hurt = 0.6`, efectos `'spawn'` y `'spark'`. Queda en **su misma casilla**.
- No resucita si muere por Supr, sacrificio, o desgaste del territorio negro (todos llaman a `kill(u,null)`).
- `desc` decía «o vecina libre»: no hizo falta, porque la Dama nunca deja su casilla (el atacante frena antes).

### 2 · Capablanca Fidelis — Retorno Real (Dama)
- `herbRevive`, `herb === 2` y `k` no `null`: busca el castillo propio y `sp = spawnCell(c)` (casilla libre al azar del anillo). Si hay: libera su casilla, la pasa a la **superficie** en `sp` (sirve aunque muera en el subsuelo), vida llena, `herb = 0`, `endMove`, órdenes y `evac` a `null`, efectos `'puff'` donde estaba y `'spawn'` en `sp`. Si no hay castillo o no hay casilla libre, **muere normalmente**.

### `kill` y `strike` (cambio de contrato)
- `kill(v,k)` devuelve ahora `true` si la pieza murió y `false` si no estaba o resucitó. Los llamadores viejos ignoraban el valor, así que no cambian.
- `strike(v,k,damage)`: si `v.hp <= 0`, llama a `kill`; si devuelve `false` (resucitó), `strike` devuelve `false` → el atacante frena en la casilla anterior (`endMove(u,true)` en `updSlide`/`updJump`). Las capturas (`G.st[k.team].kills`) se suman **solo** si la pieza murió de verdad (antes se sumaban antes de llamar a `kill`).

### 3 · Talia Transitus — Paso del Mago (Dama)
- Panel, una sola Dama elegida con `herb === 3`: botón **Teletransportar 🌸** (muestra «(N s)» y queda deshabilitado mientras `herbCd > 0`) → `mode = 'tele'`, `teleFrom = u.id`.
- Panel en modo `'tele'`: «🌸 Paso del Mago: tocá una casilla libre…» (o «cambiá a la capa de la Dama (Tab)…» si se mira otra capa) y **Cancelar**. El modo se cierra solo si la Dama ya no existe, no tiene la hierba o está enfriándose.
- `tap` → `teleTap(cell)` cuando `mode === 'tele'` (cubre el clic izquierdo vía `desktopSelect`; el clic derecho en este modo también llama a `tap` desde `endPtr`). Valida: la Dama está en la capa que se mira, la casilla está en el mapa, `G.ter` no vacío, `passable(u.layer,i)`, sin pieza y sin caballo aterrizando. Si vale: efecto `'spawn'` en el origen, actualiza `G.occ`, `x/px/y/py`, `endMove(u,false)`, `goal/plan = null`, `herbCd = 18`, `mode = 'none'`, efecto `'spawn'` en el destino. Un toque inválido no hace nada (el modo sigue).
- Como `passable(0)` acepta el agua, la Dama puede teletransportarse al agua (queda en bote y vuelve a tierra por un puerto, o con otro teletransporte).

### 4 · Kasparovia Ignis — Fuego de Bakú (Dama, Torre)
- `update`, rama de pieza quieta (después de `healTick`): si `herb === 4`, `state === 'idle'`, `herbCd <= 0` y `canUseHerb`, llama a `herbShot(u)`: elige el enemigo **más cercano** de su capa a ≤ 3,5 casillas (no en el aire; **no** pide línea de visión), efecto `'arrow'`, `strike(e,u,0.35)` y `herbCd = 1,2` (×`cdMul` si el disparo gastó el bonus blanco; luego `cdMul = 0`).
- Dispara aunque tenga una orden, siempre que esté quieta en ese cuadro (por ejemplo, esperando su recarga entre pasos). Puede disparar y además capturar normalmente.

### 5 · Morphya Saltus — Salto de Ópera (Dama, Alfil, Torre, Peón)
- `morph(u)` = capa 0, `herb === 5` y `canUseHerb`. `morphPass(u,i)` = la casilla es edificio (`G.bmap`, incluye murallas y puertos en construcción) o árbol, **no** es montaña ni vacío, y no tiene pieza ni reserva de caballo.
- `eachMove`, deslizantes: si una casilla del rayo está bloqueada pero es `morphPass`, el rayo **sigue** (esa casilla no es destino ni cambia el tipo de navegación). Unidades, montañas y el borde siguen cortando.
- `eachMove`, peón: si la casilla ortogonal está bloqueada y es `morphPass`, puede ir a la de 2 casillas en esa dirección si está libre (costo `2·speed + cd`).
- `captureCells`, deslizantes: las casillas intermedias `morphPass` se agregan al recorrido y no cortan.
- `updSlide`: al empezar cada tramo, si `morph(u)`, saltea las casillas `morphPass` del recorrido (la pieza **nunca pisa** un obstáculo). Campo nuevo `m.len` = largo del tramo (Chebyshev); el tramo dura `speed·len`, así el sobrevuelo y el salto del peón respetan la velocidad.
- El caballo ya saltaba todo menos montañas: no cambia.

### 6 · Fischeriana Celeritas — Furia de Reikiavik (Alfil, Caballo, Torre, Peón)
- `fischer(u)` = `herb === 6` y `canUseHerb`.
- `updSlide` y `updJump`: `m.t += dt·1,35`.
- `endMove`: recarga ×0,75. `hit`: recarga ×0,75 y +1 de daño al edificio.
- `strike`: +1 de daño **solo en el golpe directo** (`damage === null`). Las flechas de un peón vigía con esta hierba **no** suman +1 (una flecha de 1,25 mataría de un tiro). Si se quiere que sí, sacar la condición `damage===null`.
- El costo de `plan` (Dijkstra) no cambia: elige las mismas rutas.

### 7 · Magnusia Sanatio — Savia Nórdica (Alfil, Caballo, Rey)
- `update`, para toda pieza (en cualquier estado), después de descontar `herbCd`: `herbHeal(u,dt)`: se cura `0,4·dt` hasta `maxHp`, y cada aliada de las 8 vecinas con vida menor al máximo recupera `0,5·dt` (efecto `'heal'` de vez en cuando, ~0,7 por segundo por pieza curada). Se suma a la curación por pulsos del alfil (v21).

### 8 · Polgaria Scutum — Égida Húngara (Torre, Alfil, Caballo, Rey)
- `strike`, después del bonus blanco y de Fischer: si `polgarShield(v)` (la víctima o una aliada de su capa a distancia euclídea ≤ 2 lleva la hierba 8 y la puede usar), el daño ×0,65. Una pieza de 1 de vida sobrevive a una captura directa con 0,35 y el atacante frena.
- No reduce el desgaste del territorio negro ni el daño a edificios.

### Otros cambios
- `update`: `if(u.herbCd>0) u.herbCd=Math.max(0,u.herbCd-dt);` para todas las piezas (respeta la velocidad del juego).
- `drawU`: la barra de vida se muestra si `mx > 1 || u.hp < mx − 0,01`.
- `sig()`: usa `Math.ceil(u.herbCd)` (no el valor exacto, que cambiaría en cada cuadro y rehacería el panel todo el tiempo) y `teleFrom` en modo `'tele'`.
- Variable global `teleFrom` (como `giveFrom`); `clearSel` la pone en 0. `mode` puede valer `'tele'`.
- Ayuda de `#start`: la línea «Hierbas» resume los 8 poderes.

## 1p. Pasar hierba automático y Menú Herbal (v29)

### Receptor más cercano
- `nearestHerbReceiver(u)` (sección de órdenes, justo después de `orderGiveHerb`): si `u` no lleva hierba, `null`. Recorre las aliadas vivas de su capa (`v.team === u.team`, `v.id !== u.id`, `v.layer === u.layer`, `v.state !== 'jump'`) que pueden usar esa hierba (`canUseHerb(v, u.herb)`). Devuelve la **más cercana sin hierba** (`!v.herb`, distancia euclídea `hyp`); si todas las compatibles ya llevan una, la más cercana de ellas (habrá intercambio). Si no hay ninguna, `null`.
- Elige por distancia en línea recta, no por largo de camino: puede elegir una pieza cercana a la que cueste llegar (por ejemplo, del otro lado de un río). Si no hay camino, `follow` abandona la orden a los 25 intentos.

### Panel (una sola pieza con hierba)
- **Pasar hierba 🌿**: deshabilitado si `nearestHerbReceiver(u)` es `null` (el `title` dice «Ninguna aliada en esta capa puede usarla (sirve para …)»). Si hay receptor, el `title` dice «Pasar hierba a: Dama (la más cercana)» (y «· intercambian hierbas» si esa pieza ya lleva una). Al tocarlo: `const r = nearestHerbReceiver(u); if (r) orderGiveHerb(u, r.id);` — se recalcula en el momento del clic.
- **Elegir a quién**: entra al modo `'giveHerb'` de v27 (tocar o hacer clic en una aliada cualquiera). Hace falta un botón aparte porque en táctil tocar una pieza propia la agrega a la selección.
- **Descartar hierba** y **Teletransportar 🌸** no cambiaron.
- Mientras va a entregarla, el mensaje dice «· 🌿 Yendo a pasarla a Dama».
- El clic derecho en PC sobre una aliada compatible (v27) sigue igual.
- `sig()` agrega el id de `nearestHerbReceiver` de la pieza elegida (cuando hay una sola), así el botón se habilita o cambia de destino apenas aparece, desaparece o se acerca una pieza compatible.

### Botón 🌿 Hierbas y `#herbBox`
- HTML: `<button id="herbBtn">🌿<span class="t"> Hierbas</span></button>` como primer botón de `#rot` (antes de Restart), con el mismo estilo compacto que `#restart`; clase `on` (borde verde) mientras el menú está abierto. En celular (≤ 600 px) se oculta el texto (`.t`) y queda solo 🌿.
- `#top` reserva más espacio a la derecha: `padding-right` 290 px (antes 195); en celular 236 px, con letra de 13 px y menos separación para que entren los dos oros.
- `<div id="herbBox" class="hidden">` (después de `#panel`): `position:fixed; top:92px; right:8px; z-index:6`, fondo oscuro, `max-width: min(400px, 100vw − 16px)`, `max-height: calc(100vh − 120px)`, `overflow-y:auto`, `touch-action:pan-y` (se desplaza con el dedo) y texto seleccionable. En celular: `top:84px; right:4px`.
- Código (sección `/* ---------- menú herbal (v29): guía de las 8 hierbas ---------- */`, justo después del listener de Restart): `buildHerbBox()` arma el contenido una vez al cargar, a partir de `HERBS`; `toggleHerbBox(open?)` alterna (o fuerza) la visibilidad y la clase `on`. El botón `✕` de adentro lo cierra. `pointerdown`, `wheel` y `contextmenu` dentro del menú no se propagan.
- Contenido: «Reglas sintetizadas» (1. Árboles con planta · 2. El Peón saca primero para él · 3. Pasar hierba (automático) · 4. Genios en latín) y «Las 8 hierbas» (ícono, nombre en latín en el color de la hierba, nombre del poder, glifos de las piezas compatibles con su nombre en el `title`, y `desc`).
- El menú no pausa el juego.

### Ayuda de `#start`
- La línea larga «Hierbas» de v26–v28 se reemplazó por un punto breve «Hierbas (🌿)» que remite al botón 🌿 Hierbas.

## 1q. Tutorial en video en un archivo aparte (v30)

### Archivos
- **`ajedrez-rts.html`**: el juego. Tiene los botones que abren el tutorial, el cargador y la pausa del juego.
- **`ajedrez-rts-tutorial.js`**: el tutorial completo (escenas, textos, reproductor y sus estilos). Va **en la misma carpeta** que el HTML. Pesa unos 60 KB. No toca el estado de la partida: solo lee constantes del juego y dibuja SVG.

### Cómo se abre (HTML, sección `/* ---------- tutorial en video (v30): se carga desde ajedrez-rts-tutorial.js ---------- */`, después del menú herbal)
- Botones: **`#tutBtn`** («🎬 Tutorial», dentro de `#speed`, a la izquierda del selector de velocidad; en celular solo 🎬) y **`#tutStart`** («🎬 Ver el tutorial en video», primera línea del menú de inicio, clase `tutgo`). El `title` que antes tenía todo `#speed` pasó al `<span>⏩</span>`.
- `openTutorial()`: si `window.AjedrezTutorial` ya existe, llama a `.open()`. Si no, agrega `<script src="ajedrez-rts-tutorial.js">` (`TUT_FILE`) con `runTutorialSrc(src, onFail)`; al cargar abre el tutorial; si falla (`onerror`) muestra el aviso `#tutMiss`.
- **`#tutMiss`** (overlay `.ov`): «No encontré el archivo ajedrez-rts-tutorial.js…» con un `<input type="file" id="tutFile">`. Al elegir un archivo se lee con `f.text()`; si no contiene `AjedrezTutorial` se rechaza; si lo contiene, se carga como `Blob` → `URL.createObjectURL` → `<script>` (mismo `runTutorialSrc`). Hace falta porque en Chrome de Android un HTML abierto desde Descargas (`content://`) no puede cargar archivos vecinos por ruta relativa; en PC (`file://`) y en un servidor web carga solo.
- **Pausa:** `tutIsOpen()` = `window.AjedrezTutorial && AjedrezTutorial.isOpen()`. En `frame`, la simulación corre con `if(running && !G.over && !tutIsOpen())`. Dibujo, panel y minimapa siguen (no cambia nada porque la partida está quieta).

### Interfaz del módulo (`window.AjedrezTutorial`)
- `open()`, `close()`, `isOpen()`, `version` (30), `total` (segundos, 278), `chapters` (`[{title, icon, start, dur}]`).
- Todo el archivo es una IIFE con `'use strict'`; si ya existe `window.AjedrezTutorial` no hace nada (cargarlo dos veces es inocuo). Si faltan globales del juego (`HERBS`, `PCOL`), avisa con `alert` que se abre desde el juego.
- Globales del juego que usa (son `const` de nivel superior del HTML, visibles para otros scripts): `VS`, `FONT`, `EMOJI_FONT`, `PCOL`, `BPAL`, `TC`, `UGC`, `HERBS`, `DEF`, `OR`, `DG`, `ALL8`, `KN`, `shade`. Si se renombra alguno en el HTML, hay que cambiarlo también en el tutorial.
- Al cargarse crea su propio `<style>` y el overlay `#tut` (`z-index:8`, por encima del menú de inicio).

### Reproductor (`#tut`)
- `#tutTitle` («3/18 · ⏱ Tiempo real»), botón ✕ (`#tutX`).
- `#tutSvg` (`viewBox 0 0 640 360`, ancho 100 %, alto máximo `100vh − 250px`): el cuadro actual. Tocarlo alterna reproducir/pausa.
- `#tutCap`: subtítulo del momento (texto HTML, más legible en celular que texto dentro del SVG).
- `#tutBar`: barra de tiempo. `#tutSegs` tiene un segmento por capítulo, de ancho proporcional a su duración y con el color de su tema (el actual más fuerte); `#tutFill` marca lo ya visto y `#tutKnob` la posición. Tocar o arrastrar (puntero capturado) adelanta o retrocede.
- `.tctl`: ⏮ (tema anterior; si pasaron más de 1,5 s del tema actual, vuelve a su comienzo), −5 s, ▶/⏸, +5 s, ⏭, tiempo `m:ss / 4:38`, selector de velocidad del video (0,5x a 2x, independiente de la velocidad del juego).
- `#tutList`: un botón por capítulo con ícono, nombre y minuto de inicio (borde izquierdo del color del tema); el actual se resalta y se desplaza a la vista. En pantallas bajas (≤ 520 px de alto, celular acostado) la lista se oculta y el SVG crece.
- **Teclado** (listener de `keydown` en fase de **captura**, así los atajos del juego no reciben nada mientras está abierto): espacio o K reproducir/pausa, ← / → ±5 s, ↑ / ↓ (o RePág / AvPág) tema anterior/siguiente, Inicio / Fin, Esc cierra. Tab queda bloqueado (no cambia la capa del juego). Con Ctrl/Alt/Meta no hace nada (así siguen andando los atajos del navegador).
- **Bucle:** `tutLoop` con `requestAnimationFrame` propio, solo mientras está abierto; avanza `TUT.t` con el tiempo real × `TUT.rate` y redibuja con `tutRender()`. Al llegar al final se pausa; al reabrir sigue donde quedó (o vuelve al principio si había terminado).

### Capítulos (`TUT_CH`, 4:38 en total)
Cada capítulo es `{ic, t, c, d, cap, f}`: ícono, título, color del tema, duración en segundos, subtítulos `[[segundo, texto], …]` y `f(t)`, que devuelve el SVG del cuadro en el segundo `t` del capítulo (función pura del tiempo: por eso se puede adelantar y retroceder sin estado).

| # | Tema (color) | Capítulo | Dur. |
|---|---|---|---|
| 1 | Bases (azul `#5a8fd6`) | 🏁 Objetivo | 12 s |
| 2 | Bases | ♟ Las piezas (6 × 6 s, con panel de costo y población) | 36 s |
| 3 | Bases | ⏱ Tiempo real (recarga, choque, captura automática) | 14 s |
| 4 | Economía (dorado `#d6a43a`) | 💰 Oro y cristales | 14 s |
| 5 | Economía | 🏠 Construir (sombra verde/roja, evacuación) | 14 s |
| 6 | Economía | 🐎 Producción y población | 14 s |
| 7 | Economía | ♚ El rey | 12 s |
| 8 | Mundo (verde `#4fae6a`) | ★ Mejoras (vigía y mejor arma) | 12 s |
| 9 | Mundo | ⛰ Terreno | 12 s |
| 10 | Mundo | 🪓 Talar árboles (también abrir camino) | 12 s |
| 11 | Mundo | ⚓ Puerto y navegación | 14 s |
| 12 | Mundo | ⛏ Subsuelo y túneles | 16 s |
| 13 | Especiales (rojo `#c95b5b`) | 🧱 Muralla | 12 s |
| 14 | Especiales | 💚 Alfil sanador | 10 s |
| 15 | Especiales | ⚖ Asimetría | 12 s |
| 16 | Hierbas (violeta `#a46ad6`) | 🌿 Hierbas: juntar y pasar (con la guía de las 8) | 14 s |
| 17 | Hierbas | ✨ Los 8 poderes (8 × 4 s; textos en `T17`) | 32 s |
| 18 | Interfaz (gris `#8a96a8`) | 🖥 Interfaz y controles (HUD, grupos, minimapa, velocidad, atajos, botones) | 16 s |

Al principio de cada capítulo aparece su título en un cartel (`sBanner`) que se desvanece a los 2 s.

### Primitivas de dibujo (todas devuelven texto SVG)
- Tiempo: `tkey(t, [[t,x,y],…])` → `[x, y, f]` (interpolación suavizada entre claves; `f` = avance del tramo que se mueve, se usa para el arco del salto del caballo), `tsg`/`tln` (avance suavizado/lineal entre dos instantes), `tez`, `tcl`.
- Tablero: `tbd(cols, rows, c, ox, oy, ter)` crea un tablero de casillas de `c` px con origen `(ox, oy)`; `ter(x,y)` usa los códigos del juego (1 pasto, 2 arena, 3 agua, 4 árbol, 5 montaña) y del subsuelo (10 tierra, 11 túnel, 12 roca, 13 cámara). Opcionales `b.tdx(x,y)` (temblor del árbol) y `b.herb(x,y)` (hierba en la copa). `sBoard(b)` lo dibuja con los colores de `TC`/`UGC`. `tX`/`tY` pasan de casilla a píxel.
- Piezas y edificios: `sPc(b, glifo, bando, x, y, o)` con opciones `lift`, `tall`, `sel`, `ring` (recarga), `hp`, `prog`, `dot` (bonus blanco), `herb`/`use`, `mark` (★/↗), `axe`, `boat`, `glow`, `op`. `sBld` (edificio visto desde arriba; `castle:1` para el castillo), `sGhost`, `sPort`, `sWall`, `sHole`, `sCrys`, `sTree`, `sMount`.
- Efectos: `sSpark`, `sPuff`, `sRingFx`, `sBoom`, `sHeal`, `sShot`, `sFloat`, `sLeaves`. Interfaz: `sTx`, `sTag`, `sBox`, `sEmo`, `sGl`, `sBar`, `sDot`, `sHi`, `sOut`, `sHL`, `sCur` (cursor con clic), `sKey` (tecla).
- Los glifos de ajedrez dentro de texto llevan `VS` (`TG(g)`) para que Android no los muestre como emoji.

### Cómo agregar o cambiar un capítulo
- Sumar un objeto a `TUT_CH` en el orden deseado; `tutStarts`, la barra, las marcas y la lista se calculan solos.
- Escribir `f(t)` como función pura de `t` (sin variables que cambien entre cuadros) usando las primitivas; coordenadas del SVG: 640 × 360.
- Si una mecánica nueva del juego cambia algo que el tutorial explica, actualizar su capítulo y su subtítulo.
- Si `f` tira una excepción, `tutRender` muestra «Error en la escena: …» en lugar de romper el reproductor.

### Probado
- En Chromium sin pantalla, en tamaño PC y celular: las 18 escenas recorridas cada 0,25 s sin errores, pausa y reanudación del juego, Tab bloqueado, Esc cierra, carga desde la misma carpeta y carga a mano desde `#tutMiss`.

## 2. Arquitectura del archivo

Es un HTML con CSS y JavaScript dentro, sin librerías, más el archivo opcional del tutorial `ajedrez-rts-tutorial.js` (v30, sección 1q). Se dibuja en un `<canvas>` 2D (`#c`) a pantalla completa. Encima hay seis capas HTML:

- `#top`: barra superior con oro, ingreso por segundo y población.
- `#panel`: panel inferior izquierdo con mensaje de estado, vista de cola de producción y botones (con atajos de teclado subrayados); ocupa 150 px de alto y deja espacio a la derecha para `#mapDock`.
- `#rot`: barra superior derecha con el botón `🌿 Hierbas` (v29, abre `#herbBox`), el botón `Restart` (vuelve al menú inicial con `restartToMenu()`) y los botones de girar la cámara (`⟲`, `⟳`).
- `#speed` (v20): selector de velocidad del juego `#spdSel`, justo debajo de `#rot` (ver 1g). Desde v30 empieza con el botón `#tutBtn` (🎬 Tutorial).
- `#hud` (v17): fila de íconos de estado arriba de `#mapDock` (ver 1d), con el panel `#scoreBox` que se abre encima.
- `#mapDock`: dock inferior derecho que contiene la grilla de botones de **grupos de control** (`#groups`, 1 al 9) y `#miniWrap`, con el `<canvas id="miniMap">` (260×260 internamente) y encima el botón `#layerBtn` para cambiar de capa.

Overlays: `#start` (menú, con el botón `#tutStart` desde v30), `#tutMiss` (v30, aviso de tutorial no encontrado) y `#over` (fin de partida). Panel flotante `#herbBox` (v29): guía de hierbas. El overlay del reproductor `#tut` lo crea el archivo del tutorial.

El código está dividido en secciones con comentarios `/* ---------- nombre ---------- */`, en este orden:

1. **Constantes:**
   - `DEF`: piezas (`g`, `name`, `cost`, `time`, `speed` o `jump`, `cd`, `dmg`, `pop`, `hp`).
   - `BDEF`: edificios (`w`, `h`, `hp`, `cost`, `build`, `pop`, `makes[]` y banderas de dibujo).
   - `VALUE`, `BICON`, `BUILDABLE`, `POP_MAX`, `BPAL`, `RULE`, `INCOME`, `PER_PEON`, `SLIDE`, `PCOL`, `TC`.
   - `CHOP_TIME`, `gameSpeed` y `SPEEDS` (v20), junto a `DIG_TIME` y `SURFACE_TIME`.
   - `HEAL_CD`, `HEAL_AMOUNT`, `HEAL_UPG`, `LS`, `LS_SPEED`, `LS_MAP`, `MAP_SIZES` (v21).
   - `OCC_ALPHA`, `OCC_FADE` (v23).
   - `WALL_TIME`, `bScore` y `BDEF.muralla` (v24).
   - `BLACK_AURA_R`, `BLACK_AURA_DPS`, `WHITE_BONUS_N`, `WB_*` (v25).
   - `HERBS`, `HERB_N`, `HERB_P`, `EMOJI_FONT` (v26).
2. **Generación del mapa:** `genMap(seed, carve)` y `buildMap()`. Usa ruido de valor simétrico (`noiseField`) y umbrales por percentil (`pct`). Genera terreno, montañas (terreno 5) y la elevación; devuelve `{ter, tv, elev}`.
3. **Estado, Subsuelo y Cristales:** `newGame(n)` arma `G`. Incluye `genUnderground()`, `ugConnected()`, `seedCrystals()`, `seedHerbs()` (v26), `crystalYield(u)`, `harvesting(u)`, `drawGem()`, accesorios de piezas (`randAcc`, `drawAcc`) y helpers espaciales (`addU`, `addB`, `bCells`, `inFoot`, `free`, `canPlace(bx,by,w,h,type,team)`, `canEvacuate`, `evacuateFootprint` (v18), `ring`, `adjB`, `bCenter`).
3a. **Navegación** (`/* ---------- navegación ---------- */`, v16): `isWater`, `portB`, `isPort`, `navKind`, `navStep`.
3b. **Capas** (`/* ---------- capas ---------- */`): `passable`, `passFor` (v18), `chamberRect`, `inChamber`, `chamberCells`, `byDist`, `changeLayer`, `canDescend`, `holeOK`, `digMoves`, `digTick`, `surfaceTick`.
3c. **Tala de árboles** (`/* ---------- tala de árboles ... ---------- */`, v20): `nextTo`, `chopping`, `chopTick`, `fellTree`.
3c⁰. **Hierbas** (`/* ---------- hierbas (v26, Parte 1: recolección) ---------- */`, justo después de `fellTree`): `canUseHerb`, `herbTypes` (v27), `takeHerb`. El traspaso (v27) está repartido: `orderGiveHerb` y `giveFrom` en la sección de órdenes, la rama `giveHerb` en `think`, y `giveHerbTap` junto a `clearSel` en la sección de entrada.
3c'. **Muralla** (`/* ---------- muralla (peones que se sacrifican) ---------- */`, v24): `wallA/wallB/wallHover`, `wallPeons`, `wallSiteOK`, `wallCellOK`, `wallCells`, `wallEscape`, `confirmWall`, `wallTap`, `wallTick`.
3c'''. **Poderes de las hierbas** (`/* ---------- poderes de las hierbas (v28, Parte 3) ---------- */`, justo antes de `passFor`): `morph`, `morphPass`, `fischer`, `polgarShield`, `herbShot`, `herbHeal`, `herbRevive`.
3c''. **Asimetría** (`/* ---------- asimetría: territorio negro y bonus blanco (v25) ---------- */`): `blackCastleId`, `blackCastleC`, `inBlackZone`, `hasWhiteBonus`.
3d. **Curación** (`/* ---------- curación (alfil sanador) ---------- */`, v21): `maxHp`, `healTick`.
4. **Reglas de movimiento:**
   - `blockedFor(u,x,y)`, `eachMove(u,x,y,fn)`, `knightBlocked(x,y,nx,ny)`, `stepCells`, `captureCells(u,x,y,tx,ty)`, `bCellIn`.
   - `plan(u,isGoal,tx,ty,nb=eachMove)`: **Dijkstra con montículo** sobre el grafo de movimientos legales. `nb` permite cambiar el generador de vecinos (lo usa la excavación con `digMoves`).
5. **Acciones de unidades:**
   - `isWatch(u)`, `upgradeUnit(u)`.
   - `startMove(u,step)`, `endMove`, `updSlide`, `updJump`.
   - `strike(v,k,damage)`: aplica daño (contemplando rey, mejoras y flechas); `kill(v,k)` limpia también los grupos.
   - `hit(u,b,c)`: golpe a edificio (+2 si `u.upgraded`); `destroyB`.
   - `think(u)`: maneja entrada del rey al castillo (`g.k==='enter'`), disparo de flechas del peón vigía (`isWatch`), persecución de órdenes y ataques automáticos.
6. **Órdenes:** `orderMove(ids,tx,ty,L=viewLayer)` (filtra vigías y piezas de otra capa, respeta el color del alfil y, en la superficie, reparte en agua o en tierra según el destino), `orderAtk`, `orderAtkB`, `orderDown`, `orderUp`, `orderPortal`, `orderDig`, `orderHeal` (v21), `orderGiveHerb` y `nearestHerbReceiver` (v27/v29), `orderChop` (v20).
7. **Edificios y producción:** `spawnCell(b,x,y)`, `queueUnit(b,type)`, `releaseKing(b)` y `updB(b,dt)` (pausa peones si `kingOutside(b.team)`).
8. **IA** (solo en modo IA, una vez por segundo): `aiTick`, `aiBuild`, `aiProduce`.
9. **Población:** `popUsed`, `popCap`, `roomFor`, `kingOutside`, `kingTaken`, `canMake`.
10. **Bucle:** `income(team)` (suma base + peones + cristales) y `update(dt)`.
11. **Cámara y elevación:** ver la sección 4 (incluye `ELEV_K`, `EH`, `zAt`, `isoE`, `unIsoE`, `bElev`).
12. **Dibujo:** `drawUnderground`, `drawHole`, `drawBoat` y `drawDock` (v16), `terrainOrder`, `tileColor`, `lipColor`, `drawTerrain` (escalones con faldones y cristales), `drawTree` (temblor, muesca y barra de tala, v20), `drawMountain`, `drawAxe` (v20), `drawU` (hachita mientras tala, v20) (escala vertical para vigía, barra de vida, gema de recolección, etiqueta de grupos `1·2` y símbolo de mejora `↗`/`★`), `drawWall` (v24, tramo de muralla unido a sus vecinos), `drawB` (apoyado en el nivel más alto de su huella, con cimiento de piedra si pisa niveles distintos), `drawBars` (muestra multiplicador `×N` de cola; nada para la sombra `id -1`) y `draw()` (incluye los efectos `'arrow'`, `'chip'` y `'leaves'` y la sombra del edificio en modo construcción, v19). `bAlpha` (v19) multiplica la opacidad de `drawB`/`drawDock`. Justo después de `bAlpha`: `occLast`, `bSilhouette`, `inPoly`, `unitProbes` y `bHidesUnit` (v23, edificios transparentes cuando tapan piezas; ver 1j).
13. **Entrada:** diferencia controles táctiles (`tap`) de controles de escritorio con mouse (`desktopSelect`, `desktopOrder`, doble clic para seleccionar grupo). `cellOrder(cell)` resuelve los toques sobre bocas de túnel, tierra del subsuelo y árboles (v20). Ver sección 5.
14. **Interfaz y Atajos** (después de `restartToMenu`: menú herbal `buildHerbBox`/`toggleHerbBox` (v29) y cargador del tutorial `openTutorial`/`runTutorialSrc`/`tutIsOpen` (v30)): `updLayerBtn()`, `setView(L)` (Tab / V / `#layerBtn`), `sig()` (incluye `viewLayer`, la capa de cada pieza seleccionada y `holeOK`), `shortcutFor()`, `deleteSelection()` (teclas `Delete`/`Backspace`), `refreshPanel()`, `refreshTop()`, `restartToMenu()`.
15. **Grupos y Minimapa:** `saveGroup(n)`, `selectGroup(n)`, `drawMini(now)` (actualiza cada 100 ms con caché de terreno en `miniTerrain`; anillo de alerta de ataque) y `miniNavigate(e)`.
Al final del bloque de interfaz están `markMap` y `savedMap` (v21), junto a los botones `[data-n]`.

16. **Cámara con flechas (v22):** `arrowKeys`, `ARROW_DIR`, `arrowPan` (ver 1i), justo antes de `frame`.

17. **Barra de estado (v17):** `idleList`, `score`, `hudCycleGo`, `kingInfo`, `refreshHud` (ver 1d) y el bucle principal `frame(now)`, que también llama a `refreshHud(now)` y simula `dt·gameSpeed` en pasos de ≤ 0,05 s (v20). Justo después: `setSpeed` (que guarda en `localStorage` desde v21), la lectura de la velocidad guardada, el listener de `#spdSel` y las teclas `+`/`−` (v20). La última línea arranca la partida de fondo con el mapa guardado (`newGame(nSaved||16)`).

## 3. Estado global `G` (después de `newGame`)

```
G.t                tiempo de juego (s)
G.U  Map id→pieza  {id,team,type,x,y,px,py,layer,dig,hp,upgraded,upgradedAt,hurt,acc,state:'idle'|'slide'|'jump',cd,goal,plan,mv,mvStart,lunge,lx,ly,air,fails,building,evac,cut,healCd,bonus,cdMul,herb,herbCd}
G.B  Map id→edificio {id,team,type,bx,by,w,h,done,prog,hp,queue:[{type,t}],exit?:{x,y},kingInside?:pieza,seeA?:0..1 (fundido de transparencia, solo dibujo, v23),bornAt?:G.t (tramo de muralla, animación de subida, v24)}
G.gold[2]          oro por bando
G.groups[2][10]    array por bando de 10 Sets (índices 1..9 usados) con ids de unidades
G.activeGroups[2]  grupo activo actual (0 = ninguno, 1..9) por bando
G.occ[2][N*N]      id de la pieza que ocupa cada casilla, por capa (0 = libre)
G.bmap[N*N]        id del edificio en cada casilla
G.res[2][N*N]      reserva del caballo en el aire (casilla de aterrizaje), por capa
G.ug[N*N]          subsuelo: 0 tierra, 1 túnel, 2 roca, 3 fuera del mapa
G.digP[N*N]        progreso de excavación 0..1
G.holes[N*N]       1 = boca de túnel que une las dos capas
G.chopP[N*N]       progreso de tala 0..1 por árbol (v20)
G.chopAt[N*N]      último G.t con hachazo en ese árbol, para el temblor (v20)
G.ter, G.solid, G.tv   terreno (0..5), sólidos, valor aleatorio por casilla
G.elev[N*N]        nivel de elevación visual 0..2 (solo gráfico)
G.crystals[N*N]    1 si la casilla tiene depósito de cristales, 0 si no
G.herbs[N*N]       0 sin hierba, 1..8 = id de HERBS en ese árbol (v26)
G.fx               efectos visuales {k:'mark'|'puff'|'spark'|'boom'|'spawn'|'arrow'|'dust'|'chip'|'leaves'|'heal',x,y,tx?,ty?,t,layer?}
G.over             null | 'win' | 'lose' | 'w0' | 'w1'
G.st[2]            estadísticas por bando {earned,kills,razed,upg} (puntaje, v17)
G.alert[2]         último ataque recibido por bando {x,y,t,layer} o null (v17)
G.ai, G.ghost (fantasma de colocación {bx,by,w,h}), G.pc (centro de la base blanca)
```

`goal` de una pieza:

- `{k:'move',x,y}`
- `{k:'atk',id}` (atacar pieza)
- `{k:'atkB',id}` (atacar edificio)
- `{k:'build',id}` (construir)
- `{k:'enter',id}` (rey yendo a entrar a su propio castillo)
- `{k:'down',id}`, `{k:'up',id}`, `{k:'portal',x,y,from}`, `{k:'dig',x,y}`, `{k:'surface',t}` (subsuelo, ver 1b)
- `{k:'heal',id}` (alfil yendo a ponerse al lado de una pieza aliada para curarla; v21, ver 1h)
- `{k:'giveHerb',id}` (ir al lado de una pieza aliada de la misma capa y pasarle la hierba; si ella llevaba otra, se intercambian; v27, ver 1n)
- `{k:'wall',x,y,t}` (peón que va a su casilla y se convierte en un tramo de muralla; `t` = segundos parado ahí; v24, ver 1k)
- `{k:'chop',x,y,direct?,skip?}` (talar el árbol de (x,y) y seguir con los cercanos; `skip` = árboles a los que no pudo llegar; v20, ver 1g; `direct` = orden del jugador a ese árbol: si tenía hierba, el peón la saca y se frena; v26, ver 1m)

Otras variables globales de interfaz:

- `me`: bando activo.
- `viewLayer`: capa que se está mirando (0 superficie, 1 subsuelo).
- `sel`: igual a `sels[me]`, con forma `{u:Set de ids, b:id de edificio}`.
- `mode`: `'none'`, `'place'` (eligiendo dónde construir), `'spawn'` (eligiendo la casilla de salida `b.exit` del edificio) `'wall'` (marcando la muralla, v24) `'giveHerb'` (eligiendo a qué pieza aliada pasarle la hierba, v27) o `'tele'` (eligiendo adónde teletransportar la Dama, v28).
- `wallA`, `wallB`, `wallHover`: inicio, final y casilla bajo el mouse del modo muralla (v24).
- `giveFrom`: id de la pieza que entrega en el modo `'giveHerb'` (v27).
- `teleFrom`: id de la Dama que se teletransporta en el modo `'tele'` (v28).
- `placeType`, `spawnType`, `gameMode` (`'human'` o `'ai'`).
- `gameSpeed`: multiplicador del tiempo de juego (v20).

**Coordenadas:** la casilla (x,y) ocupa el cuadrado continuo [x, x+1] × [y, y+1]. El centro de la casilla es (x+0,5, y+0,5). `idx(x,y) = y*N + x`.

## 4. Cámara, proyección y rotación (importante)

- **Mundo** (x,y) → **vista rotada** (vx,vy) con `toV`, que depende de `rot` (0..3). La inversa es `fromV`.
- **Vista** → **pantalla** con `projV`: `[ox + (vx-vy)*tw/2, oy + (vx+vy)*th/2]`, donde `th = tw/2`. La inversa es `unProjV`.
- **Usá siempre** `iso(x,y)` y `unIso(sx,sy)` para ir del mundo a la pantalla y viceversa: ya incluyen la rotación.
- **Orden de dibujo:** `depth(cx,cy)` es la suma de las coordenadas de vista del centro del objeto. Mayor profundidad significa más adelante, y se dibuja después.
- **Caras visibles** de cajas y paredes: siempre las que miran hacia +vx y +vy en la vista. Para dibujar un rectángulo del mundo en la vista, usá `viewRect(x0,y0,w,h)`.
- **Elevación en pantalla:**
  - `zAt(wx,wy)`: nivel continuo en coordenadas de mundo (centro de casilla = x+0,5). Interpola entre casillas, así las piezas suben y bajan suavemente al moverse.
  - `isoE(wx,wy)`: como `iso`, pero sobre la superficie elevada. **Usalo para todo lo que se apoya en el suelo** (piezas, árboles, efectos, rutas, marcas de movimiento).
  - `unIsoE(sx,sy)`: como `unIso`, pero devuelve la casilla elevada que realmente se ve en ese punto (prueba los niveles 0..2 y se queda con la de mayor profundidad). Lo usan `tap`, `desktopSelect` y `desktopOrder`. Para la cámara, el minimapa y la rotación se sigue usando `unIso`.
  - `tilePts(x,y,s)` ya incluye la elevación de la casilla, así que todos los resaltados (salida, fantasma de construcción, marcas) quedan a la altura correcta.
  - `bElev(b)` devuelve `[nivel mínimo, nivel máximo]` bajo un edificio. `drawB`, `tilePtsRect` y `buildingAt` usan el máximo como base.
- **Zoom:** `tw` es el ancho de casilla en píxeles, limitado por `twLimits()` (zoom mínimo = 0,9 × lo necesario para ver todo el mapa; alcanza para 56×56). Funciones: `zoomAt(px,py,factor)`, `centerOn(x,y)`, `clampCam()`. `TOP` (44) y `BOT` (150) son las alturas de la barra superior y el panel.

## 5. Entrada (Táctil, Mouse y Teclado)

### Táctil (Celular / Tablet)
- **Un dedo quieto (`tap`):**
  - Tocar una pieza o edificio propio la selecciona (en unidades, alterna agregando/quitando de la selección).
  - Tocar una pieza o edificio del otro color: si hay piezas seleccionadas, ordena atacar; si no hay nada seleccionado, cambia el bando activo (`setSide`) y lo selecciona.
  - Con el **rey** seleccionado, tocar el propio castillo le ordena entrar (`{k:'enter'}`).
  - Con **peones** seleccionados, tocar un edificio propio sin terminar los manda a construirlo.
  - Con piezas seleccionadas, tocar el **propio castillo** las baja al subsuelo (el rey, en cambio, entra al castillo).
  - Tocar una **boca de túnel** manda a las piezas seleccionadas de esa capa a cruzarla.
  - En el subsuelo, tocar **tierra** con peones seleccionados la manda a excavar.
  - Con piezas seleccionadas, tocar un **puerto propio terminado** las manda a esa casilla (v16).
  - Con **peones** seleccionados, tocar un **árbol** los manda a talarlo; las demás piezas se acercan (v20).
  - Con **alfiles** seleccionados, tocar una pieza propia **herida** (que no esté elegida) los manda a curarla (v21).
  - **Modo muralla (v24):** tocar inicio, tocar final y tocar la muralla verde (o «Confirmar muralla»).
  - **Teletransporte (v28):** Dama con 🌸 sola elegida, «Teletransportar 🌸» y tocar una casilla libre.
  - **Pasar hierba (v27/v29):** con una sola pieza con hierba elegida, «Pasar hierba 🌿» la lleva sola a la aliada compatible más cercana; «Elegir a quién» y tocar una aliada para elegirla.
  - **Tutorial (v30):** 🎬 junto a la velocidad o «Ver el tutorial en video» en el menú.
  - Tocar una casilla vacía (de tierra o de agua) mueve la selección.
- **Un dedo que se mueve:** recuadro de selección. Elige el bando con más piezas dentro del recuadro.
- **Varios dedos:** si alguno se mueve más de 14 px, activa cámara (paneo con punto medio y zoom pellizcando) y bloquea toques (`lockAll`).

### Mouse (PC / Escritorio)
- **Clic izquierdo (`desktopSelect`):** selecciona una sola unidad o edificio propio (o cambia de bando en modo humano). Clic izquierdo en el vacío o fuera del mapa deselecciona todo (`clearSel`).
- **Ctrl + Clic izquierdo en una pieza:** si hay un grupo activo (`G.activeGroups[me]`), suma esa pieza al grupo activo y selecciona todo el grupo.
- **Doble clic izquierdo en una pieza (`selectUnitGroup`):** si la pieza pertenece a uno o más grupos, selecciona el grupo de menor número al que pertenece.
- **Arrastrar con clic izquierdo:** recuadro de selección múltiple.
- **Modo construcción (v19):** el edificio translúcido sigue al cursor; **clic derecho** sin arrastrar lo construye ahí (`placeTap`).
- **Modo muralla (v24):** clic = inicio; la muralla sigue al cursor; otro clic (izquierdo o derecho) la levanta.
- **Modo pasar hierba (v27):** clic izquierdo o derecho sobre una pieza aliada.
- **Modo teletransporte (v28):** clic izquierdo o derecho sobre una casilla libre.
- **Clic derecho sobre una aliada que puede usar la hierba** que lleva una elegida que no la puede usar: se la pasa directo (v27).
- **Clic derecho sin arrastrar (`desktopOrder`):** da órdenes a las unidades seleccionadas (mover a casilla —incluidos el agua y los puertos propios terminados—, atacar unidad/edificio enemigo, construir edificio incompleto, talar un árbol con peones (v20), mandar a los alfiles a sanar/seguir una pieza propia (v21) o meter al rey en el castillo).
- **Arrastrar con botón derecho (> 6 px):** mueve la cámara (paneo).
- **Flechas del teclado (v22):** mantenerlas mueve la cámara; con Mayús, más rápido.
- **Clic central (rueda apretada):** gira la cámara 90° (`rotate(1)`).
- **Rueda del mouse:** zoom.

### Teclado y Controles de UI
- **Atajos del panel (`panelShortcuts`):** cada botón del panel subraya automáticamente una letra disponible (`shortcutFor`). Pulsar esa letra en el teclado dispara el botón.
- **Grupos de unidades (1…9):**
  - `Ctrl + 1…9` (o `Ctrl + clic` en los botones de `#groups`): guarda las unidades seleccionadas en ese grupo (`saveGroup`).
  - `1…9` (o clic en `#groups`): selecciona las unidades vivas de ese grupo (`selectGroup`).
- **Cambiar de capa:** `Tab` o `V` (o el botón ⛏/🌱 sobre el minimapa).
- **Mover la cámara (v22):** flechas `↑ ↓ ← →` (Mayús + flecha = más rápido).
- **Velocidad del juego (v20):** `+` (o `=`) sube y `−` (o `_`) baja un paso entre 0,75x y 2x. También el selector ⏩ arriba a la derecha.
- **Eliminar (`Delete` o `Backspace`):** mata las unidades propias seleccionadas o destruye el edificio propio seleccionado (`deleteSelection()`), sin devolver oro. Eliminar el propio castillo hace perder la partida.
- **Íconos de estado (`#hud`, v17):** tocar 💤 / ⚔ / 🏭 va al siguiente ocioso; Mayús+clic en 💤 o ⚔ elige a todos. Teclas **`.`** (peón ocioso) y **`,`** (ejército ocioso). ♚ va al rey, ⚠ al último ataque y 🏆 abre el detalle de puntos.
- **Tutorial abierto (v30):** el teclado lo maneja el reproductor (espacio, flechas, Inicio/Fin, Esc); ningún atajo del juego responde y la partida queda en pausa.
- **Minimapa (`#miniMap`):** tocar o arrastrar con clic izquierdo sobre el minimapa centra la cámara inmediatamente en esa zona del mapa (`miniNavigate`).

## 6. Cómo extender sin romper nada

- **Nueva pieza:**
  1. Entrada en `DEF` (campos `g`, `name`, `cost`, `time`, `speed` o `jump`, `cd`, `dmg`, `pop` y opcionalmente `hp`).
  2. Sus movimientos en `eachMove` y `captureCells`. Si es deslizante, alcanza con agregarla a `SLIDE`.
  3. Entradas en `VALUE`, `RULE` y `HEAD` (punto alto de la cabeza del glifo, para ubicar el accesorio).
  4. Agregarla a `makes` de algún edificio y definir qué hace `upgradeUnit(u)` con ella.
- **Nuevo edificio:** entrada en `BDEF` (con `w`, `h`, `name`; el resto del código ya es genérico en tamaño), más `BICON` y `BUILDABLE`. El dibujo lo resuelven `drawB` y las banderas de estilo. Si tiene restricciones de lugar, agregalas en `canPlace` por `type` (como el puerto). Si cuesta un monto nuevo, sumalo a la lista de umbrales de oro de `sig()`.
- **Navegación:** todo movimiento nuevo de la capa 0 tiene que respetar `navStep` (tierra↔agua solo por puerto). Si agregás una pieza que se mueve distinto, aplicá la regla en `eachMove` y en `captureCells`. Para saber si una casilla es agua o puerto usá `isWater`/`isPort`/`navKind`, no `G.solid` (el agua sigue siendo «sólida» para construir y nacer).
- **Mover una pieza:** nunca le cambies `x` o `y` directamente. Usá `startMove` / `endMove`, o mantené sincronizados `G.occ[u.layer]` y `G.res[u.layer]`. Para pasar de capa usá **solo** `changeLayer`.
- **Capas:** todo código nuevo que mire ocupación, pasabilidad o enemigos tiene que usar la capa de la pieza (`u.layer`) o `viewLayer` para la interfaz. Los efectos nuevos deberían llevar `layer`. Recordá que los peones vigías (`isWatch(u)`) no deben moverse.
- **Matar una pieza:** usá `kill` (que también la borra de `G.groups`) o `strike` para respetar la vida. **Destruir un edificio:** usá `destroyB`, que también detecta el fin de partida.
- **Bando del jugador:** cualquier lógica de interfaz tiene que usar `me` y `canCtl(team)`, no el bando 0 fijo. La IA asume que es el bando 1.
- **Estadísticas y alertas (v17):** si agregás una nueva forma de matar piezas o destruir edificios por un enemigo, actualizá `G.st[...].kills` / `razed` y `G.alert[...]` igual que en `strike` y `hit`. Si agregás un nuevo tipo de ingreso, sumalo dentro del bucle de `update` que también acumula `earned`.
- **Colocación (v18):** si agregás otra forma de colocar edificios del jugador, llamá a `canPlace(...,team)` y, después de `addB`, a `evacuateFootprint(b)`. Si una pieza nueva verifica pasabilidad para sí misma, usá `passFor(u,i)`, no `passable`.
- **Firma de interfaz:** si agregás información que cambia lo que muestra el panel, sumala a `sig()`. Si no, el panel no se actualiza.
- **Terreno nuevo:** agregalo a `TC` (dos colores de damero), al cálculo de `G.solid` en `newGame`, a los colores del minimapa en `drawMini` y, si tiene relieve, a la lista de objetos de `draw()`.
- **Opacidad de edificios (v19):** si agregás transparencia dentro de `drawB`/`drawDock`, multiplicala por `bAlpha` en vez de asignar un valor fijo; si no, la sombra de construcción sale opaca.
- **Edificios transparentes (v23):** si cambiás cómo se dibuja un edificio (más alto, techo nuevo, torre, etc.), actualizá la altura en `bSilhouette` para que la detección de piezas tapadas siga coincidiendo con el dibujo. Si un edificio nuevo es plano (como el puerto), excluilo en `bHidesUnit`.
- **Murallas (v24):** un tramo es un edificio `seg` de 1×1. Si agregás un edificio que no debe tapar flechas o que se une a sus vecinos, usá la misma bandera. Para el valor de un edificio en el puntaje usá `bScore(type)`, no `cost`. Si una pieza nueva debería frenar ante murallas igual que el caballo… hoy el caballo las salta: para cambiarlo, agregá los edificios `seg` a `knightBlocked`.
- **Tiempo de juego (v20):** toda lógica nueva que dependa del tiempo tiene que usar el `dt` que recibe `update(dt)` o `G.t`, nunca `performance.now()` ni `Date`; si no, no respeta el selector de velocidad. No hagas pasos de simulación de más de 0,05 s.
- **Vida y curación (v21):** si agregás daño que no mata de un golpe, la pieza va a mostrar barra y los alfiles la van a curar solos. Para el máximo usá `maxHp(v)`. Si agregás otra forma de curar, respetá el tope `maxHp` y generá el efecto `'heal'`.
- **Persistencia (v21):** todo acceso a `localStorage` pasa por `LS.get`/`LS.set`; no lo llames directo (puede tirar excepción en algunos navegadores o al abrir el archivo local).
- **Cambiar terreno en partida (v20):** si una acción nueva modifica `G.ter`, actualizá también `G.solid` y poné `miniTerrain = null` para que el minimapa se redibuje (ver `fellTree`).
- **Elevación:** nunca uses `iso`/`unIso` directo para cosas apoyadas en el suelo o para interpretar toques: usá `isoE` y `unIsoE`.
- **Asimetría (v25):** si agregás otra forma de que una pieza dañe a otra o a un edificio, decidí si consume el bonus blanco (`hasWhiteBonus`, `u.bonus--`) igual que `strike`/`hit`. Si agregás otro lugar donde se fija la recarga después de un ataque, multiplicá por `u.cdMul||1` y ponelo en 0. Si una muerte nueva la causa el territorio, sumá a `G.st[1].kills`.
- **Hierbas (v26):** para saber si una pieza puede usar su hierba usá `canUseHerb(u)`. Toda forma nueva de sacar una hierba de un árbol tiene que dejar `G.herbs[i] = 0`. Si una acción nueva cambia un árbol a otro terreno, limpiá también `G.herbs` (como `fellTree`). Si cambiás cómo se dibuja la copa, revisá la altura del ícono en `drawTree`. Para dibujar emojis en el canvas usá `EMOJI_FONT`. Para mover hierbas entre piezas usá `orderGiveHerb` (o reproducí su intercambio `tmp`), nunca dupliques una hierba: en todo momento cada hierba está en un árbol, en una pieza o perdida. **Poderes (v28):** toda forma nueva de matar una pieza tiene que pasar por `kill(v,k)` (para que funcionen las resurrecciones) y respetar su valor de retorno; con `k = null` no hay resurrección. Si agregás daño nuevo a unidades, decidí si pasa por `strike` (Égida, Fischer) o no. Todo movimiento deslizante nuevo tiene que usar `m.len` en `updSlide` si puede saltear casillas.
- **Tutorial (v30):** el tutorial lee constantes globales del HTML (lista en 1q). Si renombrás o cambiás el formato de `PCOL`, `BPAL`, `TC`, `UGC`, `HERBS` o `DEF`, revisá `ajedrez-rts-tutorial.js`. Si agregás una mecánica, sumale un capítulo o actualizá el que corresponda. Toda simulación nueva tiene que quedar dentro del `if` de `frame` que mira `tutIsOpen()`.
- **Rendimiento:** `plan` se llama cada vez que una pieza termina un movimiento. En mapas de 32×32 tarda menos de 0,3 ms; evitá hacerlo más caro. En 56×56 un cuadro completo de dibujo tarda unos 1–9 ms en una PC (medido en Chromium sin GPU). El minimapa cachea el terreno base en `miniTerrain` y se redibuja como máximo cada 100 ms (`drawMini`).

## 7. Preferencias del autor

- Entregar siempre **el HTML completo para descargar** y, junto con cada HTML nuevo, este manual técnico actualizado (para que otra IA pueda seguir). Desde v30 el tutorial va en un segundo archivo, `ajedrez-rts-tutorial.js`, pedido así por el autor: entregar los dos.
- Tiene que funcionar en **celular** (Chrome en Android) y en PC, sin scroll de página.
- Cambios acotados a lo pedido ("no cambies nada más"). Si hace falta tocar otra cosa, avisarlo.