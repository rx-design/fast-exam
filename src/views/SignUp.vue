<template>
  <section class="section">
    <div class="container">
      <div class="card">
        <div class="card-header">
          <div class="card-header-title">
            Create your account
          </div>
        </div>
        <div class="card-content">
          <div class="field">
            <p class="control has-icons-left">
              <input
                v-model="name"
                type="text"
                placeholder="Name"
                class="input"
              />
              <span class="icon is-small is-left">
                <Icon name="user" />
              </span>
            </p>
          </div>
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
          <div class="field is-grouped">
            <p class="control is-expanded has-icons-left">
              <input
                v-model="password"
                :type="maskPassword ? 'password' : 'text'"
                placeholder="Password"
                class="input"
              />
              <span class="icon is-small is-left">
                <Icon name="lock" />
              </span>
            </p>
            <p class="control">
              <button
                class="button"
                @click="togglePasswordMask"
              >
                <span class="icon is-small">
                  <Icon :name="maskPassword
                    ? 'eye-slash'
                    : 'eye'"
                  />
                </span>
              </button>
            </p>
          </div>
          <div class="field">
            <p class="control">
              <button
                :class="['button is-success is-fullwidth', {
                  'is-loading': isLoading,
                }]"
                @click="signUp"
              >
                Sign up
              </button>
            </p>
          </div>
          <p>
            Already have an account?
            <router-link to="/login">Sign in</router-link>
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
import { register } from '@/composables/auth';
import { showError } from '@/composables/message';

export default defineComponent({
  name: 'SignUp',
  components: {
    Icon,
  },
  setup() {
    const router = useRouter();
    const name = ref('');
    const email = ref('');
    const password = ref('');
    const isLoading = ref(false);
    const maskPassword = ref(true);

    const togglePasswordMask = async () => {
      maskPassword.value = !maskPassword.value;
    };

    const signUp = async () => {
      isLoading.value = true;

      await register(email.value, password.value, name.value)
        .then(() => router.replace('game'))
        .catch(showError);

      isLoading.value = false;
    };

    return {
      name,
      email,
      password,
      isLoading,
      maskPassword,
      togglePasswordMask,
      signUp,
    };
  },
});
</script>
