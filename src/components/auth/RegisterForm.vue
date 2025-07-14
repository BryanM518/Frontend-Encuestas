<template>
  <div class="auth-form-container">
    <h2>Registrarse</h2>
    <form @submit.prevent="handleRegister">
      <div class="auth-form-group">
        <label for="username">Usuario</label>
        <input id="username" v-model="username" type="text" required />
      </div>

      <div class="auth-form-group">
        <label for="email">Correo electrónico</label>
        <input id="email" v-model="email" type="email" required />
      </div>

      <div class="auth-form-group">
        <label for="password">Contraseña</label>
        <input id="password" v-model="password" type="password" required />
      </div>

      <div class="auth-form-group">
        <label for="confirmPassword">Confirmar contraseña</label>
        <input id="confirmPassword" v-model="confirmPassword" type="password" required />
      </div>

      <button type="submit" class="auth-submit-button">Crear cuenta</button>

      <div v-if="errorMessage" class="auth-error-message">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="auth-success-message">
        {{ successMessage }}
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import RegisterFormLogic from '../../scripts/auth/RegisterForm';

export default defineComponent({
  ...RegisterFormLogic
});
</script>