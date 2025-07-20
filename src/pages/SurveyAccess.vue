<template>
  <div class="survey-access">
    <div v-if="loading">Cargando encuesta...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <SurveyResponseForm
      v-else-if="survey"
      :survey="survey"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import SurveyResponseForm from '../features/surveys/SurveyResponse.vue';

interface Question {
  id: string;
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
  status: string;
  start_date: string;
  end_date: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  font_family: string;
}

export default defineComponent({
  name: 'SurveyAccess',
  components: { SurveyResponseForm },
  setup() {
    const route = useRoute();
    const survey = ref<Survey | null>(null);
    const loading = ref(true);
    const error = ref('');

    const tokenId = route.params.token_id as string;

    const fetchSurvey = async () => {
      loading.value = true;
      error.value = '';
      try {
        const { data } = await axios.get(
          `http://localhost:8000/api/survey_api/invitations/access/${tokenId}`
        );

        // ⚠️ Transformar _id en id para que coincida con la interfaz
        survey.value = {
          id: data._id,
          title: data.title,
          description: data.description,
          questions: data.questions.map((q: any) => ({
            ...q,
            id: q._id
          })),
          status: data.status,
          start_date: data.start_date,
          end_date: data.end_date,
          logo_url: data.logo_url,
          primary_color: data.primary_color,
          secondary_color: data.secondary_color,
          font_family: data.font_family
        };

      } catch (err: any) {
        console.error('Error al acceder por token:', err);
        error.value = err.response?.data?.detail || 'No se pudo acceder a la encuesta.';
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchSurvey);

    return { survey, loading, error };
  },
});
</script>

<style scoped>
.survey-access {
  max-width: 800px;
  margin: auto;
  padding: 20px;
}

.error {
  color: red;
  font-weight: bold;
  margin-top: 20px;
}
</style>
