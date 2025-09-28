
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: 'https://junior-21-21.github.io/Taller-soldadura/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/Taller-soldadura"
  },
  {
    "renderMode": 2,
    "route": "/Taller-soldadura/servicios"
  },
  {
    "renderMode": 2,
    "route": "/Taller-soldadura/equipo"
  },
  {
    "renderMode": 2,
    "route": "/Taller-soldadura/contacto"
  },
  {
    "renderMode": 2,
    "route": "/Taller-soldadura/galeria"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 2639, hash: 'ba8c60033df9a6df7575e3bf1ed4aa9e0271107f532e52323df5a9af99e446cb', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 2188, hash: 'f88ff0ff135f9873172fd8bf7a5b31451d859e68719deccc0878a09e8bc6bfb4', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'servicios/index.html': {size: 18889, hash: 'a2128a0f14555bcd9af50ed62ac74faa785e39a1bd3cb2c3c2cefd1bb6f34f0f', text: () => import('./assets-chunks/servicios_index_html.mjs').then(m => m.default)},
    'index.html': {size: 29734, hash: 'c3f362c58bba6ee0a178393b3706e75bb17a5e7fe2a0e5c78fc9c09b02764afa', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'galeria/index.html': {size: 21865, hash: 'f52d82210936e618a21783ddf16c7fb8517e8ea2412d502484ff42aa36bc8387', text: () => import('./assets-chunks/galeria_index_html.mjs').then(m => m.default)},
    'equipo/index.html': {size: 24327, hash: '74329c1835e1e1f9e0608cebf120954a35d05de3a3f9e48c27171e79f036082b', text: () => import('./assets-chunks/equipo_index_html.mjs').then(m => m.default)},
    'contacto/index.html': {size: 20314, hash: 'fb8db446aa16e1c77fa4ec88db80b303afa3687f95e17891ff6bbad43e23f446', text: () => import('./assets-chunks/contacto_index_html.mjs').then(m => m.default)},
    'styles-G3JHXV5P.css': {size: 19342, hash: 'beKNb8FvFyw', text: () => import('./assets-chunks/styles-G3JHXV5P_css.mjs').then(m => m.default)}
  },
};
