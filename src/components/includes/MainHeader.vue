<template>
  <header class="app-header">
    <div class="header-content">
      <router-link to="/" class="logo">
        <img src="../../assets/logo.png" alt="Logo de ST&T" class="logo-img" />
        <span>ST&T Encuestas</span>
      </router-link>

      <button class="hamburger" @click="toggleMobileMenu">☰</button>

      <nav class="main-nav" :class="{ open: mobileMenuOpen }">
        <ul>
          <li><router-link to="/surveytest">Encuestas</router-link></li>
          <li><router-link to="/templates">Plantillas</router-link></li>

          <li v-if="isAuthenticated" class="notifications">
            <router-link to="/notifications">🔔</router-link>
            <span v-if="hasAlerts" class="badge"></span>
          </li>

          <li v-if="!isAuthenticated"><router-link to="/login">Iniciar sesión</router-link></li>

          <li v-if="isAuthenticated" class="user-menu">
            <div class="dropdown" @click="toggleMenu">
              <span class="user-initials">👤</span>
              <ul v-if="showMenu" class="dropdown-menu">
                <li><router-link to="/UserProfile">Mi Perfil</router-link></li>
                <li><router-link to="/surveydashboard">Dashboard</router-link></li>
                <li><router-link to="/mysurveys">Mis Encuestas</router-link></li>
                <li><router-link to="/surveyeditor">Crear Encuesta</router-link></li>
                <li><router-link to="/reports">Reportes</router-link></li>
                <li><a href="#" @click.prevent="handleLogout">Cerrar sesión</a></li>
              </ul>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMainHeader } from '../../scripts/includes/MainHeader'; // Adjust the import path as needed

export default defineComponent({
  name: 'MainHeader',
  setup() {
    const {
      isAuthenticated,
      hasAlerts,
      handleLogout,
      showMenu,
      toggleMenu,
      mobileMenuOpen,
      toggleMobileMenu,
    } = useMainHeader();

    return {
      isAuthenticated,
      hasAlerts,
      handleLogout,
      showMenu,
      toggleMenu,
      mobileMenuOpen,
      toggleMobileMenu,
    };
  },
});
</script>