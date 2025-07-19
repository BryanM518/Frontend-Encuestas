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

<style scoped>
.auth-page-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
}

.auth-form-container {
  width: 100%;
  max-width: 400px;
  background-color: var(--bg-white);
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 4px 12px var(--shadow);
}

h2 {
  text-align: center;
  color: var(--text-dark);
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}

.auth-form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-dark);
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: var(--color3);
  box-shadow: 0 0 0 2px rgba(158, 11, 65, 0.1);
}

.auth-submit-button {
  width: 100%;
  padding: 0.9rem;
  background-color: var(--color3);
  color: var(--text-light);
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 0.5rem;
}

.auth-submit-button:hover {
  background-color: var(--color4);
}

.auth-error-message {
  margin-top: 1.2rem;
  padding: 0.8rem;
  background-color: rgba(204, 62, 24, 0.1);
  color: var(--color4);
  border-radius: 6px;
  text-align: center;
  font-weight: 500;
}

.auth-register-link {
  text-align: center;
  margin-top: 1.5rem;
  color: var(--text-dark);
}

.auth-register-link a {
  color: var(--color3);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
}

.auth-register-link a:hover {
  color: var(--color4);
  text-decoration: underline;
}
</style>