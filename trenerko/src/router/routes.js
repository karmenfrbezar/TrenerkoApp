const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'login', component: () => import('pages/LoginPage.vue') },
      { path: 'registracija', component: () => import('pages/RegistracijaPage.vue') },
      { path: 'mapa', component: () => import('pages/MapaPage.vue') },
      { path: 'unosobjekata', component: () => import('pages/UnosObjekataPage.vue') },
      { path: 'pretraga', component: () => import('pages/PretragaObjekataPage.vue') },
      { path: 'recenzije', component: () => import('pages/RecenzijePage.vue') },
      { path: 'statistika/:id', component: () => import('pages/StatistikaObjekta.vue') },
      { path: 'favoriti', component: () => import('pages/FavoritiPage.vue') },
      { path: 'dashboard', component: () => import('pages/VlasnikDashboard.vue') },
      { path: 'profil', component: () => import('pages/EditPage.vue') },
      { path: 'admin', component: () => import('pages/AdminPanel.vue') },
      { path: 'interesi', component: () => import('pages/InteresiPage.vue') },
      { path: 'dogadjaji', component: () => import('pages/DogadajiPage.vue') },
      { path: 'objekti/:id', component: () => import('pages/ObjektDetaljiPage.vue') },
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes