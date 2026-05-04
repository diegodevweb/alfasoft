import { createRouter, createWebHashHistory } from "vue-router";
import ContactDetails from "../pages/ContactDetails.vue";
import ContactForm from "../pages/ContactForm.vue";
import ContactsList from "../pages/ContactsList.vue";
import LoginPage from "../pages/LoginPage.vue";
import { isAuthenticated } from "../services/auth";

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", component: ContactsList },
    { path: "/login", component: LoginPage },
    { path: "/contacts/new", component: ContactForm, meta: { requiresAuth: true } },
    { path: "/contacts/:id", component: ContactDetails },
    { path: "/contacts/:id/edit", component: ContactForm, meta: { requiresAuth: true } },
  ],
});

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    return {
      path: "/login",
      query: { redirect: to.fullPath },
    };
  }

  if (to.path === "/login" && isAuthenticated()) {
    return "/";
  }

  return true;
});
