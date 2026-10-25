# Ajedrez RTS — manual técnico para continuar el desarrollo

Este documento acompaña a `ajedrez-rts.html`. Está pensado para que un modelo de lenguaje (ChatGPT, Gemini, Claude, etc.) entienda el juego y el código antes de modificarlo. Leelo completo y después abrí el HTML.

## 0. Historial de versiones

- **v17 — Barra de estado estilo Age of Empires** (esta versión): fila de íconos `#hud` arriba del minimapa con peones ociosos, ejército ocioso, edificios sin cola, estado del rey, alerta de ataque, puntaje de los dos bandos (con detalle) y reloj. Estadísticas nuevas `G.st` y alertas `G.alert`. Ver la sección **1d**.
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
- **Peones:** construyen edificios, recolectan cristales de forma pasiva al quedarse quietos encima y pueden convertirse en **vigías con arco**.
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
| alfil | diagonal, cualquier distancia | 0,22 | 0,7 | 70 | 9 | 2 | 1 | 1 (+1 mejorado) | 2 (+2 mejorado) | templo |
| torre | ortogonal, cualquier distancia | 0,42 | 0,9 | 120 | 12 | 3 | 1 | 1 (+1 mejorado) | 3 (+2 mejorado) | torreon |
| dama | ortogonal y diagonal | 0,17 | 0,5 | 220 | 16 | 4 | 1 | 1 (+1 mejorado) | 3 (+2 mejorado) | palacio |
| rey | 1 casilla en 8 direcciones | 1,1 | 0,8 | 160 | 14 | 3 | **24** | **6** (+1 mejorado) | **12** (+2 mejorado) | castillo |

- **Rey y guarnición en el castillo:** uno solo por bando, vivo, guardado en el castillo o en cola (`kingTaken`). Tiene **24 de vida**, pega **6 de daño** a unidades (12 a edificios) y cuando lo atacan sin matarlo, pierde vida y el atacante rebota sin ocupar su casilla.
  - **Restricción de peones:** mientras el rey está **afuera en el tablero** (`kingOutside(team)`), el castillo **no puede iniciar ni avanzar la producción de peones** (se pausa).
  - **Entrar/Salir del castillo:** seleccionando al rey y tocando/haciendo clic derecho en el propio castillo, recibe la orden `{k:'enter', id:b.id}`. Al llegar a una casilla adyacente, desaparece del mapa y se guarda en `b.kingInside` (sigue contando para la población). Desde el panel del castillo se lo puede volver a sacar (`releaseKing`).
- **Mejoras individuales (`upgraded`, costo 40 de oro):** cada unidad individual admite una mejora única seleccionándola sola (`upgradeUnit(u)`):
  - **Peón → Peón vigía (`isWatch(u)`):** se vuelve 65% más alto visualmente (animado con `upgradedAt`) y muestra el ícono `↗`. Queda **fijo en su casilla** (no se mueve ni construye) y dispara flechas (`fx` tipo `'arrow'`) a unidades enemigas en un radio de hasta **3 casillas** con línea de visión despejada (sin sólidos ni edificios en el medio), haciendo **0,25 de daño** cada **1,5 s** de recarga (4 flechas matan una pieza común de 1 de vida).
  - **Demás piezas → Mejor arma:** muestran una estrella `★`, suman **+1 de daño** contra unidades en `strike` y **+2 de daño** contra edificios en `hit`.
- **Alfil:** solo pisa casillas de un color. El color queda determinado por la casilla donde nace.
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

`G.ter[i]` vale 0 vacío (fuera del mapa), 1 pasto, 2 arena, 3 agua, 4 árbol o **5 montaña**. Agua, árboles, montañas y vacío siguen marcados en `G.solid` (no se construye, no nacen piezas, cortan la vista del vigía), **pero desde v16 el agua se puede ocupar** en la superficie: `passable` la deja pasar y la regla `navStep` decide cuándo se entra o se sale (sección 1c). El caballo salta por encima de agua y árboles, pero **no** de montañas.

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
- `passable(L,i)`: en la capa 0 es «no sólido **o agua**» y «sin edificio **o con un puerto terminado**» (v16); en la capa 1 es `G.ug[i] === UG_OPEN`. `blockedFor`, `updSlide`, `updJump` y `orderMove` usan esta función.
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

## 2. Arquitectura del archivo

Es un único HTML con CSS y JavaScript dentro, sin librerías. Se dibuja en un `<canvas>` 2D (`#c`) a pantalla completa. Encima hay cinco capas HTML:

- `#top`: barra superior con oro, ingreso por segundo y población.
- `#panel`: panel inferior izquierdo con mensaje de estado, vista de cola de producción y botones (con atajos de teclado subrayados); ocupa 150 px de alto y deja espacio a la derecha para `#mapDock`.
- `#rot`: barra superior derecha con el botón `Restart` (vuelve al menú inicial con `restartToMenu()`) y los botones de girar la cámara (`⟲`, `⟳`).
- `#hud` (v17): fila de íconos de estado arriba de `#mapDock` (ver 1d), con el panel `#scoreBox` que se abre encima.
- `#mapDock`: dock inferior derecho que contiene la grilla de botones de **grupos de control** (`#groups`, 1 al 9) y `#miniWrap`, con el `<canvas id="miniMap">` (260×260 internamente) y encima el botón `#layerBtn` para cambiar de capa.

Overlays: `#start` (menú) y `#over` (fin de partida).

El código está dividido en secciones con comentarios `/* ---------- nombre ---------- */`, en este orden:

1. **Constantes:**
   - `DEF`: piezas (`g`, `name`, `cost`, `time`, `speed` o `jump`, `cd`, `dmg`, `pop`, `hp`).
   - `BDEF`: edificios (`w`, `h`, `hp`, `cost`, `build`, `pop`, `makes[]` y banderas de dibujo).
   - `VALUE`, `BICON`, `BUILDABLE`, `POP_MAX`, `BPAL`, `RULE`, `INCOME`, `PER_PEON`, `SLIDE`, `PCOL`, `TC`.
2. **Generación del mapa:** `genMap(seed, carve)` y `buildMap()`. Usa ruido de valor simétrico (`noiseField`) y umbrales por percentil (`pct`). Genera terreno, montañas (terreno 5) y la elevación; devuelve `{ter, tv, elev}`.
3. **Estado, Subsuelo y Cristales:** `newGame(n)` arma `G`. Incluye `genUnderground()`, `ugConnected()`, `seedCrystals()`, `crystalYield(u)`, `harvesting(u)`, `drawGem()`, accesorios de piezas (`randAcc`, `drawAcc`) y helpers espaciales (`addU`, `addB`, `bCells`, `inFoot`, `free`, `canPlace(bx,by,w,h,type)`, `ring`, `adjB`, `bCenter`).
3a. **Navegación** (`/* ---------- navegación ---------- */`, v16): `isWater`, `portB`, `isPort`, `navKind`, `navStep`.
3b. **Capas** (`/* ---------- capas ---------- */`): `passable`, `chamberRect`, `inChamber`, `chamberCells`, `byDist`, `changeLayer`, `canDescend`, `holeOK`, `digMoves`, `digTick`, `surfaceTick`.
4. **Reglas de movimiento:**
   - `blockedFor(u,x,y)`, `eachMove(u,x,y,fn)`, `knightBlocked(x,y,nx,ny)`, `stepCells`, `captureCells(u,x,y,tx,ty)`, `bCellIn`.
   - `plan(u,isGoal,tx,ty,nb=eachMove)`: **Dijkstra con montículo** sobre el grafo de movimientos legales. `nb` permite cambiar el generador de vecinos (lo usa la excavación con `digMoves`).
5. **Acciones de unidades:**
   - `isWatch(u)`, `upgradeUnit(u)`.
   - `startMove(u,step)`, `endMove`, `updSlide`, `updJump`.
   - `strike(v,k,damage)`: aplica daño (contemplando rey, mejoras y flechas); `kill(v,k)` limpia también los grupos.
   - `hit(u,b,c)`: golpe a edificio (+2 si `u.upgraded`); `destroyB`.
   - `think(u)`: maneja entrada del rey al castillo (`g.k==='enter'`), disparo de flechas del peón vigía (`isWatch`), persecución de órdenes y ataques automáticos.
6. **Órdenes:** `orderMove(ids,tx,ty,L=viewLayer)` (filtra vigías y piezas de otra capa, respeta el color del alfil y, en la superficie, reparte en agua o en tierra según el destino), `orderAtk`, `orderAtkB`, `orderDown`, `orderUp`, `orderPortal`, `orderDig`.
7. **Edificios y producción:** `spawnCell(b,x,y)`, `queueUnit(b,type)`, `releaseKing(b)` y `updB(b,dt)` (pausa peones si `kingOutside(b.team)`).
8. **IA** (solo en modo IA, una vez por segundo): `aiTick`, `aiBuild`, `aiProduce`.
9. **Población:** `popUsed`, `popCap`, `roomFor`, `kingOutside`, `kingTaken`, `canMake`.
10. **Bucle:** `income(team)` (suma base + peones + cristales) y `update(dt)`.
11. **Cámara y elevación:** ver la sección 4 (incluye `ELEV_K`, `EH`, `zAt`, `isoE`, `unIsoE`, `bElev`).
12. **Dibujo:** `drawUnderground`, `drawHole`, `drawBoat` y `drawDock` (v16), `terrainOrder`, `tileColor`, `lipColor`, `drawTerrain` (escalones con faldones y cristales), `drawTree`, `drawMountain`, `drawU` (escala vertical para vigía, barra de vida, gema de recolección, etiqueta de grupos `1·2` y símbolo de mejora `↗`/`★`), `drawB` (apoyado en el nivel más alto de su huella, con cimiento de piedra si pisa niveles distintos), `drawBars` (muestra multiplicador `×N` de cola) y `draw()` (incluye el efecto `'arrow'`).
13. **Entrada:** diferencia controles táctiles (`tap`) de controles de escritorio con mouse (`desktopSelect`, `desktopOrder`, doble clic para seleccionar grupo). `cellOrder(cell)` resuelve los toques sobre bocas de túnel y tierra del subsuelo. Ver sección 5.
14. **Interfaz y Atajos:** `updLayerBtn()`, `setView(L)` (Tab / V / `#layerBtn`), `sig()` (incluye `viewLayer`, la capa de cada pieza seleccionada y `holeOK`), `shortcutFor()`, `deleteSelection()` (teclas `Delete`/`Backspace`), `refreshPanel()`, `refreshTop()`, `restartToMenu()`.
15. **Grupos y Minimapa:** `saveGroup(n)`, `selectGroup(n)`, `drawMini(now)` (actualiza cada 100 ms con caché de terreno en `miniTerrain`; anillo de alerta de ataque) y `miniNavigate(e)`.
16. **Barra de estado (v17):** `idleList`, `score`, `hudCycleGo`, `kingInfo`, `refreshHud` (ver 1d) y el bucle principal `frame(now)`, que ahora también llama a `refreshHud(now)`.

## 3. Estado global `G` (después de `newGame`)

```
G.t                tiempo de juego (s)
G.U  Map id→pieza  {id,team,type,x,y,px,py,layer,dig,hp,upgraded,upgradedAt,hurt,acc,state:'idle'|'slide'|'jump',cd,goal,plan,mv,mvStart,lunge,lx,ly,air,fails,building}
G.B  Map id→edificio {id,team,type,bx,by,w,h,done,prog,hp,queue:[{type,t}],exit?:{x,y},kingInside?:pieza}
G.gold[2]          oro por bando
G.groups[2][10]    array por bando de 10 Sets (índices 1..9 usados) con ids de unidades
G.activeGroups[2]  grupo activo actual (0 = ninguno, 1..9) por bando
G.occ[2][N*N]      id de la pieza que ocupa cada casilla, por capa (0 = libre)
G.bmap[N*N]        id del edificio en cada casilla
G.res[2][N*N]      reserva del caballo en el aire (casilla de aterrizaje), por capa
G.ug[N*N]          subsuelo: 0 tierra, 1 túnel, 2 roca, 3 fuera del mapa
G.digP[N*N]        progreso de excavación 0..1
G.holes[N*N]       1 = boca de túnel que une las dos capas
G.ter, G.solid, G.tv   terreno (0..5), sólidos, valor aleatorio por casilla
G.elev[N*N]        nivel de elevación visual 0..2 (solo gráfico)
G.crystals[N*N]    1 si la casilla tiene depósito de cristales, 0 si no
G.fx               efectos visuales {k:'mark'|'puff'|'spark'|'boom'|'spawn'|'arrow'|'dust',x,y,tx?,ty?,t,layer?}
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

Otras variables globales de interfaz:

- `me`: bando activo.
- `viewLayer`: capa que se está mirando (0 superficie, 1 subsuelo).
- `sel`: igual a `sels[me]`, con forma `{u:Set de ids, b:id de edificio}`.
- `mode`: `'none'`, `'place'` (eligiendo dónde construir) o `'spawn'` (eligiendo la casilla de salida `b.exit` del edificio).
- `placeType`, `spawnType`, `gameMode` (`'human'` o `'ai'`).

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
  - Tocar una casilla vacía (de tierra o de agua) mueve la selección.
- **Un dedo que se mueve:** recuadro de selección. Elige el bando con más piezas dentro del recuadro.
- **Varios dedos:** si alguno se mueve más de 14 px, activa cámara (paneo con punto medio y zoom pellizcando) y bloquea toques (`lockAll`).

### Mouse (PC / Escritorio)
- **Clic izquierdo (`desktopSelect`):** selecciona una sola unidad o edificio propio (o cambia de bando en modo humano). Clic izquierdo en el vacío o fuera del mapa deselecciona todo (`clearSel`).
- **Ctrl + Clic izquierdo en una pieza:** si hay un grupo activo (`G.activeGroups[me]`), suma esa pieza al grupo activo y selecciona todo el grupo.
- **Doble clic izquierdo en una pieza (`selectUnitGroup`):** si la pieza pertenece a uno o más grupos, selecciona el grupo de menor número al que pertenece.
- **Arrastrar con clic izquierdo:** recuadro de selección múltiple.
- **Clic derecho sin arrastrar (`desktopOrder`):** da órdenes a las unidades seleccionadas (mover a casilla —incluidos el agua y los puertos propios terminados—, atacar unidad/edificio enemigo, construir edificio incompleto o meter al rey en el castillo).
- **Arrastrar con botón derecho (> 6 px):** mueve la cámara (paneo).
- **Clic central (rueda apretada):** gira la cámara 90° (`rotate(1)`).
- **Rueda del mouse:** zoom.

### Teclado y Controles de UI
- **Atajos del panel (`panelShortcuts`):** cada botón del panel subraya automáticamente una letra disponible (`shortcutFor`). Pulsar esa letra en el teclado dispara el botón.
- **Grupos de unidades (1…9):**
  - `Ctrl + 1…9` (o `Ctrl + clic` en los botones de `#groups`): guarda las unidades seleccionadas en ese grupo (`saveGroup`).
  - `1…9` (o clic en `#groups`): selecciona las unidades vivas de ese grupo (`selectGroup`).
- **Cambiar de capa:** `Tab` o `V` (o el botón ⛏/🌱 sobre el minimapa).
- **Eliminar (`Delete` o `Backspace`):** mata las unidades propias seleccionadas o destruye el edificio propio seleccionado (`deleteSelection()`), sin devolver oro. Eliminar el propio castillo hace perder la partida.
- **Íconos de estado (`#hud`, v17):** tocar 💤 / ⚔ / 🏭 va al siguiente ocioso; Mayús+clic en 💤 o ⚔ elige a todos. Teclas **`.`** (peón ocioso) y **`,`** (ejército ocioso). ♚ va al rey, ⚠ al último ataque y 🏆 abre el detalle de puntos.
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
- **Firma de interfaz:** si agregás información que cambia lo que muestra el panel, sumala a `sig()`. Si no, el panel no se actualiza.
- **Terreno nuevo:** agregalo a `TC` (dos colores de damero), al cálculo de `G.solid` en `newGame`, a los colores del minimapa en `drawMini` y, si tiene relieve, a la lista de objetos de `draw()`.
- **Elevación:** nunca uses `iso`/`unIso` directo para cosas apoyadas en el suelo o para interpretar toques: usá `isoE` y `unIsoE`.
- **Rendimiento:** `plan` se llama cada vez que una pieza termina un movimiento. En mapas de 32×32 tarda menos de 0,3 ms; evitá hacerlo más caro. En 56×56 un cuadro completo de dibujo tarda unos 1–9 ms en una PC (medido en Chromium sin GPU). El minimapa cachea el terreno base en `miniTerrain` y se redibuja como máximo cada 100 ms (`drawMini`).

## 7. Preferencias del autor

- Entregar siempre **el HTML completo, en un solo archivo, para descargar**.
- Tiene que funcionar en **celular** (Chrome en Android) y en PC, sin scroll de página.
- Cambios acotados a lo pedido ("no cambies nada más"). Si hace falta tocar otra cosa, avisarlo.