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
  version: number;
  logo_file_id?: string | null; // Añadido para soportar el logo
}

export function useSurveyList() {
  const backendUrl = 'http://127.0.0.1:8000/api/survey_api/surveys/';
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  const token = localStorage.getItem('token');
  const surveys = ref<Survey[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const showModal = ref(false);
  const invitationLink = ref('');
  const copyMessage = ref('');

  const getAuthHeaders = () => {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const logoUrl = (fileId: string) => {
    return `${baseUrl}/api/survey_api/surveys/files/${fileId}`;
  };

  const handleLogoError = (survey: Survey) => {
    survey.logo_file_id = null; // Limpiar logo_file_id si la imagen falla
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
      console.log('Encuestas recibidas:', response.data);
      surveys.value = response.data.map((survey: any) => ({
        ...survey,
        logo_file_id: survey.logo_file_id || null // Asegurar que logo_file_id esté incluido
      }));
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

  const generateLink = async (surveyId: string) => {
    if (!token) {
      alert('Debes iniciar sesión para generar enlaces.');
      return;
    }
    const url = `http://localhost:8000/api/survey_api/invitations/generate-access-link/${surveyId}`;

    try {
      const { data } = await axios.post(
        url,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      invitationLink.value = `${window.location.origin}/survey-access/${data.token_id}`;
      showModal.value = true;
      copyMessage.value = '';
    } catch (err: any) {
      console.error('Error generando enlace:', err);
      alert('No se pudo generar el enlace');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      copyMessage.value = 'Enlace copiado al portapapeles';
      setTimeout(() => (copyMessage.value = ''), 3000);
    } catch {
      copyMessage.value = 'No se pudo copiar';
    }
  };

  const downloadReport = async (surveyId: string) => {
    if (!token) {
      alert('Debes iniciar sesión para descargar informes.');
      return;
    }
    try {
      const response = await axios.get(`http://localhost:8000/api/survey_api/surveys/${surveyId}/final-report`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `informe_encuesta_${surveyId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error al descargar el informe:', err);
      alert('No se pudo descargar el informe');
    }
  };

  onMounted(() => {
    loadSurveys();
  });

  return {
    surveys,
    loading,
    error,
    loadSurveys,
    deleteSurvey,
    showModal,
    invitationLink,
    copyMessage,
    generateLink,
    copyToClipboard,
    downloadReport,
    logoUrl,
    handleLogoError
  };
}