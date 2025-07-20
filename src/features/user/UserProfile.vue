<template>
  <div class="user-profile container">
    <h2 class="title">Mi Perfil</h2>

    <div v-if="loading" class="loading">Cargando información...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>

    <div v-else class="profile-card">
      <p><strong>Nombre:</strong> {{ user?.username || '—' }}</p>
      <p><strong>Email:</strong> {{ user?.email }}</p>
      <p><strong>ID:</strong> {{ user?.id }}</p>
      <p><strong>Cuenta creada:</strong> {{ user?.created_at ? formatDate(user.created_at) : '—' }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useUserProfile } from '../../scripts/views/UserProfile';

export default defineComponent({
  name: 'UserProfile',
  setup() {
    const {
      user,
      loading,
      error,
      formatDate,
      fetchUserProfile
    } = useUserProfile();

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

<style scoped>
.user-profile {
  background-color: var(--bg-white);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--shadow);
  margin-top: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.title {
  color: var(--color3);
  margin-bottom: 1.5rem;
  text-align: center;
}

.loading {
  text-align: center;
  font-weight: 500;
  color: var(--color3);
}

.profile-card p {
  font-size: 1rem;
  color: var(--text-dark);
  margin-bottom: 0.75rem;
}

.profile-card strong {
  color: var(--color2);
}
</style>
