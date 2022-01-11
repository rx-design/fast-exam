<template>
  <section class="section">
    <div class="container">
      <div class="card">
        <div class="card-header">
          <div class="card-header-title">
            Sign in to Fast Exam
          </div>
        </div>
        <div class="card-content">
          <div class="field">
            <p class="control has-icons-left">
              <input
                v-model="email"
                type="email"
                placeholder="Email address"
                class="input"
              />
              <span class="icon is-small is-left">
                <Icon name="envelope" />
              </span>
            </p>
          </div>
          <div class="field">
            <p class="control has-icons-left">
              <input
                v-model="password"
                type="password"
                placeholder="Password"
                class="input"
              />
              <span class="icon is-small is-left">
               <Icon name="lock" />
              </span>
            </p>
          </div>
          <div class="field">
            <p class="control">
              <button
                :class="['button is-success is-fullwidth', {
                  'is-loading': isLoading,
                }]"
                @click="signIn"
              >
                Sign in
              </button>
            </p>
          </div>
          <p>
            <router-link to="/join">Create an account</router-link>
          </p>
          <p>
            <a>Forgot password?</a>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import Icon from '@/components/Icon.vue';
import { login } from '@/composables/auth';
import { showError } from '@/composables/message';

export default defineComponent({
  name: 'Login',
  components: {
    Icon,
  },
  setup() {
    const router = useRouter();
    const email = ref('');
    const password = ref('');
    const isLoading = ref(false);

    const signIn = async () => {
      isLoading.value = true;

      await login(email.value, password.value)
        .then(() => router.replace('game'))
        .catch(showError);

      isLoading.value = false;
    };

    return {
      email,
      password,
      isLoading,
      signIn,
    };
  },
});
</script>
