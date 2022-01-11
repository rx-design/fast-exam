<template>
  <font-awesome-icon :icon="['fas', name]" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Icon',
  props: {
    name: {
      type: String,
    },
  },
});
</script>
