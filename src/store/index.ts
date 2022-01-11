import { createStore } from 'vuex';
import { Unsubscribe } from 'firebase/firestore';

export default createStore({
  state: {
    userUid: '',
    unsubscribeList: [] as Unsubscribe[],
  },
  mutations: {
    setUserUid(state, uid: string) {
      state.userUid = uid;
    },
    addUnsubscribe(state, unsubscribe: Unsubscribe) {
      state.unsubscribeList.push(unsubscribe);
    },
    clearUnsubscribeList(state) {
      state.unsubscribeList = [];
    },
  },
});
