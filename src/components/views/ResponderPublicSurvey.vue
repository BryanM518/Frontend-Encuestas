<template>
  <div class="public-survey-wrapper">
    <p v-if="loading">Cargando encuesta pública...</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <SurveyResponseForm v-else-if="survey" :survey="survey" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import SurveyResponseForm from '../Surveys/SurveyResponse.vue'; // asegúrate de que este sea el componente que acepta :survey como prop

interface Question {
  _id: string;
  type: string;
  text: string;
  options?: string[];
  is_required: boolean;
  visible_if?: {
    question_id: string;
    operator: string;
    value: any;
  } | null;
}

interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export default defineComponent({
  name: 'SurveyPublicAccess',
  components: {
    SurveyResponseForm
  },
  setup() {
    const route = useRoute();
    const survey = ref<Survey | null>(null);
    const loading = ref(true);
    const error = ref('');

    const fetchSurvey = async () => {
      loading.value = true;
      const surveyId = route.params.id as string;

      try {
        const { data } = await axios.get(
          `http://localhost:8000/api/survey_api/surveys/public/${surveyId}`
        );

        survey.value = {
          id: data._id,
          title: data.title,
          description: data.description,
          questions: data.questions.map((q: any) => ({
            ...q,
            id: q._id
          }))
        };
      } catch (err: any) {
        console.error('Error al cargar encuesta pública:', err);
        error.value = err.response?.data?.detail || 'No se pudo cargar la encuesta.';
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchSurvey);

    return {
      survey,
      loading,
      error
    };
  }
});
</script>

<style scoped>
.public-survey-wrapper {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.error {
  color: red;
  font-weight: bold;
}
</style>
