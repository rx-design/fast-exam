<template>
  <section class="section has-text-centered">
    <div class="field has-addons">
      <p class="control">
        <a class="button is-small">
          Quiz:
        </a>
      </p>
      <div class="control">
        <div class="select is-small">
          <select v-model="selectedQuizId">
            <option value=""></option>
            <option
              v-for="quiz in quizzes"
              :value="quiz.ref.id"
            >
              {{ quiz.name }}
            </option>
          </select>
        </div>
      </div>
    </div>
    <table
      ref="tableRef"
      v-if="userResults.length > 0"
      class="table is-hoverable is-fullwidth is-size-7"
    >
      <thead>
        <tr>
          <th class="has-text-centered">
            <span v-if="grid.desktop">User</span>
            <span v-else>#</span>
          </th>
          <th class="has-text-centered">
            <span v-if="grid.desktop">Played</span>
            <span v-else>Pld</span>
          </th>
          <th class="has-text-centered">
            <span v-if="grid.desktop">Won</span>
            <span v-else>W</span>
          </th>
          <th class="has-text-centered">
            <span v-if="grid.desktop">Lost</span>
            <span v-else>L</span>
          </th>
          <th class="has-text-centered">
            <span v-if="grid.desktop">True</span>
            <span v-else>T</span>
          </th>
          <th class="has-text-centered">
            <span v-if="grid.desktop">False</span>
            <span v-else>F</span>
          </th>
          <th class="has-text-centered">
            <span v-if="grid.desktop">Percentage</span>
            <span v-else>Pct</span>
          </th>
          <th class="has-text-centered">
            <span v-if="grid.desktop">Points</span>
            <span v-else>Pts</span>
          </th>
          <th class="has-text-centered">
            <span v-if="grid.desktop">Grade Point</span>
            <span v-else>GP</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in userResults">
          <th class="has-text-centered">
            {{ row.user }}
          </th>
          <th class="has-text-centered">{{ row.numberOfGames }}</th>
          <th class="has-text-centered">{{ row.won }}</th>
          <th class="has-text-centered">{{ row.lost }}</th>
          <th class="has-text-centered">{{ row.rightAnswers }}</th>
          <th class="has-text-centered">{{ row.wrongAnswers }}</th>
          <th class="has-text-centered">
            {{ Math.round(getPercentage(row) * 100) + "%" }}
          </th>
          <th class="has-text-centered">{{ getPoints(row) }}</th>
          <th class="has-text-centered">
            <span :class="['tag', { 'is-danger': getGrade(row) === 'F' }]">
              {{ getGrade(row) }}
            </span>
          </th>
        </tr>
      </tbody>
    </table>
    <button
      v-if="userResults.length > 0"
      class="button"
      @click="download"
    >
      Download
    </button>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeMount, ref } from 'vue';
import { useGrid } from 'vue-screen';
import { write } from '@/composables/xlsx';
import { getRecords } from '@/composables/db/records';
import { getQuizzes } from '@/composables/db/quizzes';
import { Quiz, Result } from '~/types';
import { Entity, StatisticsRecord } from '@/types';

const SCORE_TO_WIN = 5;

export default defineComponent({
  name: 'Statistics',
  setup() {
    const grid = useGrid('bulma');

    const tableRef = ref<HTMLTableElement>();
    const results = ref<Entity<Result>[]>([]);
    const quizzes = ref<Entity<Quiz>[]>([]);
    const selectedQuizId = ref<string>('');

    const filteredResults = computed(() => {
      if (!selectedQuizId.value) {
        return results.value;
      }

      return results.value.filter(r => r.quizId === selectedQuizId.value);
    });

    const userResults = computed(() => {
      const userResults = filteredResults.value.reduce((users, result) => {

        const userResult = users[result.userId] ?? {
          user: result.userDisplayName,
          numberOfGames: 0,
          won: 0,
          lost: 0,
          rightAnswers: 0,
          wrongAnswers: 0,
        } as StatisticsRecord;

        userResult.numberOfGames += 1;
        userResult[result.won ? 'won' : 'lost'] += 1;
        userResult.rightAnswers += result.rightAnswers;
        userResult.wrongAnswers += result.wrongAnswers;

        users[result.userId] = userResult;

        return users;
      }, {} as Record<string, StatisticsRecord>);

      return Object.values(userResults);
    });

    const refresh = () => {
      getRecords().then(items => (results.value = items));
      getQuizzes().then(items => (quizzes.value = items));
    };

    const getPercentage = (row: StatisticsRecord) => {
      return row.rightAnswers / (row.rightAnswers + row.wrongAnswers);
    };

    const getPoints = (row: StatisticsRecord) => {
      return row.rightAnswers + row.won * SCORE_TO_WIN;
    };

    const getGrade = (row: StatisticsRecord) => {
      const value = getPoints(row) * getPercentage(row);

      if (value < 51) {
        return 'F';
      } else if (value < 61) {
        return 'E';
      } else if (value < 71) {
        return 'D';
      } else if (value < 81) {
        return 'C';
      } else if (value < 91) {
        return 'B';
      } else {
        return 'A';
      }
    };

    const download = () => {
      if (tableRef.value) {
        write(tableRef.value);
      }
    };

    onBeforeMount(refresh);

    return {
      grid,
      quizzes,
      selectedQuizId,
      userResults,
      tableRef,
      download,
      getGrade,
      getPoints,
      getPercentage,
    };
  },
});
</script>
