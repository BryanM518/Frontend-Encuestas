<template>
  <header class="app-header">
    <div class="header-content">
      <router-link to="/" class="logo">
        <img src="../assets/images/logo.png" alt="Logo de ST&T" class="logo-img" />
        <span>ST&T Encuestas</span>
      </router-link>

      <button class="hamburger" @click="toggleMobileMenu">☰</button>

      <nav class="main-nav" :class="{ open: mobileMenuOpen }">
        <ul>
          <li><router-link to="/public-surveys">Encuestas</router-link></li>
          <li><router-link to="/templates">Plantillas</router-link></li>

          <li v-if="!isAuthenticated"><router-link to="/login">Iniciar sesión</router-link></li>

          <li v-if="isAuthenticated" class="user-menu">
            <div class="dropdown" @click="toggleMenu">
              <span class="user-initials">👤</span>
              <ul v-if="showMenu" class="dropdown-menu">
                <li><router-link to="/UserProfile">Mi Perfil</router-link></li>
                <li><router-link to="/surveydashboard">Dashboard</router-link></li>
                <li><router-link to="/mysurveys">Mis Encuestas</router-link></li>
                <li><router-link to="/surveyeditor">Crear Encuesta</router-link></li>
                <li><router-link to="/surveyresponse">Reportes</router-link></li>
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
import { useMainHeader } from '../scripts/layouts/MainHeader';

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

<style scoped>
.app-header {
  background-color: var(--color1);
  color: var(--text-light);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 2px solid rgba(158, 11, 65, 0.3);
}

.header-content {
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.02);
}

.logo-img {
  height: 50px;
  width: auto;
  border-radius: 8px;
}

.logo span {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-light);
  letter-spacing: 0.5px;
  background: linear-gradient(to right, var(--text-light), var(--color5));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  transition: all 0.3s ease;
}

.logo:hover span {
  background: linear-gradient(to right, var(--color5), var(--color4));
  -webkit-background-clip: text;
  background-clip: text;
}

.hamburger {
  display: none;
  background: none;
  border: none;
  color: var(--text-light);
  font-size: 2rem;
  cursor: pointer;
  padding: 0.5rem;
}

.main-nav ul {
  display: flex;
  list-style: none;
  gap: 1.5rem;
  align-items: center;
  margin: 0;
  padding: 0;
}

.main-nav a {
  color: var(--text-light);
  text-decoration: none;
  font-weight: 500;
  font-size: 1.1rem;
  padding: 0.5rem;
  position: relative;
  transition: all 0.3s ease;
}

.main-nav a:hover {
  color: var(--color5);
}

.main-nav a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(to right, var(--color5), var(--color4));
  transition: width 0.3s ease;
}

.main-nav a:hover::after,
.main-nav a.router-link-exact-active::after {
  width: 100%;
}

.main-nav a.router-link-exact-active {
  color: var(--color5);
  font-weight: 600;
}

.notifications {
  position: relative;
}

.notifications .badge {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 12px;
  height: 12px;
  background-color: var(--color4);
  border-radius: 50%;
  border: 2px solid var(--color1);
}

.user-menu {
  position: relative;
  cursor: pointer;
}

.user-initials {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: var(--color3);
  color: var(--text-light);
  border-radius: 50%;
  font-weight: bold;
  transition: all 0.3s ease;
}

.user-initials:hover {
  background-color: var(--color4);
  transform: scale(1.1);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--bg-white);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 0.5rem 0;
  min-width: 200px;
  z-index: 100;
  overflow: hidden;
  margin-top: 10px;
  animation: fadeInDropdown 0.3s ease;
}

@keyframes fadeInDropdown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-menu::before {
  content: '';
  position: absolute;
  top: -8px;
  right: 15px;
  width: 16px;
  height: 16px;
  background-color: var(--bg-white);
  transform: rotate(45deg);
}

.dropdown-menu li {
  padding: 0;
  margin: 0;
}

.dropdown-menu a {
  display: block;
  padding: 0.8rem 1.5rem;
  color: var(--text-dark);
  text-decoration: none;
  transition: all 0.2s ease;
  font-weight: 500;
}

.dropdown-menu a:hover {
  background-color: rgba(158, 11, 65, 0.1);
  color: var(--color3);
  padding-left: 1.8rem;
}

.dropdown-menu a.router-link-exact-active {
  background-color: rgba(158, 11, 65, 0.15);
  color: var(--color3);
  font-weight: 600;
  border-left: 3px solid var(--color3);
}

@media (max-width: 768px) {
  .hamburger {
    display: block;
  }
  
  .main-nav {
    position: fixed;
    top: 80px;
    left: 0;
    right: 0;
    background-color: var(--color1);
    height: 0;
    overflow: hidden;
    transition: height 0.4s ease;
    z-index: 999;
  }
  
  .main-nav.open {
    height: calc(100vh - 80px);
  }
  
  .main-nav ul {
    flex-direction: column;
    padding: 2rem;
    gap: 2rem;
  }
  
  .main-nav li {
    width: 100%;
    text-align: center;
  }
  
  .main-nav a {
    display: block;
    padding: 1rem;
    font-size: 1.2rem;
  }
  
  .dropdown-menu {
    position: static;
    width: 100%;
    margin-top: 1rem;
    animation: none;
  }
  
  .dropdown-menu::before {
    display: none;
  }
}

@media (max-width: 480px) {
  .logo span {
    font-size: 1.5rem;
  }
  
  .logo-img {
    height: 40px;
  }
  
  .header-content {
    padding: 0.8rem;
  }
}
</style>