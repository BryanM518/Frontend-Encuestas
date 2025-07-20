<template>
  <div id="home-page">
    
    <section class="hero-carousel">
      <div class="carousel-slide imagen1" :class="{ active: currentSlide === 0 }"></div>
      <div class="carousel-slide imagen2" :class="{ active: currentSlide === 1 }"></div>
      <div class="carousel-slide imagen3" :class="{ active: currentSlide === 2 }"></div>
      <div class="carousel-slide imagen4" :class="{ active: currentSlide === 3 }"></div>
      <div class="carousel-slide imagen5" :class="{ active: currentSlide === 4 }"></div>
      
      <div class="carousel-overlay"></div>
      
      <div class="hero-content">
        <h1>Plataforma de Encuestas Inteligentes</h1>
        <p>Obtén insights valiosos con herramientas avanzadas de creación y análisis</p>
      </div>
    </section>

    
    <section id="features" class="features-section">
      <h2>Funcionalidades Clave</h2>
      
      <div class="feature-zigzag">
        
        <div class="feature-row">
          <div class="feature-card">
            <div class="feature-icon">🧩</div>
            <h3>Diseño de Preguntas Avanzado</h3>
            <p>Crea todo tipo de preguntas con lógica condicional, escalas de satisfacción, campos de texto, selección múltiple y carga de archivos.</p>
            <button class="feature-btn" @click="redirectTo('/surveys/new')">Crear Encuesta</button>
          </div>
          <div class="feature-visual">
            <div class="visual-placeholder">📊</div>
            <p class="visual-caption">Personaliza cada aspecto de tus encuestas</p>
          </div>
        </div>
        
        
        <div class="feature-row reverse">
          <div class="feature-card">
            <div class="feature-icon">🎨</div>
            <h3>Personalización de Marca</h3>
            <p>Adapta tus encuestas con el logo, colores y tipografías de tu empresa para generar confianza y reconocimiento.</p>
            <button class="feature-btn" @click="redirectTo('/surveys/new')">Personalizar Ahora</button>
          </div>
          <div class="feature-visual">
            <div class="visual-placeholder">🖌️</div>
            <p class="visual-caption">Marca consistente en todas tus encuestas</p>
          </div>
        </div>
        
        
        <div class="feature-row">
          <div class="feature-card">
            <div class="feature-icon">📚</div>
            <h3>Plantillas y Control de Versiones</h3>
            <p>Guarda encuestas como plantillas reutilizables y crea nuevas versiones manteniendo el histórico completo de datos.</p>
            <button class="feature-btn" @click="redirectTo('/surveys/templates')">Explorar Plantillas</button>
          </div>
          <div class="feature-visual">
            <div class="visual-placeholder">🔄</div>
            <p class="visual-caption">Compara resultados entre versiones</p>
          </div>
        </div>
        
        
        <div class="feature-row reverse">
          <div class="feature-card">
            <div class="feature-icon">📈</div>
            <h3>Análisis Inteligente</h3>
            <p>Genera informes automáticos en PDF, visualiza métricas clave y compara resultados entre versiones de encuestas.</p>
            <button class="feature-btn" @click="redirectTo('/surveydashboard')">Ver Análisis</button>
          </div>
          <div class="feature-visual">
            <div class="visual-placeholder">🔍</div>
            <p class="visual-caption">Descubre patrones en tus datos</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      currentSlide: 0,
      totalSlides: 5
    }
  },
  mounted() {
    setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
    }, 5000);
  },
methods: {
    redirectTo(path) {
      this.$router.push(path);
    }
  }
}
</script>

<style scoped>
/* Estilos específicos para el componente */
.feature-zigzag {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.feature-row {
  display: flex;
  align-items: center;
  margin-bottom: 60px;
  gap: 40px;
}

.reverse {
  flex-direction: row-reverse;
}

.feature-card {
  flex: 1;
  background-color: var(--bg-white);
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 5px 15px var(--shadow);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.feature-btn {
  background-color: var(--color3);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 30px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 20px;
  transition: all 0.3s ease;
}

.feature-btn:hover {
  background-color: var(--color4);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.feature-visual {
  flex: 1;
  text-align: center;
}

.visual-placeholder {
  font-size: 5rem;
  margin-bottom: 15px;
  opacity: 0.8;
}

.visual-caption {
  font-style: italic;
  color: var(--color2);
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .feature-row, .feature-row.reverse {
    flex-direction: column;
  }
  
  .feature-card, .feature-visual {
    width: 100%;
  }
}
</style>