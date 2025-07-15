// src/composables/useSurveyList.ts
import { ref, onMounted } from 'vue';
import axios from 'axios';

interface Question {
  _id?: string;
  type: string;
  text: string;
  options?: string[];
  is_required: boolean;
}

interface Survey {
  _id: string;
  title: string;
  description: string;
  status: string;
  questions: Question[];
}

export function useSurveyList() {
  const backendUrl = 'http://127.0.0.1:8000/api/survey_api/surveys/';
  const token = localStorage.getItem('token'); // Get token once on setup
  const surveys = ref<Survey[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const getAuthHeaders = () => {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const loadSurveys = async () => {
    loading.value = true;
    error.value = null;

    if (!token) {
      error.value = 'Debes iniciar sesión para ver tus encuestas.';
      loading.value = false;
      return;
    }

    try {
      const response = await axios.get<Survey[]>(backendUrl, getAuthHeaders());
      surveys.value = response.data;
    } catch (err) {
      console.error('Error al cargar encuestas:', err);
      error.value = 'No se pudieron cargar las encuestas.';
    } finally {
      loading.value = false;
    }
  };

  const deleteSurvey = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta encuesta?')) return;

    try {
      await axios.delete(`${backendUrl}${id}`, getAuthHeaders());
      surveys.value = surveys.value.filter((s) => s._id !== id);
    } catch (err) {
      console.error('Error al eliminar encuesta:', err);
      error.value = 'No se pudo eliminar la encuesta.';
    }
  };

  // Load surveys when the component using this composable is mounted
  onMounted(() => {
    loadSurveys();
  });

  return {
    surveys,
    loading,
    error,
    loadSurveys,
    deleteSurvey,
  };
}