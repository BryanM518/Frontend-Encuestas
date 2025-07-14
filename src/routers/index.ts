import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

// Importa tus componentes
import LoginForm from '../components/auth/Login_Form.vue'
import RegisterForm from '../components/auth/Register_Form.vue'
import SurveyEditor from '../components/Surveys/SurveyEditor.vue'
import SurveyList from '../components/Surveys/SurveyList.vue'
import SurveyDashboards from '../components/views/SurveyDashboards.vue'
import HomePage from '../components/home_page.vue'
import UserProfile from '../components/views/UserProfile.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginForm
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterForm
  },
  {
    path: '/surveyeditor',
    name: 'SurveyEditor',
    component: SurveyEditor,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/mysurveys',
    name: 'MySurveys',
    component: SurveyList,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/surveydashboard',
    name: 'SurveyDashboard',
    component: SurveyDashboards,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/userprofile',
    name: 'UserProfile',
    component: UserProfile,
    meta: {
      requiresAuth: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Middleware: proteger rutas
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('user') !== null

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
