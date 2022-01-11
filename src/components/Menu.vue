<template>
  <div class="tabs">
    <ul>
      <li
        v-for="link in links"
        :class="{ 'is-active': tabName === link.tabName }"
      >
        <router-link :to="link.to">
          {{ link.label }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useRoute } from 'vue-router';
import { MenuLink } from '@/types';

export default defineComponent({
  name: 'Menu',
  setup() {
    const route = useRoute();
    const links = ref<MenuLink[]>([
      {
        tabName: 'game',
        to: '/game',
        label: 'Game',
      },
      {
        tabName: 'upload',
        to: '/upload',
        label: 'Quizzes',
      },
      {
        tabName: 'records',
        to: '/records',
        label: 'Records',
      },
    ]);

    const tabName = computed(() => {
      if (typeof route.name !== 'string') {
        return 'game';
      }

      if (['login', 'join'].includes(route.name)) {
        return 'game';
      }

      return route.name;
    });

    return {
      links,
      tabName,
    };
  },
});
</script>
