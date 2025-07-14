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

<script lang="ts">
import { defineComponent } from 'vue';
import LoginFormLogic from '../../scripts/auth/LoginForm';

export default defineComponent({
  ...LoginFormLogic
});
</script>