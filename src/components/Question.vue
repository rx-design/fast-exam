<template>
  <div class="card">
    <div class="card-header">
      <div class="card-header-title">
        [ {{ quizName }} ] {{ title }}
      </div>
    </div>
    <div
      v-if="question && question.imageUrl"
      class="card-image"
    >
      <figure class="image is-3by1">
        <BlobImage :question="question" />
      </figure>
    </div>
    <div
      v-if="question"
      class="card-content"
    >
      <div class="content">
        <h6>
          {{ question.text }}
        </h6>
        <div
          v-if="!hideOptions"
          class="buttons"
        >
          <button
            v-for="(option, index) in question.options"
            style="height: initial; justify-content: flex-start; white-space: normal; text-align: left"
            :class="['button is-fullwidth mb-2', classObjects[index]]"
            :disabled="selectedOption !== -1 || revealed.includes(index)"
            @click="answer(parseInt(index))"
          >
            {{ option }}
          </button>
        </div>
      </div>
      <div class="columns is-mobile">
        <div
          v-for="powerUp in powerUps"
          class="column pb-0"
        >
          <div class="field">
            <p
              class="control"
              :data-tooltip="powerUp.description"
            >
              <button
                class="button is-fullwidth is-success is-outlined is-family-monospace"
                :disabled="!powerUp.enabled || powerUp.isUsed"
                @click="usePowerUp(powerUp)"
              >
                <span class="icon is-small">
                  <Icon :name="`${powerUp.icon}`" />
                </span>
                <span v-if="grid.tablet">
                  {{ powerUp.name }}
                </span>
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
    <footer class="card-footer">
      <div class="field card-footer-item">
        <p class="control">
          <button
            class="button"
            @click="cancel"
          >
            Cancel
          </button>
        </p>
      </div>
    </footer>
  </div>
</template>

<script lang='ts'>
import { computed, defineComponent, nextTick, onBeforeMount, PropType, ref, toRefs } from 'vue';
import { useGrid } from 'vue-screen';
import { useStore } from 'vuex';
import BlobImage from '@/components/BlobImage.vue';
import Icon from '@/components/Icon.vue';
import { createAnswer } from '@/composables/db/answers';
import { getQuizName } from '@/composables/db/quizzes';
import { onPlayerQuestions } from '@/composables/db/playerQuestions';
import { showWarning } from '@/composables/message';
import { getId, toObject } from '@/composables/utils';
import { Player, PlayerQuestion, PowerUp, Room } from '~/types';
import { Entity, VueClass } from '@/types';

export default defineComponent({
  name: 'Question',
  components: {
    BlobImage,
    Icon,
  },
  props: {
    player: {
      type: Object as PropType<Entity<Player>>,
      required: true,
    },
    room: {
      type: Object as PropType<Entity<Room>>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const grid = useGrid('bulma');
    const store = useStore();
    const { player, room } = toRefs(props);
    const hideOptions = ref(true);
    const quizName = ref('');
    const question = ref<Entity<PlayerQuestion>|null>(null);
    const revealed = ref<number[]>([]);
    const selectedOption = ref(-1);
    const powerUps = ref<PowerUp[]>([
      {
        name: 'Fail',
        icon: 'heart-broken',
        description: 'Get a second shot of guessing the answer',
        enabled: false,
        isUsed: false,
      },
      {
        name: 'Bomb',
        icon: 'bomb',
        description: 'Discard 2 wrong answers',
        enabled: true,
        isUsed: false,
      },
      {
        name: 'Time',
        icon: 'stopwatch',
        description: 'Get 15 additional seconds to answer',
        enabled: false,
        isUsed: false,
      },
      {
        name: 'Skip',
        icon: 'forward',
        description: 'Get a different question from the same category',
        enabled: false,
        isUsed: false,
      },
    ]);

    const title = computed(() => {
      return question.value
        ? 'Score: ' + score.value
        : player.value.single
          ? 'Creating a game... Please wait'
          : 'Searching for opponents... Please wait';
    });

    const score = computed(() => {
      return room.value.scores[getId(player.value)];
    });

    const classObjects = computed(() => {
      if (!question.value) {
        return [];
      }

      const { options, correctOption } = question.value;

      return options.reduce((classes, option, index) => {
        const isRevealed = revealed.value.includes(index) || selectedOption.value !== -1;
        const isSelected = selectedOption.value === index;
        const isCorrect = correctOption === index;

        classes.push({
          'is-link': !isRevealed,
          'is-success': isRevealed && isCorrect,
          'is-danger': isRevealed && !isCorrect,
          'is-outlined': !isSelected,
        });

        return classes;
      }, [] as VueClass[]);
    });

    const usePowerUp = (powerUp: PowerUp) => {
      powerUp.isUsed = true;

      if (powerUp.name === 'Bomb') {
        const  { options, correctOption } = getQuestion();

        if (options.length < 3) {
          showWarning('This power-up cannot be used with less than 3 options.');
          return;
        }

        let discardedCount = 0;

        while (discardedCount < 2) {
          const random = options.length * Math.random() | 0;

          if (random !== correctOption && !revealed.value.includes(random)) {
            revealed.value.push(random);
            discardedCount++;
          }
        }
      }
    };

    const answer = (option: number) => {
      if (selectedOption.value !== -1) {
        return;
      }

      selectedOption.value = option;

      createAnswer({
        questionId: getId(getQuestion()),
        selectedOption: option,
      });
    };

    const cancel = () => emit('cancel');

    const getQuestion = () => question.value as Entity<PlayerQuestion>;

    onBeforeMount(() => {
      getQuizName(getId(room.value))
        .then(name => (quizName.value = name));

      const unsubscribe = onPlayerQuestions(getId(player.value), getId(room.value), (snapshot) => {
        if (snapshot.size > 0) {
          const obj = toObject<PlayerQuestion>(snapshot.docs[0]);

          if (!question.value || getId(question.value) !== getId(obj)) {
            question.value = obj;
            revealed.value = [];
            powerUps.value.forEach(powerUp => powerUp.isUsed = false);
            selectedOption.value = -1;

            hideOptions.value = true;
            nextTick(() => (hideOptions.value = false));
          }
        }
      });

      store.commit('addUnsubscribe', unsubscribe);
    });

    return {
      grid,
      title,
      quizName,
      question,
      revealed,
      powerUps,
      selectedOption,
      classObjects,
      hideOptions,
      usePowerUp,
      answer,
      cancel,
    };
  },
});
</script>
