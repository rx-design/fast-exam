<template>
  <div
    v-if="quizzes.length > 0"
    class="content"
  >
    <table class="table">
      <thead>
      <tr>
        <th>Quiz</th>
        <th class="has-text-centered">Active</th>
        <th class="has-text-centered">Delete</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="quiz in quizzes">
        <th>{{ quiz.name }}</th>
        <td class="has-text-centered">
          <span
            v-if="quiz.isActive"
            class="icon"
          >
            <Icon name="check-square" />
          </span>
          <span
            v-else
            class="icon"
            @click="setActive(quiz)"
          >
            <Icon name="square" />
          </span>
        </td>
        <td class="has-text-centered">
          <span
            class="icon"
            @click="remove(quiz)"
          >
            <Icon name="trash" />
          </span>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import Icon from '@/components/Icon.vue';
import { getQuizzes, removeQuiz, setActiveQuiz } from '@/composables/db/quizzes';
import { Entity } from '@/types';
import { Quiz } from '~/types';

export default defineComponent({
  name: 'QuizList',
  components: {
    Icon,
  },
  setup() {
    const quizzes = ref<Entity<Quiz>[]>([]);

    const refresh = () => getQuizzes()
      .then(newQuizzes => (quizzes.value = newQuizzes));

    const setActive = (quiz: Entity<Quiz>) => {
      setActiveQuiz(quiz)
        .then(refresh);
    };

    const remove = (quiz: Entity<Quiz>) => {
      removeQuiz(quiz)
        .then(refresh);
    };

    onMounted(refresh);

    return {
      quizzes,
      refresh,
      setActive,
      remove,
    };
  },
});
</script>
