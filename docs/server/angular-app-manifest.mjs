
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/Taller-soldadura/',
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
    'index.csr.html': {size: 2609, hash: 'b6de5e208f2236ae434e9a2281e4d3e4f3b975d0abe5ac766de84516667018bb', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 2158, hash: '0d6296cc93105fb336632c4d632991d9ef7eaf6b18dffaa5e739792dd7b3c348', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'servicios/index.html': {size: 18679, hash: '9fa0828c950813f9faa5612d1ca3c5c24c79b164e7c80ed58bf9a018ac9dd8d8', text: () => import('./assets-chunks/servicios_index_html.mjs').then(m => m.default)},
    'galeria/index.html': {size: 16260, hash: '28331cc956168f86c349f4a30d8b442112fba39346a7dcbd8f722bf7e2497890', text: () => import('./assets-chunks/galeria_index_html.mjs').then(m => m.default)},
    'index.html': {size: 29434, hash: '7271d82136f9619736212c866d6256fce008cf8059108cb173618f935cb5fc35', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'equipo/index.html': {size: 24117, hash: 'e1f8c15e203377e989937e11a0fa9630d64f9e9f48b83761fa446491ba904126', text: () => import('./assets-chunks/equipo_index_html.mjs').then(m => m.default)},
    'contacto/index.html': {size: 20134, hash: 'ab2a4c2af1f9a5f1fbf58349e03e018d793d7b0acef523060aab7d793f08a23d', text: () => import('./assets-chunks/contacto_index_html.mjs').then(m => m.default)},
    'styles-G3JHXV5P.css': {size: 19342, hash: 'beKNb8FvFyw', text: () => import('./assets-chunks/styles-G3JHXV5P_css.mjs').then(m => m.default)}
  },
};
