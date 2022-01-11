<template>
  <img
    v-if="blobUrl"
    :src="blobUrl"
    :alt="question.imageUrl"
    @load="loaded"
  />
</template>

<script lang="ts">
import { defineComponent, PropType, ref, toRefs, watch } from 'vue';
import { PlayerQuestion } from '~/types';

export default defineComponent({
  name: 'BlobImage',
  props: {
    question: {
      type: Object as PropType<PlayerQuestion>,
    },
  },
  setup(props) {
    const blobUrl = ref('');
    const { question } = toRefs(props);

    const load = async (src: string) => {
      return await fetch(src)
        .then(response => response.blob());
    };

    const loaded = () => {
      if (blobUrl.value) {
        URL.revokeObjectURL(blobUrl.value);
      }
    };

    watch(question, (newQuestion) => {
      if (newQuestion) {
        blobUrl.value = '';

        load(newQuestion.imageUrl)
          .then(blob => {
            blobUrl.value = URL.createObjectURL(blob);
          });
      }
    }, { immediate: true });

    return {
      blobUrl,
      loaded,
    };
  },
});
</script>
