<template>
  <div class="min-h-screen bg-base-200">
    <div class="navbar bg-base-100 shadow-sm px-6">
      <RouterLink to="/" class="text-xl font-bold">Contacts App</RouterLink>

      <div class="ml-auto">
        <RouterLink to="/contacts/new" class="btn btn-primary">
          Add Contact
        </RouterLink>
      </div>
    </div>

    <main class="max-w-6xl mx-auto p-6">
      <RouterView />
    </main>
  </div>
</template>