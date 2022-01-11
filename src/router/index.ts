import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import { getAuth } from 'firebase/auth';
import Login from '@/views/Login.vue';
import SignUp from '@/views/SignUp.vue';
import Game from '@/views/Game.vue';
import Statistics from '@/views/Statistics.vue';
import Upload from '@/views/Upload.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/:pathMatch(.*)*',
    redirect: 'login',
  },
  {
    path: '/',
    redirect: 'login',
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
  },
  {
    path: '/join',
    name: 'join',
    component: SignUp,
  },
  {
    path: '/game',
    name: 'game',
    component: Game,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/records',
    name: 'records',
    component: Statistics,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/upload',
    name: 'upload',
    component: Upload,
    meta: {
      requiresAuth: true,
    },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !currentUser) {
    next('login');
  } else if (!requiresAuth && currentUser) {
    next('game');
  } else {
    next();
  }
});

export default router;
