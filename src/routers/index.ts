import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

// Importa tus componentes
import LoginForm from '../components/auth/LoginForm.vue'
import RegisterForm from '../components/auth/RegisterForm.vue'
import SurveyEditor from '../components/Surveys/SurveyEditor.vue'
import SurveyList from '../components/Surveys/SurveyList.vue'
import SurveyDashboards from '../components/views/SurveyDashboards.vue'
import SurveyResponse from '../components/Surveys/SurveyResponse.vue'
import SurveyResponseList from '../components/Surveys/SurveyResponseList.vue'
import HomePage from '../components/home_page.vue'
import UserProfile from '../components/views/UserProfile.vue'
import PublicSurveyList from '../components/Surveys/PublicSurveyList.vue'
import SurveyStats from '../components/Surveys/SurveyStats.vue'
import SurveyAcess from '../components/views/SurveyAccess.vue'

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
  },
  {
  path: '/responder/:id',
  name: 'ResponderEncuesta',
  component: SurveyResponse
  },
  {
    path: '/public-surveys',
    name: 'PublicSurveyList',
    component: PublicSurveyList
  },
  {
  path: '/surveys/:id/responses',
  name: 'SurveyResponses',
  component: SurveyResponseList,
  meta: { requiresAuth: true }
},
{
  path: '/surveys/:id/stats',
  name: 'SurveyStats',
  component: SurveyStats,
  meta: {
    requiresAuth: true
  },
},
{
  path: '/survey-access/:token_id',
  name: 'SurveyAccess',
  component: () => import('../components/views/SurveyAccess.vue')
}, {
  path: '/response/:id',
  name: 'ResponderEncuesta',
  component: () => import('../components/views/ResponderPublicSurvey.vue')
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
