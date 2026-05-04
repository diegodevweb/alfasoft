import { createRouter, createWebHistory } from "vue-router";
import ContactsList from "../pages/ContactsList.vue";
import ContactForm from "../pages/ContactForm.vue";
import ContactDetails from "../pages/ContactDetails.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: ContactsList },
    { path: "/contacts/new", component: ContactForm },
    { path: "/contacts/:id", component: ContactDetails },
    { path: "/contacts/:id/edit", component: ContactForm },
  ],
});