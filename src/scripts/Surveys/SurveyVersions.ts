import { ref } from 'vue';
import axios from 'axios';

export function useSurveyVersions() {
  const versions = ref([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const loadSurveyVersions = async (surveyId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/survey_api/surveys/${surveyId}/versions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      versions.value = response.data;
    } catch (err: any) {
      console.error('Error al cargar versiones:', err);
      error.value = err.response?.data?.detail || 'Error al obtener versiones.';
    } finally {
      loading.value = false;
    }
  };

  return { versions, loading, error, loadSurveyVersions };
}
