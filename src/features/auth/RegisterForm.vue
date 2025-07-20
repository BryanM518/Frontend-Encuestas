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

<style scoped>
.auth-form-container {
  width: 100%;
  max-width: 450px;
  background-color: var(--bg-white);
  border-radius: 12px;
  padding: 2.5rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  margin: 2rem auto;
}

h2 {
  text-align: center;
  color: var(--color3);
  margin-bottom: 2rem;
  font-size: 2rem;
  position: relative;
  padding-bottom: 0.8rem;
}

h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 25%;
  width: 50%;
  height: 3px;
  background: linear-gradient(to right, var(--color3), var(--color4));
  border-radius: 3px;
}

.auth-form-group {
  margin-bottom: 1.8rem;
  position: relative;
}

label {
  display: block;
  margin-bottom: 0.7rem;
  color: var(--text-dark);
  font-weight: 500;
  font-size: 1.05rem;
}

input {
  width: 100%;
  padding: 0.9rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: var(--bg-light);
}

input:focus {
  outline: none;
  border-color: var(--color3);
  box-shadow: 0 0 0 3px rgba(158, 11, 65, 0.15);
  background-color: var(--bg-white);
}

.auth-submit-button {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, var(--color3), var(--color4));
  color: var(--text-light);
  border: none;
  border-radius: 8px;
  font-size: 1.15rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 15px rgba(158, 11, 65, 0.3);
}

.auth-submit-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(158, 11, 65, 0.4);
}

.auth-submit-button:active {
  transform: translateY(0);
}

.auth-error-message {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: rgba(204, 62, 24, 0.1);
  color: var(--color4);
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  border-left: 4px solid var(--color4);
}

.auth-success-message {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: rgba(46, 204, 113, 0.15);
  color: #27ae60;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  border-left: 4px solid #27ae60;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.password-strength {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
}

.password-strength span {
  display: inline-block;
  height: 5px;
  border-radius: 5px;
  margin-right: 5px;
  flex-grow: 1;
  background-color: #eee;
  transition: all 0.3s ease;
}

.password-strength .strength-1 {
  background-color: var(--color4);
}

.password-strength .strength-2 {
  background-color: var(--color5);
}

.password-strength .strength-3 {
  background-color: #2ecc71;
}

@media (max-width: 500px) {
  .auth-form-container {
    padding: 1.8rem;
    margin: 1.5rem;
  }
  
  h2 {
    font-size: 1.7rem;
    margin-bottom: 1.5rem;
  }
}
</style>