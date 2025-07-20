<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-section footer-info">
        <router-link to="/" class="footer-logo">
          <img src="../assets/images/logo.png" alt="Logo ST&T" class="logo-img-footer">
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

<style scoped>
.app-footer {
  background-color: var(--color1);
  color: var(--text-light);
  padding: 3rem 1rem 1.5rem;
  position: relative;
  z-index: 10;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.app-footer::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(to right, var(--color3), var(--color4));
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.footer-info {
  text-align: center;
  margin-bottom: 1.5rem;
}

.footer-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 1rem;
  text-decoration: none;
}

.logo-img-footer {
  height: 50px;
  width: auto;
  transition: transform 0.3s ease;
}

.footer-logo:hover .logo-img-footer {
  transform: scale(1.05);
}

.footer-logo span {
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

.footer-logo:hover span {
  background: linear-gradient(to right, var(--color5), var(--color4));
  -webkit-background-clip: text;
  background-clip: text;
}

.app-footer p {
  color: rgba(236, 240, 241, 0.8);
  font-size: 1rem;
  line-height: 1.6;
  max-width: 600px;
}

@media (min-width: 768px) {
  .app-footer {
    padding: 4rem 2rem 2rem;
  }
  
  .footer-content {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
  
  .footer-info {
    text-align: left;
    margin-bottom: 0;
  }
  
  .footer-logo {
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .footer-logo {
    flex-direction: column;
    gap: 8px;
  }
  
  .footer-logo span {
    font-size: 1.5rem;
  }
}
</style>