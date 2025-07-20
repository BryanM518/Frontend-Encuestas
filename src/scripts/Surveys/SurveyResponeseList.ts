import { ref } from 'vue';
import axios from 'axios';

export function useSurveyResponses(surveyId: string) {
  // Estados reactivos
  const responses = ref<any[]>([]);
  const error = ref<string | null>(null);
  const loading = ref<boolean>(false);
  const questionMap = ref<Record<string, string>>({});
  const surveyTitle = ref<string>('');

  // Obtener respuestas de la encuesta
  const fetchResponses = async () => {
    loading.value = true;
    error.value = null;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://127.0.0.1:8000/api/survey_api/surveys/${surveyId}/responses`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      responses.value = response.data;
    } catch (err) {
      error.value = 'No se pudieron cargar las respuestas.';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  // Obtener preguntas de la encuesta
  const fetchSurveyQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://127.0.0.1:8000/api/survey_api/surveys/${surveyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      response.data.questions.forEach((q: any) => {
        questionMap.value[q._id] = q.text;
      });
      surveyTitle.value = response.data.title || '';
    } catch (err) {
      console.error('Error al obtener preguntas:', err);
    }
  };

  // Formatear fecha
  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString();
  };

  // Descargar informe PDF
  const descargarInforme = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://127.0.0.1:8000/api/survey_api/surveys/${surveyId}/final-report`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `informe_encuesta_${surveyId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al descargar el informe:', err);
      alert('No se pudo descargar el informe.');
    }
  };

  // Exportar respuestas (CSV/Excel)
  const exportResponses = async (format: 'csv' | 'xlsx') => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://127.0.0.1:8000/api/survey_api/surveys/${surveyId}/export`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { format },
          responseType: 'blob'
        }
      );
      const mimeType = format === 'csv' 
        ? 'text/csv' 
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeTitle = surveyTitle.value.replace(/\s+/g, '_').toLowerCase();
      link.setAttribute('download', `respuestas_${safeTitle}.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al exportar respuestas:', err);
      alert('No se pudo exportar las respuestas.');
    }
  };

  // Inicializar datos
  const init = async () => {
    await fetchResponses();
    await fetchSurveyQuestions();
  };

  return {
    responses,
    error,
    loading,
    questionMap,
    init,
    formatDate,
    descargarInforme,
    exportResponses
  };
}