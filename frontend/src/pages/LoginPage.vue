<script setup lang="ts">
import axios from 'axios';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { login } from '../services/auth';

const route = useRoute();
const router = useRouter();

const username = ref('admin');
const password = ref('admin123');
const loading = ref(false);
const errorMessage = ref('');

async function submitForm() {
  errorMessage.value = '';
  loading.value = true;

  try {
    await login(username.value, password.value);

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/';
    await router.push(redirect);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message;
      errorMessage.value = typeof message === 'string' ? message : 'Failed to authenticate.';
    } else {
      errorMessage.value = 'Failed to authenticate.';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="mx-auto max-w-md pt-10">
    <div class="mb-6 text-center">
      <h1 class="text-3xl font-bold">Sign In</h1>
      <p class="text-base-content/70">Authenticate to create, edit and delete contacts.</p>
    </div>

    <div class="card bg-base-100 shadow">
      <div class="card-body">
        <div v-if="errorMessage" class="alert alert-error mb-4">
          {{ errorMessage }}
        </div>

        <form class="grid gap-5" @submit.prevent="submitForm">
          <label class="form-control w-full">
            <div class="label">
              <span class="label-text">Username</span>
            </div>
            <input
              v-model="username"
              type="text"
              class="input input-bordered w-full"
              required
            />
          </label>

          <label class="form-control w-full">
            <div class="label">
              <span class="label-text">Password</span>
            </div>
            <input
              v-model="password"
              type="password"
              class="input input-bordered w-full"
              required
            />
          </label>

          <button
            type="submit"
            class="btn btn-primary"
            :class="{ 'btn-disabled': loading }"
            :disabled="loading"
          >
            <span v-if="loading" class="loading loading-spinner loading-sm"></span>
            <span>{{ loading ? 'Signing in...' : 'Sign in' }}</span>
          </button>
        </form>
      </div>
    </div>
  </section>
</template>
