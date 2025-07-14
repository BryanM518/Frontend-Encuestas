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

<script>
import axios from 'axios';

export default {
  name: 'UserProfile',
  data() {
    return {
      user: null,
      loading: true,
      error: null,
      token: localStorage.getItem('token'),
      endpoint: 'http://localhost:8000/api/v1/auth/me'
    };
  },
  methods: {
    async fetchUserProfile() {
      if (!this.token) {
        this.error = 'No has iniciado sesión.';
        this.loading = false;
        return;
      }

      try {
        const response = await axios.get(this.endpoint, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        });

        this.user = response.data;
      } catch (err) {
        console.error('Error al obtener perfil:', err);
        this.error = err.response?.data?.detail || 'Error al obtener los datos del usuario.';
      } finally {
        this.loading = false;
      }
    },
    formatDate(isoString) {
      const date = new Date(isoString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  },
  mounted() {
    this.fetchUserProfile();
  }
};
</script>
