<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import { getAuthenticatedUsername, isAuthenticated, logout } from './services/auth';

const route = useRoute();
const router = useRouter();
const authTick = ref(0);

const authenticated = computed(() => {
  route.fullPath;
  authTick.value;
  return isAuthenticated();
});

const username = computed(() => {
  route.fullPath;
  authTick.value;
  return getAuthenticatedUsername();
});

async function signOut() {
  logout();
  authTick.value += 1;
  await router.push('/');
}
</script>

<template>
  <div class="min-h-screen bg-base-200">
    <div class="navbar bg-base-100 shadow-sm px-6">
      <RouterLink to="/" class="text-xl font-bold">Contacts App</RouterLink>

      <div class="ml-auto flex items-center gap-3">
        <RouterLink v-if="authenticated" to="/contacts/new" class="btn btn-primary">
          Add Contact
        </RouterLink>

        <template v-if="authenticated">
          <span class="text-sm text-base-content/70">{{ username }}</span>
          <button class="btn btn-ghost" @click="signOut">Logout</button>
        </template>

        <RouterLink v-else to="/login" class="btn btn-outline">
          Login
        </RouterLink>
      </div>
    </div>

    <main class="max-w-6xl mx-auto p-6">
      <RouterView />
    </main>
  </div>
</template>
