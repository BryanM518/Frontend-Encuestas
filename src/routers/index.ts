import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

// import LoginForm from '../components/auth/LoginForm.vue'
// import RegisterForm from '../components/auth/RegisterForm.vue'
// import SurveyEditor from '../components/Surveys/SurveyEditor.vue'
// import SurveyList from '../components/Surveys/SurveyList.vue'
// import SurveyDashboards from '../components/views/SurveyDashboards.vue'
// import SurveyResponse from '../components/Surveys/SurveyResponse.vue'
// import SurveyResponseList from '../components/Surveys/SurveyResponseList.vue'
// import HomePage from '../components/home_page.vue'
// import UserProfile from '../components/views/UserProfile.vue'
// import PublicSurveyList from '../components/Surveys/PublicSurveyList.vue'
// import SurveyStats from '../components/Surveys/SurveyStats.vue'
// import SurveyAcess from '../components/views/SurveyAccess.vue'

// Views (páginas) de alto nivel
import HomePage from '../pages/home_page.vue'
import SurveyAccess from '../pages/SurveyAccess.vue'
import SurveyDashboards from '../pages/SurveyDashboards.vue'

// Features: Auth
import LoginForm from '../features/auth/LoginForm.vue'
import RegisterForm from '../features/auth/RegisterForm.vue'

// Features: Surveys
import SurveyList from '../features/surveys/SurveyList.vue'
import SurveyEditor from '../features/surveys/SurveyEditor.vue'
import SurveyResponse from '../features/surveys/SurveyResponse.vue'
import SurveyResponseList from '../features/surveys/SurveyResponseList.vue'
import PublicSurveyList from '../features/surveys/PublicSurveyList.vue'
import SurveyStats from '../features/surveys/SurveyStats.vue'

// Features: User
import UserProfile from '../features/user/UserProfile.vue'
import ResponderPublicSurvey from '../pages/ResponderPublicSurvey.vue'

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
  path: '/surveys/:id/edit',
  name: 'EditSurvey',
  component: SurveyEditor,
  props: true, 
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
  component: SurveyAccess
}, {
  path: '/response/:id',
  name: 'ResponderEncuesta',
  component: ResponderPublicSurvey
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
