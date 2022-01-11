<template>
  <section class="section">
    <div class="container">
      <div class="card">
        <div class="card-header">
          <div class="card-header-title">
            Upload quizzes
          </div>
        </div>
        <div class="card-content">
          <div class="field is-grouped">
            <div class="file has-name control is-expanded">
              <label class="file-label">
                <input
                  class="file-input"
                  type="file"
                  @change="onChange"
                >
                <span class="file-cta">
                  <span :class="['file-icon mr-0', { 'mr-2': grid.tablet }]">
                    <Icon name="folder-open" />
                  </span>
                  <span
                    v-if="grid.tablet"
                    class="file-label"
                  >
                    Choose a file…
                  </span>
                </span>
                <span class="file-name">
                  {{ file ? file.name : 'No file chosen' }}
                </span>
              </label>
            </div>
            <p class="control">
              <button
                class="button is-info"
                :disabled="!file"
                @click="upload"
              >
                <span class="icon is-small">
                  <Icon name="cloud-upload-alt" />
                </span>
                <span v-if="grid.tablet">
                  Upload
                </span>
              </button>
            </p>
          </div>
        </div>
        <div class="card-footer">
          <QuizList
            ref="quizListRef"
            class="card-footer-item"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useGrid } from 'vue-screen';
import Icon from '@/components/Icon.vue';
import QuizList from '@/components/QuizList.vue';
import { createQuizzes } from '@/composables/db/quizzes';
import { read } from '@/composables/xlsx';
import { showSuccess } from '@/composables/message';

export default defineComponent({
  name: 'Upload',
  components: {
    Icon,
    QuizList,
  },
  setup() {
    const grid = useGrid('bulma');
    const file = ref<File|null>(null);
    const quizListRef = ref<InstanceType<typeof QuizList>>();

    const onChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const files = target.files;

      if (!files || files.length == 0) {
        file.value = null;
      } else {
        file.value = files[0];
      }
    };

    const refreshQuizList = () => {
      if (quizListRef.value) {
        quizListRef.value.refresh();
      }
    };

    const upload = () => {
      read(file.value as File)
        .then(createQuizzes)
        .then(() => {
          refreshQuizList();
          showSuccess('Questions have been successfully updated!');
        });
    };

    return {
      grid,
      file,
      quizListRef,
      onChange,
      upload,
    };
  },
});
</script>
