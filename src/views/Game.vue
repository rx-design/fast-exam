<template>
  <section :class="{ 'section': grid.tablet }">
    <div class="container">
      <Question
        v-if="isPlaying"
        :player="player"
        :room="room"
        @cancel="resetGame"
      />
      <div
        v-else
        class="card"
      >
        <div class="card-header">
          <div class="card-header-title">
            {{ title }}
          </div>
        </div>
        <div class="card-content">
          <div class="field">
            <p class="control">
              <button
                :class="['button is-success is-fullwidth', {
                  'is-loading': isLoading,
                }]"
                @click="start(false)"
              >
                Start [multiplayer]
              </button>
            </p>
          </div>
          <div class="field">
            <p class="control">
              <button
                :class="['button is-success is-fullwidth', {
                'is-loading': isLoading,
                }]"
                  @click="start(true)"
              >
                Start [single player]
              </button>
            </p>
          </div>
        </div>
        <footer class="card-footer">
          <div class="field card-footer-item">
            <p class="control">
              <button
                :class="['button', {
                  'is-loading': isLoading,
                }]"
                @click="signOut"
              >
                Sign out
              </button>
            </p>
          </div>
        </footer>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useGrid } from 'vue-screen';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import Question from '@/components/Question.vue';
import { logout } from '@/composables/auth';
import { showInfo } from '@/composables/message';
import { getId, toObject } from '@/composables/utils';
import { createPlayer } from '@/composables/db/players';
import { onRoom, onRooms } from '@/composables/db/rooms';
import { Player, Room } from '~/types';
import { Entity } from '@/types';

const SCORE_TO_WIN = 5;

export default defineComponent({
  name: 'Game',
  components: {
    Question,
  },
  setup() {
    const grid = useGrid('bulma');
    const router = useRouter();
    const store = useStore();

    const player = ref<Entity<Player>|null>(null);
    const room = ref<Entity<Room>|null>(null);
    const isLoading = ref(false);

    const title = computed(() => {
      return isLoading.value
        ? 'Loading... Please wait'
        : 'Press start to play the game';
    });

    const isPlaying = computed(() => !!(player.value && room.value && !isLoading.value));

    const score = computed(() => {
      if (!room.value || !player.value) {
        return 0;
      }

      return room.value.scores[getId(player.value)];
    });

    const start = (single: boolean) => {
      isLoading.value = true;

      const newPlayer: Player = {
        userId: store.state.userUid,
        single,
      };

      createPlayer(newPlayer)
        .then(docRef => {
          player.value = {
            ref: docRef,
            ...newPlayer,
          };

          findRoom(getId(player.value));
        });
    };

    const findRoom = (playerId: string) => {
      const unsubscribe = onRooms(playerId, (snapshot) => {
        if (snapshot.size > 0) {
          unsubscribe();
          subscribeToRoomUpdates(snapshot.docs[0].id);
          isLoading.value = false;
        }
      });

      store.commit('addUnsubscribe', unsubscribe);
    };

    const subscribeToRoomUpdates = (roomId: string) => {
      const unsubscribe = onRoom(roomId, (doc) => {
        room.value = toObject<Room>(doc);

        if (room.value.closed) {
          unsubscribe();
          setTimeout(finishGame, 100);
        }
      });

      store.commit('addUnsubscribe', unsubscribe);
    };

    const unsubscribeAll = () => {
      store.state.unsubscribeList.map((u: () => void) => u());
      store.commit('clearUnsubscribeList');
    };

    const finishGame = () => {
      if (score.value === SCORE_TO_WIN) {
        showInfo('YOU\'RE A WINNER!\nScore: ' + score.value);
      } else {
        showInfo('GAME OVER!\nScore: ' + score.value);
      }

      resetGame();
    };

    const clear = () => {
      player.value = null;
      room.value = null;
    };

    const resetGame = () => {
      unsubscribeAll();
      clear();
    };

    const signOut = () => {
      isLoading.value = true;

      unsubscribeAll();
      logout()
        .then(() => router.replace('login'));
    };

    return {
      grid,
      title,
      player,
      room,
      isLoading,
      isPlaying,
      start,
      resetGame,
      signOut,
    };
  },
});
</script>
