import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

// Pages (páginas de alto nivel)
import HomePage from '../pages/home_page.vue';
import SurveyAccess from '../pages/SurveyAccess.vue';
import SurveyDashboards from '../pages/SurveyDashboards.vue';
import TemplateSelector from '../pages/TemplateSelector.vue';

// Features: Auth
import LoginForm from '../features/auth/LoginForm.vue';
import RegisterForm from '../features/auth/RegisterForm.vue';

// Features: Surveys
import SurveyList from '../features/surveys/SurveyList.vue';
import SurveyEditor from '../features/surveys/SurveyEditor.vue';
import SurveyResponse from '../features/surveys/SurveyResponse.vue';
import SurveyResponseList from '../features/surveys/SurveyResponseList.vue';
import PublicSurveyList from '../features/surveys/PublicSurveyList.vue';
import SurveyStats from '../features/surveys/SurveyStats.vue';
import SurveyChoice from '../features/surveys/SurveyChoice.vue';

// Features: User
import UserProfile from '../features/user/UserProfile.vue';
import ResponderPublicSurvey from '../pages/ResponderPublicSurvey.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/surveys/new',
    name: 'SurveyChoice', // Cambiado de 'NewSurvey' a 'SurveyChoice'
    component: SurveyChoice, // Apunta al nuevo componente
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/surveys/templates',
    name: 'TemplateSelector',
    component: TemplateSelector,
    meta: {
      requiresAuth: true
    }
  },
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
    path: '/surveys/new/scratch',
    name: 'NewSurveyFromScratch',
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
    }
  },
  {
    path: '/survey-access/:token_id',
    name: 'SurveyAccess',
    component: SurveyAccess
  },
  {
    path: '/response/:id',
    name: 'ResponderPublicSurvey',
    component: ResponderPublicSurvey
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Middleware: proteger rutas
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token'); // Unificado con 'token'

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;