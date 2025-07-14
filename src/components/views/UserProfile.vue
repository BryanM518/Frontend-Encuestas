<template>
  <div class="user-profile">
    <h2>Mi Perfil</h2>

    <div v-if="loading">Cargando información...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="profile-card">
      <p><strong>Nombre:</strong> {{ user.full_name || '—' }}</p>
      <p><strong>Email:</strong> {{ user.email }}</p>
      <p><strong>ID:</strong> {{ user.id }}</p>
      <p><strong>Cuenta creada:</strong> {{ formatDate(user.created_at) }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useUserProfile } from '../../scripts/views/UserProfile'; // Adjust the import path as needed

export default defineComponent({
  name: 'UserProfile',
  setup() {
    // Destructure the reactive variables and methods returned by the composable
    const {
      user,
      loading,
      error,
      formatDate,
      fetchUserProfile // If you need to expose a method to refetch
    } = useUserProfile();

    // Return them to make them accessible in the template
    return {
      user,
      loading,
      error,
      formatDate,
      fetchUserProfile
    };
  },
});
</script>