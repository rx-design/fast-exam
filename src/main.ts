import '@/assets/sass/main.scss';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { createApp } from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';
import FontAwesomeIcon from '@/plugins/font-awesome';

const firebaseConfig = {
  apiKey: 'AIzaSyCruyw1lbtN56ugjKC4ZM9AWu7IIrdG_U0',
  authDomain: 'fast-exam.firebaseapp.com',
  databaseURL: 'https://fast-exam.firebaseio.com',
  projectId: 'fast-exam',
  storageBucket: '',
  messagingSenderId: '543997932654',
  appId: '1:543997932654:web:223471a267425cb211227f',
};

initializeApp(firebaseConfig);

const auth = getAuth();

onAuthStateChanged(auth, (user) => {
  store.commit('setUserUid', user ? user.uid : '');
});

createApp(App)
  .component('font-awesome-icon', FontAwesomeIcon)
  .use(store)
  .use(router)
  .mount('#app');
