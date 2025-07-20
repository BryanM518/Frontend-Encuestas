<template>
  <div class="survey-choice">
    <h2>Crear Nueva Encuesta</h2>
    <div class="choice-container">
      <div class="choice-card" @click="startFromScratch">
        <h3>Desde Cero</h3>
        <p>Comienza con un formulario en blanco y personalízalo a tu gusto.</p>
        <button class="select-btn">Seleccionar</button>
      </div>
      <div class="choice-card" @click="chooseTemplate">
        <h3>Usar una Plantilla</h3>
        <p>Elige una plantilla prediseñada para empezar rápidamente.</p>
        <button class="select-btn">Seleccionar</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'SurveyChoice',
  setup() {
    const router = useRouter();

    const startFromScratch = () => {
      router.push('/surveys/new/scratch');
    };

    const chooseTemplate = () => {
      router.push('/surveys/templates');
    };

    return {
      startFromScratch,
      chooseTemplate
    };
  }
});
</script>

<style scoped>
.survey-choice {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1.5rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h2 {
  color: var(--color3);
  font-size: 2.2rem;
  margin-bottom: 2rem;
  text-align: center;
}

.choice-container {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.choice-card {
  background-color: var(--bg-white);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  text-align: center;
  width: 300px;
}

.choice-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.choice-card h3 {
  font-size: 1.4rem;
  color: var(--text-dark);
  margin: 0.5rem 0;
}

.choice-card p {
  color: #555;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.select-btn {
  background: linear-gradient(135deg, var(--color3), var(--color4));
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.select-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .choice-container {
    flex-direction: column;
    align-items: center;
  }

  .choice-card {
    width: 100%;
    max-width: 400px;
  }
}
</style>