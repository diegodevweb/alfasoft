<script setup lang="ts">
import axios from 'axios';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { API_URL, api } from '../services/api';
import type { Contact } from '../types/contact';

const route = useRoute();
const router = useRouter();

const name = ref('');
const contact = ref('');
const email = ref('');
const picture = ref<File | null>(null);
const previewUrl = ref('');
const loading = ref(false);
const pageLoading = ref(false);
const errorMessage = ref('');

const isEditMode = computed(() => typeof route.params.id === 'string');
const contactId = computed(() => Number(route.params.id));

const isFormValid = computed(() => {
  return (
    name.value.trim().length >= 6 &&
    /^\d{9}$/.test(contact.value.replace(/\D/g, '')) &&
    email.value.trim().length > 0 &&
    (isEditMode.value || picture.value !== null)
  );
});

function formatContact(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 9);
  const parts = [
    digits.slice(0, 3),
    digits.slice(3, 6),
    digits.slice(6, 9),
  ].filter(Boolean);

  return parts.join(' ');
}

function onContactInput(event: Event) {
  const input = event.target as HTMLInputElement;
  contact.value = formatContact(input.value);
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0] ?? null;

  picture.value = file;
  previewUrl.value = file ? URL.createObjectURL(file) : '';
}

async function loadContact() {
  if (!isEditMode.value) {
    return;
  }

  pageLoading.value = true;
  errorMessage.value = '';

  try {
    const response = await api.get<Contact>(`/contacts/${contactId.value}`);
    const data = response.data;

    name.value = data.name;
    contact.value = formatContact(data.contact);
    email.value = data.email;
    previewUrl.value = `${API_URL}/uploads/${data.picture}`;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message;
      errorMessage.value = typeof message === 'string' ? message : 'Failed to load contact.';
    } else {
      errorMessage.value = 'Failed to load contact.';
    }
  } finally {
    pageLoading.value = false;
  }
}

async function submitForm() {
  errorMessage.value = '';

  if (!isEditMode.value && !picture.value) {
    errorMessage.value = 'Select an image before submitting.';
    return;
  }

  const formData = new FormData();
  formData.append('name', name.value);
  formData.append('contact', contact.value.replace(/\D/g, ''));
  formData.append('email', email.value);

  if (picture.value) {
    formData.append('picture', picture.value);
  }

  loading.value = true;

  try {
    if (isEditMode.value) {
      await api.put(`/contacts/${contactId.value}`, formData);
      await router.push({
        path: `/contacts/${contactId.value}`,
        query: { success: 'updated' },
      });
    } else {
      await api.post('/contacts', formData);
      await router.push({
        path: '/',
        query: { success: 'created' },
      });
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message;

      if (Array.isArray(message)) {
        errorMessage.value = message.join(', ');
      } else if (typeof message === 'string') {
        errorMessage.value = message;
      } else {
        errorMessage.value = isEditMode.value
          ? 'Failed to update contact.'
          : 'Failed to create contact.';
      }
    } else {
      errorMessage.value = isEditMode.value
        ? 'Failed to update contact.'
        : 'Failed to create contact.';
    }
  } finally {
    loading.value = false;
  }
}

onMounted(loadContact);
</script>

<template>
  <section class="mx-auto max-w-3xl">
    <div class="mb-6">
      <h1 class="text-3xl font-bold">
        {{ isEditMode ? 'Edit Contact' : 'New Contact' }}
      </h1>
      <p class="text-base-content/70">
        {{ isEditMode ? 'Update the contact information.' : 'Fill in the fields and upload a picture.' }}
      </p>
    </div>

    <div class="card bg-base-100 shadow">
      <div class="card-body gap-6">
        <div v-if="errorMessage" class="alert alert-error">
          {{ errorMessage }}
        </div>

        <div v-if="pageLoading" class="py-10 text-center">
          <span class="loading loading-spinner loading-lg"></span>
        </div>

        <form class="grid gap-5" @submit.prevent="submitForm">
          <label class="form-control w-full">
            <div class="label">
              <span class="label-text">Name</span>
            </div>
            <input
              v-model="name"
              type="text"
              class="input input-bordered w-full"
              placeholder="John Carter"
              minlength="6"
              required
            />
          </label>

          <label class="form-control w-full">
            <div class="label">
              <span class="label-text">Contact</span>
            </div>
            <input
              v-model="contact"
              type="text"
              class="input input-bordered w-full"
              placeholder="123 456 789"
              inputmode="numeric"
              maxlength="11"
              required
              @input="onContactInput"
            />
            <div class="label">
              <span class="label-text-alt">Use 9 digits. Format shown automatically.</span>
            </div>
          </label>

          <label class="form-control w-full">
            <div class="label">
              <span class="label-text">Email</span>
            </div>
            <input
              v-model="email"
              type="email"
              class="input input-bordered w-full"
              placeholder="john@example.com"
              required
            />
          </label>

          <label class="form-control w-full">
            <div class="label">
              <span class="label-text">Picture</span>
            </div>
            <input
              type="file"
              class="file-input file-input-bordered w-full"
              accept="image/*"
              @change="onFileChange"
            />
            <div class="label">
              <span class="label-text-alt">
                {{ isEditMode ? 'Choose a new image only if you want to replace the current one.' : 'An image is required.' }}
              </span>
            </div>
          </label>

          <div v-if="previewUrl" class="rounded-box bg-base-200 p-3">
            <img
              :src="previewUrl"
              alt="Preview"
              class="h-56 w-full rounded-xl object-cover"
            />
          </div>

          <div class="flex gap-3">
            <button
              type="submit"
              class="btn btn-primary"
              :class="{ 'btn-disabled': loading || pageLoading || !isFormValid }"
              :disabled="loading || pageLoading || !isFormValid"
            >
              <span v-if="loading" class="loading loading-spinner loading-sm"></span>
              <span>
                {{
                  loading
                    ? (isEditMode ? 'Updating...' : 'Saving...')
                    : (isEditMode ? 'Update contact' : 'Save contact')
                }}
              </span>
            </button>

            <RouterLink :to="isEditMode ? `/contacts/${contactId}` : '/'" class="btn btn-ghost">
              Cancel
            </RouterLink>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>
