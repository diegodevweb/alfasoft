<script setup lang="ts">
import axios from 'axios';
import { computed, onMounted, ref, useTemplateRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { API_URL, api } from '../services/api';
import { isAuthenticated } from '../services/auth';
import type { Contact } from '../types/contact';

const route = useRoute();
const router = useRouter();

const contact = ref<Contact | null>(null);
const loading = ref(true);
const deleting = ref(false);
const errorMessage = ref('');
const deleteDialog = useTemplateRef<HTMLDialogElement>('deleteDialog');

const contactId = computed(() => Number(route.params.id));
const successMessage = computed(() =>
  route.query.success === 'updated' ? 'Contact updated successfully.' : '',
);
const authenticated = computed(() => isAuthenticated());

async function loadContact() {
  loading.value = true;
  errorMessage.value = '';

  try {
    const response = await api.get<Contact>(`/contacts/${contactId.value}`);
    contact.value = response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message;
      errorMessage.value = typeof message === 'string' ? message : 'Failed to load contact.';
    } else {
      errorMessage.value = 'Failed to load contact.';
    }
  } finally {
    loading.value = false;
  }
}

function openDeleteDialog() {
  deleteDialog.value?.showModal();
}

function closeDeleteDialog() {
  deleteDialog.value?.close();
}

async function deleteContact() {
  if (!contact.value) {
    return;
  }

  deleting.value = true;
  errorMessage.value = '';

  try {
    await api.delete(`/contacts/${contact.value.id}`);
    closeDeleteDialog();
    await router.push({ path: '/', query: { success: 'deleted' } });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message;
      errorMessage.value = typeof message === 'string' ? message : 'Failed to delete contact.';
    } else {
      errorMessage.value = 'Failed to delete contact.';
    }
  } finally {
    deleting.value = false;
  }
}

onMounted(loadContact);
</script>

<template>
  <section class="mx-auto max-w-4xl">
    <div class="mb-6 flex items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold">Contact Details</h1>
        <p class="text-base-content/70">View and manage a single contact.</p>
      </div>

      <RouterLink to="/" class="btn btn-ghost">
        Back
      </RouterLink>
    </div>

    <div v-if="errorMessage" class="alert alert-error mb-6">
      {{ errorMessage }}
    </div>

    <div v-if="successMessage" class="alert alert-success mb-6">
      {{ successMessage }}
    </div>

    <div v-if="loading" class="py-10 text-center">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="contact" class="card bg-base-100 shadow">
      <div class="grid gap-0 md:grid-cols-[340px_1fr]">
        <figure class="bg-base-200">
          <img
            :src="`${API_URL}/uploads/${contact.picture}`"
            :alt="contact.name"
            class="h-full min-h-80 w-full object-cover"
          />
        </figure>

        <div class="card-body">
          <h2 class="card-title text-3xl">{{ contact.name }}</h2>

          <div class="grid gap-4 py-4">
            <div>
              <p class="text-sm uppercase tracking-wide text-base-content/60">ID</p>
              <p class="text-lg">{{ contact.id }}</p>
            </div>

            <div>
              <p class="text-sm uppercase tracking-wide text-base-content/60">Email</p>
              <p class="text-lg">{{ contact.email }}</p>
            </div>

            <div>
              <p class="text-sm uppercase tracking-wide text-base-content/60">Contact</p>
              <p class="text-lg">{{ contact.contact }}</p>
            </div>

            <div v-if="contact.createdAt">
              <p class="text-sm uppercase tracking-wide text-base-content/60">Created</p>
              <p>{{ new Date(contact.createdAt).toLocaleString() }}</p>
            </div>
          </div>

          <div v-if="authenticated" class="card-actions justify-end">
            <RouterLink :to="`/contacts/${contact.id}/edit`" class="btn btn-warning">
              Edit
            </RouterLink>

            <button
              class="btn btn-error"
              :class="{ 'btn-disabled': deleting }"
              :disabled="deleting"
              @click="openDeleteDialog"
            >
              <span v-if="deleting" class="loading loading-spinner loading-sm"></span>
              <span>{{ deleting ? 'Deleting...' : 'Delete' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <dialog ref="deleteDialog" class="modal">
      <div class="modal-box">
        <h3 class="text-lg font-bold">Delete contact</h3>
        <p class="py-4">
          Remove
          <span class="font-semibold">{{ contact?.name }}</span>
          permanently?
        </p>

        <div class="modal-action">
          <button type="button" class="btn btn-ghost" @click="closeDeleteDialog">
            Cancel
          </button>

          <button
            type="button"
            class="btn btn-error"
            :class="{ 'btn-disabled': deleting }"
            :disabled="deleting"
            @click="deleteContact"
          >
            <span v-if="deleting" class="loading loading-spinner loading-sm"></span>
            <span>{{ deleting ? 'Deleting...' : 'Delete' }}</span>
          </button>
        </div>
      </div>

      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  </section>
</template>
