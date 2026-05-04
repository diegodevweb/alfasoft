<script setup lang="ts">
import axios from 'axios';
import { computed, onMounted, ref, useTemplateRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { API_URL, api } from '../services/api';
import { isAuthenticated } from '../services/auth';
import type { Contact } from '../types/contact';

const route = useRoute();
const router = useRouter();

const contacts = ref<Contact[]>([]);
const loading = ref(true);
const errorMessage = ref('');
const deletingId = ref<number | null>(null);
const pendingDeletion = ref<Contact | null>(null);
const deleteDialog = useTemplateRef<HTMLDialogElement>('deleteDialog');

const successMessage = computed(() => {
  if (route.query.success === 'created') {
    return 'Contact created successfully.';
  }

  if (route.query.success === 'deleted') {
    return 'Contact deleted successfully.';
  }

  return '';
});

const authenticated = computed(() => isAuthenticated());

async function loadContacts() {
  loading.value = true;
  errorMessage.value = '';

  try {
    const response = await api.get<Contact[]>('/contacts');
    if (!Array.isArray(response.data)) {
      throw new Error('Invalid contacts response');
    }

    contacts.value = response.data;
  } catch {
    errorMessage.value = 'Failed to load contacts.';
    contacts.value = [];
  } finally {
    loading.value = false;
  }
}

function openDeleteDialog(contact: Contact) {
  pendingDeletion.value = contact;
  deleteDialog.value?.showModal();
}

function closeDeleteDialog() {
  deleteDialog.value?.close();
  pendingDeletion.value = null;
}

async function deleteContact() {
  if (!pendingDeletion.value) {
    return;
  }

  const id = pendingDeletion.value.id;
  deletingId.value = id;
  errorMessage.value = '';

  try {
    await api.delete(`/contacts/${id}`);
    contacts.value = contacts.value.filter((contact) => contact.id !== id);
    closeDeleteDialog();
    await router.replace({ path: '/', query: { success: 'deleted' } });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message;
      errorMessage.value = typeof message === 'string' ? message : 'Failed to delete contact.';
    } else {
      errorMessage.value = 'Failed to delete contact.';
    }
  } finally {
    deletingId.value = null;
  }
}

onMounted(loadContacts);
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold">Contacts</h1>
      <p class="text-base-content/70">Manage your contact list</p>
    </div>

    <div v-if="errorMessage" class="alert alert-error mb-6">
      {{ errorMessage }}
    </div>

    <div v-if="successMessage" class="alert alert-success mb-6">
      {{ successMessage }}
    </div>

    <div v-if="loading" class="text-center py-10">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="contacts.length === 0" class="alert">
      No contacts found.
    </div>

    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="contact in contacts"
        :key="contact.id"
        class="card bg-base-100 shadow"
      >
        <figure>
          <img
            :src="`${API_URL}/uploads/${contact.picture}`"
            :alt="contact.name"
            class="h-56 w-full object-cover"
          />
        </figure>

        <div class="card-body">
          <h2 class="card-title">{{ contact.name }}</h2>
          <p>{{ contact.email }}</p>
          <p>{{ contact.contact }}</p>

          <div class="card-actions justify-end mt-4">
            <RouterLink :to="`/contacts/${contact.id}`" class="btn btn-sm">
              Details
            </RouterLink>

            <RouterLink
              v-if="authenticated"
              :to="`/contacts/${contact.id}/edit`"
              class="btn btn-sm btn-warning"
            >
              Edit
            </RouterLink>

            <button
              v-if="authenticated"
              class="btn btn-sm btn-error"
              :class="{ 'btn-disabled': deletingId === contact.id }"
              :disabled="deletingId === contact.id"
              @click="openDeleteDialog(contact)"
            >
              <span
                v-if="deletingId === contact.id"
                class="loading loading-spinner loading-xs"
              ></span>
              <span>{{ deletingId === contact.id ? 'Deleting...' : 'Delete' }}</span>
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
          <span class="font-semibold">{{ pendingDeletion?.name }}</span>
          from your contact list?
        </p>

        <div class="modal-action">
          <button type="button" class="btn btn-ghost" @click="closeDeleteDialog">
            Cancel
          </button>

          <button
            type="button"
            class="btn btn-error"
            :class="{ 'btn-disabled': deletingId !== null }"
            :disabled="deletingId !== null"
            @click="deleteContact"
          >
            <span v-if="deletingId !== null" class="loading loading-spinner loading-sm"></span>
            <span>{{ deletingId !== null ? 'Deleting...' : 'Delete' }}</span>
          </button>
        </div>
      </div>

      <form method="dialog" class="modal-backdrop">
        <button @click="pendingDeletion = null">close</button>
      </form>
    </dialog>
  </div>
</template>
