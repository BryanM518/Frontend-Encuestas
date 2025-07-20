import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

export interface Question {
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

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  status: string;
  start_date?: string;
  end_date?: string;
  logo_file_id?: string | null;
  logo_url?: string | null;
  primary_color?: string;
  secondary_color?: string;
  font_family?: string;
}

export function useSurveyResponse(initialSurvey?: Survey) {
  const route = useRoute();
  const localSurvey = ref<Survey | null>(initialSurvey || null);
  const answers = ref<Record<string, any>>({});
  const responderEmail = ref('');
  const message = ref('');
  const success = ref(false);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const logoLoadFailed = ref(false);

  const activeSurvey = computed(() => initialSurvey || localSurvey.value);

  const surveyStyle = computed(() => ({
    '--primary-color': activeSurvey.value?.primary_color || '#3498db',
    '--secondary-color': activeSurvey.value?.secondary_color || '#2ecc71',
    fontFamily: activeSurvey.value?.font_family || 'inherit'
  }));

  const visibleQuestions = computed(() =>
    activeSurvey.value?.questions.filter(q => isQuestionVisible(q)) || []
  );

  function initAnswers() {
    if (activeSurvey.value?.questions) {
      for (const q of activeSurvey.value.questions) {
        answers.value[q.id] = q.type === 'checkbox_group' ? [] : '';
      }
    }
  }

  function formatDate(date?: string): string {
    if (!date) return 'desconocido';
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function hasCondition(q: Question): boolean {
    return !!q.visible_if;
  }

  function isQuestionVisible(q: Question): boolean {
    const cond = q.visible_if;
    if (!cond?.question_id) return true;

    const answer = answers.value[cond.question_id];
    const operator = cond.operator || 'equals';
    const expected = cond.value;

    const toArray = (val: any): string[] =>
      Array.isArray(val) ? val.map(String) : val != null ? [String(val)] : [];

    const answerArray = toArray(answer);
    const expectedArray = toArray(expected);

    switch (operator) {
      case 'equals': return answerArray.join(',') === expectedArray.join(',');
      case 'not_equals': return answerArray.join(',') !== expectedArray.join(',');
      case 'in': return answerArray.some(a => expectedArray.includes(a));
      case 'not_in': return !answerArray.some(a => expectedArray.includes(a));
      default: return true;
    }
  }

  function isChecked(qid: string, opt: string) {
    return answers.value[qid]?.includes(opt);
  }

  function handleCheckboxChange(qid: string, opt: string) {
    const current = answers.value[qid] || [];
    if (!current.includes(opt)) {
      answers.value[qid] = [...current, opt];
    } else {
      answers.value[qid] = current.filter((o: string) => o !== opt);
    }
  }

  function handleLogoError() {
    logoLoadFailed.value = true;
    message.value = 'No se pudo cargar el logo. El formulario sigue disponible.';
  }

  async function fetchSurvey() {
    loading.value = true;
    error.value = null;
    logoLoadFailed.value = false;

    const surveyId = route.params.id as string;

    try {
      const { data } = await axios.get(
        `http://localhost:8000/api/survey_api/surveys/public/${surveyId}`
      );
      console.log('Backend response for /public/{id}:', JSON.stringify(data, null, 2));

      localSurvey.value = {
        id: data._id,
        title: data.title,
        description: data.description,
        status: data.status || 'created',
        start_date: data.start_date,
        end_date: data.end_date,
        logo_file_id: data.logo_file_id || null,
        logo_url: data.logo_file_id
          ? `http://localhost:8000/api/survey_api/surveys/files/${data.logo_file_id}`
          : null,
        primary_color: data.primary_color,
        secondary_color: data.secondary_color,
        font_family: data.font_family,
        questions: data.questions?.map((q: any) => ({
          ...q,
          id: q._id,
        })) || []
      };

      console.log('Mapped localSurvey:', JSON.stringify(localSurvey.value, null, 2));
      if (localSurvey.value.logo_file_id) {
        console.log('Generated logo URL:', localSurvey.value.logo_url);
      } else {
        console.warn('No logo_file_id in response');
      }

      if (localSurvey.value.status === 'published') {
        initAnswers();
      } else {
        error.value = localSurvey.value.status === 'created'
          ? `Esta encuesta no está disponible aún. Abre el ${formatDate(localSurvey.value.start_date)}.`
          : `Esta encuesta ha finalizado. Cerró el ${formatDate(localSurvey.value.end_date)}.`;
      }
    } catch (err: any) {
      console.error('Error al cargar la encuesta pública:', err);
      error.value = err.response?.data?.detail || 'No se pudo cargar la encuesta.';
    } finally {
      loading.value = false;
    }
  }

  async function submitResponses() {
    const surveyId = activeSurvey.value?.id;
    if (!surveyId) {
      message.value = 'Encuesta no cargada.';
      return;
    }

    if (!responderEmail.value) {
      message.value = 'El correo electrónico es obligatorio.';
      return;
    }

    for (const q of visibleQuestions.value) {
      if (q.is_required && !answers.value[q.id]) {
        message.value = `La pregunta "${q.text}" es obligatoria.`;
        return;
      }
    }

    try {
      const payload = {
        responder_email: responderEmail.value,
        ...Object.fromEntries(
          Object.entries(answers.value).filter(([key]) =>
            visibleQuestions.value.some(q => q.id === key)
          )
        )
      };

      await axios.post(
        `http://localhost:8000/api/survey_api/surveys/${surveyId}/responses`,
        payload
      );

      message.value = '¡Respuestas enviadas correctamente!';
      success.value = true;

      setTimeout(() => {
        answers.value = {};
        responderEmail.value = '';
        success.value = false;
        message.value = '';
      }, 3000);
    } catch (err: any) {
      console.error('Error al enviar respuestas:', err);
      message.value = err.response?.data?.detail || 'No se pudieron enviar las respuestas.';
    }
  }

  return {
    activeSurvey,
    answers,
    responderEmail,
    message,
    success,
    loading,
    error,
    logoLoadFailed,
    visibleQuestions,
    surveyStyle,
    fetchSurvey,
    initAnswers,
    formatDate,
    handleCheckboxChange,
    isChecked,
    hasCondition,
    isQuestionVisible,
    handleLogoError,
    submitResponses
  };
}