<template>
  <div class="auth-page-wrapper">
    <div class="auth-form-container">
      <h2>Iniciar sesión</h2>
      <form @submit.prevent="handleLogin">
        <div class="auth-form-group">
          <label for="email">Usuario</label>
          <input id="email" v-model="email" type="text" required />
        </div>

        <div class="auth-form-group">
          <label for="password">Contraseña</label>
          <input id="password" v-model="password" type="password" required />
        </div>

        <button type="submit" class="auth-submit-button">Ingresar</button>

        <div v-if="errorMessage" class="auth-error-message">
          {{ errorMessage }}
        </div>
      </form>

      <p class="auth-register-link">
        ¿No tienes una cuenta?
        <router-link to="/register">Regístrate aquí</router-link>
      </p>
    </div>
  </div>
</template>


<script>
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

export default {
  name: 'LoginForm',
  data() {
    return {
      email: '',
      password: '',
      errorMessage: ''
    };
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    return { router, authStore };
  },
  methods: {
    async handleLogin() {
      try {
        const formData = new URLSearchParams();
        formData.append('username', this.email);
        formData.append('password', this.password);

        const response = await axios.post('http://localhost:8000/api/v1/auth/token', formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });

        const token = response.data.access_token;
        this.authStore.login(token);
        this.errorMessage = '';
        this.router.push('/surveytest');
      } catch (error) {
        this.errorMessage = error.response?.data?.detail || 'Error al iniciar sesión';
      }
    }
  }
};
</script>
