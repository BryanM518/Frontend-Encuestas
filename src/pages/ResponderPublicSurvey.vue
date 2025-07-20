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
  status: string;
  questions: Question[];
  start_date?: string;
  end_date?: string;
  logo_file_id?: string | null;
  logo_url?: string | null;
  primary_color?: string;
  secondary_color?: string;
  font_family?: string;
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
        console.log('Backend response for /public/{id}:', JSON.stringify(data, null, 2));

        survey.value = {
          id: data._id,
          title: data.title,
          description: data.description,
          status: data.status,
          questions: data.questions.map((q: any) => ({
            id: q._id,
            type: q.type,
            text: q.text,
            options: q.options,
            is_required: q.is_required,
            visible_if: q.visible_if || null
          })),
          start_date: data.start_date,
          end_date: data.end_date,
          logo_file_id: data.logo_file_id || null,
          logo_url: data.logo_file_id
            ? `http://localhost:8000/api/survey_api/surveys/files/${data.logo_file_id}`
            : null,
          primary_color: data.primary_color,
          secondary_color: data.secondary_color,
          font_family: data.font_family
        };

        console.log('Mapped survey:', JSON.stringify(survey.value, null, 2));
        if (survey.value.logo_file_id) {
          console.log('Generated logo URL in ResponderPublicSurvey:', survey.value.logo_url);
        } else {
          console.warn('No logo_file_id in response for survey:', surveyId);
        }
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