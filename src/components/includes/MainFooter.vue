<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-section footer-info">
        <router-link to="/" class="footer-logo">
          <img src="../../assets/logo.png" alt="Logo ST&T" class="logo-img-footer">
          <span>ST&T Encuestas</span>
        </router-link>
        <p>&copy; {{ currentYear }} ST&T Encuestas. Todos los derechos reservados.</p>
      </div>

    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',
  data() {
    return {
      currentYear: new Date().getFullYear()
    };
  }
};
</script>