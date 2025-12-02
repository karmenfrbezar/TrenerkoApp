const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'login', component: () => import('pages/LoginPage.vue') },
      { path: 'registracija', component: () => import('pages/RegistracijaPage.vue') },
      { path: 'mapa', component: () => import('pages/MapaPage.vue') },
      { path: 'unos-objekata', component: () => import('pages/UnosObjekataPage.vue') },
      { path: 'pretraga', component: () => import('pages/PretragaObjekataPage.vue') },
      { path: 'rezervacije', component: () => import('pages/RezervacijePage.vue') },
      { path: 'recenzije', component: () => import('pages/RecenzijePage.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
