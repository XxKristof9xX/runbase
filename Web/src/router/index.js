import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Competition from '../views/DataPages/CompetitionPage.vue'
import Result from '../views/DataPages/ResultPage.vue'
import Contact from '../views/DataPages/ContactPage.vue'
import CompetitionDetails from '../views/DataPages/CompetitionDetailsPage.vue'
import Login from '../views/DataPages/LoginPage.vue'
import Profile from '../views/DataPages/ProfilePage.vue'
import Register from '../views/DataPages/RegisterPage.vue'
import AdministrativPage from '@/views/DataPages/AdministrativPage.vue'
import CompetitionModify from '@/views/DataPages/CompetitionModifyPage.vue'

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
  },
  {
    path: '/profil',
    name: 'profil',
    component: Profile
  },
  {
    path: '/registration',
    name: 'registration',
    component: Register
  },
  {
    path: '/adminPage',
    name: 'adminPage',
    component: AdministrativPage
  },
  {
    path: '/competitionModify',
    name: 'competitionModify',
    component: CompetitionModify
  }



]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
