<template>
  <div class="public-survey-list">
    <h2>Encuestas Públicas</h2>

    <p v-if="loading">Cargando encuestas...</p>
    <p v-if="error" class="error">{{ error }}</p>

    <ul v-if="surveys.length">
      <li v-for="survey in surveys" :key="survey._id" class="survey-item">
        <strong>{{ survey.title }}</strong>
        <p>{{ survey.description }}</p>
        <router-link :to="`/responder/${survey._id}`">Responder Encuesta</router-link>
      </li>
    </ul>

    <p v-else-if="!loading && !error">No hay encuestas públicas disponibles.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import axios from 'axios';

interface Survey {
  _id: string;
  title: string;
  description: string;
}

export default defineComponent({
  name: 'PublicSurveyList',
  setup() {
    const surveys = ref<Survey[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const endpoint = 'http://127.0.0.1:8000/api/survey_api/surveys/public';

    const loadSurveys = async () => {
      loading.value = true;
      error.value = null;
      try {
        const response = await axios.get(endpoint);
        surveys.value = response.data;
      } catch (err) {
        console.error(err);
        error.value = 'No se pudieron cargar las encuestas públicas.';
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      loadSurveys();
    });

    return {
      surveys,
      loading,
      error
    };
  }
});
</script>

<style scoped>
.public-survey-list {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}
.survey-item {
  background-color: #fff;
  border: 1px solid #ddd;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
}
.error {
  color: red;
}
</style>
