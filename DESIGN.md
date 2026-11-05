# DESIGN.md · Run Run Estructuras Metálicas

Guía de diseño de la web del taller. Cualquier persona o agente que cambie la página la lee primero, para que todo se vea como un mismo sistema.

## Marca

- Taller de soldadura en Ayacucho, Perú. Solo soldadura por arco con **electrodo** (no MIG, TIG, láser ni CNC).
- Fabrica e instala puertas modernas, ventanas y rejas, techos de aluzinc y estructuras, portones, barandas, mesas y muebles.
- Logo: el original de Run Run (fuego y soldador) sobre placa oscura redondeada: `assets/img/logo-placa.webp` y `logo-placa-sm.webp`.
- Teléfonos, en este orden: **930 929 558** (principal, llamadas y WhatsApp de cotizaciones), 994 988 519 y 900 048 717.
- Ubicación: -13.174752, -74.2166704 (Ayacucho).

## Colores (`src/styles.css`, `:root`)

| Token | Valor | Uso |
| --- | --- | --- |
| `--bg` | `#ffffff` | Fondo general de la página (blanco) |
| `--surface` | `#f7f4f0` | Tarjetas y bloques suaves |
| `--line` | `#ebe4dc` | Bordes y separadores |
| `--text` | `#1d1713` | Texto principal |
| `--muted` | `#6d635a` | Texto secundario |
| `--fire` | `#ff6a00` | Acento: botones principales, detalles |
| `--fire-2` | `#e0590b` | Acento en texto (contraste sobre blanco) |

Un solo acento naranja. Nada de morados ni neones. Las cabeceras de Inicio, Servicios y Galería usan una foto oscura de fondo (capa oscura rgba(18, 11, 6, …) de .35 a .92 según la página, para que el texto blanco se lea; antetítulo #ffb347); el resto de la página es blanco.

## Tipografía

- Títulos: **Oswald** 500 a 700, en mayúsculas.
- Texto: **Inter** 400 a 600.
- Íconos: Bootstrap Icons 1.13.1 incrustados como SVG con el componente `app-icon` (`src/app/shared/icon/icon.component.ts`). Para agregar uno, se suma su SVG al mapa ICONOS. Material Symbols queda solo donde aún se usa.
- Todas las fuentes se sirven desde `src/assets/fonts` (sin Google Fonts) con `font-display: swap`.

## Componentes

- Botones: `.btn--fire` (principal, naranja) y `.btn--ghost` (borde). Al presionar se encogen a `scale(.97)`. El efecto hover solo aparece con mouse.
- Tarjetas: fondo blanco, borde `--line`, radio de 14 a 18 px y sombra `--shadow`.
- Zonas táctiles de al menos 44 px de alto.
- El foco con teclado siempre se ve: contorno naranja de 3 px (`:focus-visible`).

## Fotos y contenido

- Se usan **fotos reales** de trabajos del taller (`assets/img/puertas/pmNN.webp`, del catálogo PDF). No se usan fotos de stock ni imágenes de relleno.
- Los fondos de cabecera (`hero-taller.webp`, `fondo-servicios.webp`, `fondo-chispas.webp`) son provisionales: se cambian por fotos reales del taller cuando Milu las envíe.
- Nada de datos inventados: ni personas, ni opiniones de clientes, ni direcciones, ni cifras. Si falta un dato real, la sección no se muestra.
- Los precios son en soles, sin IGV, y vienen del catálogo PDF (`pages/puertas/puertas.data.ts`).
- Se escribe en español claro, de tú al cliente, con frases cortas.

## Movimiento

- Animaciones cortas con curva `ease-out`, que solo mueven `transform` y `opacity`.
- La intro del logo dura unos 1.4 s. Las escenas de armado se repiten en bucle mientras están en pantalla.
- Se respeta `prefers-reduced-motion`.
- No hay dibujos al hacer clic, cursores personalizados ni estilo "hacker" (HUD, coordenadas, letra monoespaciada).

## Velocidad

- La página es ligera: imágenes WebP, fotos con `loading="lazy"` y `width`/`height` fijos.
- Las rutas secundarias se cargan solo al abrirlas (lazy).
- El 3D (three.js) se descarga después de que la página carga.
- El mapa de Google se carga solo si el visitante lo pide.

## Antes de publicar

1. Ejecutar `npx ng build` y confirmar que no hay errores.
2. Revisar en el navegador a 1440, 1024, 768 y 390 px de ancho: que no haya scroll horizontal, imágenes rotas ni textos cortados.
3. Ejecutar `npm run deploy` para publicar en GitHub Pages.
