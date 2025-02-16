import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Competition from '../views/DataPages/CompetitionPage.vue'
import Result from '../views/DataPages/ResultPage.vue'
import Contact from '../views/DataPages/ContactPage.vue'
import CompetitionDetails from '../views/DataPages/CompetitionDetailsPage.vue'
import Login from '../views/DataPages/LoginPage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView 
  },
  {
    path: '/versenyek',
    name: 'competition',
    component: Competition
  },
  {
    path: '/eredmenyek',
    name: 'result',
    component: Result
  },
  {
    path: '/kapcsolat',
    name: 'contact',
    component: Contact
  },
  {
    path: "/versenyek/:nev",
    name: "CompetitionDetails",
    component: CompetitionDetails,
    props: route => ({
      nev: route.params.nev,
      helyszin: route.query.helyszin,
      datum: route.query.datum,
      leiras: route.query.leiras,
      max_letszam: route.query.max_letszam,
    }),
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
