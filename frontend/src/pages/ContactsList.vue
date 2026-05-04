<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { API_URL, api } from '../services/api';
import type { Contact } from '../types/contact';

const contacts = ref<Contact[]>([]);
const loading = ref(true);
const errorMessage = ref('');
const deletingId = ref<number | null>(null);

async function loadContacts() {
  loading.value = true;
  errorMessage.value = '';

  try {
    const response = await api.get<Contact[]>('/contacts');
    contacts.value = response.data;
  } catch {
    errorMessage.value = 'Failed to load contacts.';
  } finally {
    loading.value = false;
  }
}

async function deleteContact(id: number) {
  const confirmed = window.confirm('Delete this contact?');

  if (!confirmed) {
    return;
  }

  deletingId.value = id;
  errorMessage.value = '';

  try {
    await api.delete(`/contacts/${id}`);
    contacts.value = contacts.value.filter((contact) => contact.id !== id);
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
              :to="`/contacts/${contact.id}/edit`"
              class="btn btn-sm btn-warning"
            >
              Edit
            </RouterLink>

            <button
              class="btn btn-sm btn-error"
              :class="{ 'btn-disabled': deletingId === contact.id }"
              :disabled="deletingId === contact.id"
              @click="deleteContact(contact.id)"
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
  </div>
</template>
