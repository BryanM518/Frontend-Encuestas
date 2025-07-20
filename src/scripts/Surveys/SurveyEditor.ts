import { ref, reactive, computed, watch, Ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter, useRoute } from 'vue-router';

interface Question {
  _id?: string;
  tempId?: string;
  type: 'text_input' | 'multiple_choice' | 'satisfaction_scale' | 'number_input' | 'checkbox_group';
  text: string;
  options: string[];
  is_required: boolean;
  visible_if?: {
    question_id: string;
    operator: string;
    value: string;
  } | null;
}

interface SurveyForm {
  _id: string | null;
  title: string;
  description: string;
  questions: Question[];
  status: string;
  is_public: boolean;
  start_date: string | null;
  end_date: string | null;
  logo_file_id: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  font_family: string | null;
}

export function useSurveyEditor(emit: Function) {
  const router = useRouter();
  const route = useRoute();
  const surveyId = computed(() => route.params.id as string | undefined);
  const resetForm = (): SurveyForm => ({
    _id: null,
    title: '',
    description: '',
    questions: [],
    status: 'created',
    is_public: false,
    start_date: null,
    end_date: null,
    logo_file_id: null,
    primary_color: null,
    secondary_color: null,
    font_family: null
  });

  const form = reactive<SurveyForm>(resetForm());
  const message = ref('');
  const success = ref(false);
  const logoError = ref<string | null>(null);
  const logoPreviewFailed = ref(false);
  const backendUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/survey_api/surveys/`;
  const uploadUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/survey_api/surveys/upload-logo`;
  const token = localStorage.getItem('token');
  const isEditing = computed(() => !!form._id);

  const surveyVersions = ref<Array<{ _id: string; version: number }>>([]);
  const versionsLoading = ref(false);
  const versionsError = ref('');
  const selectedVersionId = ref<string>('');

  const formatDateForInput = (dateString: string | null): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const tzOffset = date.getTimezoneOffset() * 60000;
      const localISOTime = new Date(date.getTime() - tzOffset).toISOString();
      return localISOTime.slice(0, 16);
    } catch {
      return '';
    }
  };

  const getAuthHeaders = (contentType: string = 'application/json') => ({
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': contentType
    },
  });

  const loadSurvey = async (id: string) => {
    try {
      console.log('Cargando encuesta con ID:', id);
      const response = await axios.get(
        `${backendUrl}${id}`,
        getAuthHeaders()
      );
      console.log('Datos de la encuesta:', response.data);
      const surveyData = response.data;

      const questionsProcessed = (surveyData.questions || []).map((q: any) => ({
        ...q,
        options: q.options || [],
        tempId: q._id?.startsWith('temp_') ? q._id : undefined
      })) as Question[];

      Object.assign(form, {
        ...surveyData,
        start_date: surveyData.start_date ? formatDateForInput(surveyData.start_date) : null,
        end_date: surveyData.end_date ? formatDateForInput(surveyData.end_date) : null,
        logo_file_id: surveyData.logo_file_id || null,
        primary_color: surveyData.primary_color || null,
        secondary_color: surveyData.secondary_color || null,
        font_family: surveyData.font_family || null,
        questions: questionsProcessed
      });
      selectedVersionId.value = id;
    } catch (err: any) {
      console.error('Error al cargar la encuesta:', err.response?.data || err.message);
      versionsError.value = 'Error al cargar la encuesta.';
    }
  };

  const loadSurveyVersions = async (mainSurveyId: string) => {
    if (!mainSurveyId) return;
    try {
      versionsLoading.value = true;
      console.log('Cargando versiones para surveyId:', mainSurveyId);
      const { data } = await axios.get(
        `${backendUrl}${mainSurveyId}/versions`,
        getAuthHeaders()
      );
      console.log('Versiones recibidas:', data);
      surveyVersions.value = data;
    } catch (err: any) {
      console.error('Error al cargar versiones:', err.response?.data || err.message);
      versionsError.value = 'No se pudieron cargar las versiones.';
    } finally {
      versionsLoading.value = false;
    }
  };

  watch(surveyId, async (newId) => {
    if (newId) {
      await loadSurvey(newId);
      await loadSurveyVersions(newId);
    } else {
      Object.assign(form, resetForm());
      surveyVersions.value = [];
      selectedVersionId.value = '';
    }
  }, { immediate: true });

  const handleLogoUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      logoError.value = 'No se seleccionó ningún archivo.';
      return;
    }

    const file = input.files[0];
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      logoError.value = 'Solo se permiten archivos PNG o JPEG.';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      logoError.value = 'El archivo no debe superar los 2MB.';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    if (isEditing.value && form._id) {
      formData.append('survey_id', form._id);
    }

    try {
      const response = await axios.post(uploadUrl, formData, getAuthHeaders('multipart/form-data'));
      form.logo_file_id = response.data.file_id;
      logoError.value = null;
      logoPreviewFailed.value = false;
      console.log('Logo file_id:', form.logo_file_id);
    } catch (err: any) {
      console.error('Error uploading logo:', err);
      logoError.value = err.response?.data?.detail || 'Error al subir el logo. Verifica la conexión o intenta de nuevo.';
      form.logo_file_id = null;
      logoPreviewFailed.value = true;
    }
  };

  const addQuestion = () => {
    const tempId = 'temp_' + Date.now() + Math.random().toString(36).substring(2, 10);
    form.questions.push({
      tempId,
      type: 'text_input',
      text: '',
      options: [],
      is_required: false,
    });
  };

  const removeQuestion = (index: number) => {
    form.questions.splice(index, 1);
  };

  const addOption = (qIndex: number) => {
    form.questions[qIndex].options.push('');
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    form.questions[qIndex].options.splice(oIndex, 1);
  };

  const addLogic = (qIndex: number) => {
    form.questions[qIndex].visible_if = {
      question_id: '',
      operator: 'equals',
      value: '',
    };
  };

  const removeLogic = (qIndex: number) => {
    form.questions[qIndex].visible_if = null;
  };

  const handleSubmit = async () => {
    message.value = '';
    success.value = false;

    if (!token) {
      message.value = 'Debes iniciar sesión para guardar encuestas.';
      return;
    }

    if (dateError.value) {
      message.value = dateError.value;
      success.value = false;
      return;
    }

    const payload = JSON.parse(JSON.stringify(form)) as SurveyForm;
    payload.questions = payload.questions.map(q => {
      const newQ = { ...q };
      if (newQ.tempId && !newQ._id) {
        delete newQ.tempId;
      }
      return newQ;
    });

    if (form.logo_file_id) {
      payload.logo_file_id = form.logo_file_id;
    }

    try {
      let response;
      console.log('Payload enviado:', payload);

      if (isEditing.value) {
        console.log('Enviando PUT a:', `${backendUrl}${form._id}`);
        response = await axios.put(
          `${backendUrl}${form._id}`,
          payload,
          getAuthHeaders()
        );
      } else {
        console.log('Enviando POST a:', backendUrl);
        response = await axios.post(
          backendUrl,
          payload,
          getAuthHeaders()
        );
      }

      const savedSurvey = response.data;
      message.value = isEditing.value
        ? "Encuesta actualizada exitosamente"
        : "Encuesta creada exitosamente";
      success.value = true;

      Object.assign(form, {
        ...savedSurvey,
        start_date: savedSurvey.start_date ? formatDateForInput(savedSurvey.start_date) : null,
        end_date: savedSurvey.end_date ? formatDateForInput(savedSurvey.end_date) : null,
        logo_file_id: savedSurvey.logo_file_id || null,
        primary_color: savedSurvey.primary_color || null,
        secondary_color: savedSurvey.secondary_color || null,
        font_family: savedSurvey.font_family || null,
        questions: (savedSurvey.questions || []).map((q: any) => {
          const originalQuestion = form.questions.find(oq => oq.text === q.text && oq.type === q.type);
          return {
            ...q,
            options: q.options || [],
            tempId: originalQuestion?.tempId
          };
        }) as Question[]
      });

      if (response.data._id) {
        router.push(`/surveys/${response.data._id}/edit`);
      }
      emit('saved', savedSurvey);
    } catch (err: any) {
      console.error("Error al guardar encuesta:", err);
      console.log('Response data:', err.response?.data);
      message.value = err.response?.data?.detail || `Error al guardar encuesta: ${err.message}`;
      success.value = false;
    }
  };

  const dateError = computed(() => {
    if (form.start_date && form.end_date && new Date(form.start_date) > new Date(form.end_date)) {
      return "La fecha de inicio debe ser anterior a la fecha de fin.";
    }
    return "";
  });

  watch(
    () => [form.start_date, form.end_date],
    () => {
      const now = new Date();
      if (form.end_date && new Date(form.end_date) < now) {
        form.status = "closed";
      } else if (form.start_date && new Date(form.start_date) <= now) {
        form.status = "published";
      } else {
        form.status = "created";
      }
    },
    { immediate: true }
  );

  const hasTempReference = (question: any) => {
    if (!question.visible_if) return false;
    return question.visible_if.question_id?.startsWith('temp_');
  };

  const getPreviousQuestions = (currentIndex: number) => {
    return form.questions.slice(0, currentIndex);
  };

  const getQuestionKey = (question: any, index: number) => {
    return question.tempId || question._id || `question-${index}`;
  };

  const getQuestionText = (question: any, index: number) => {
    return question.text || `Pregunta ${index + 1} (sin texto)`;
  };

  const handleLogoPreviewError = () => {
    logoPreviewFailed.value = true;
    form.logo_file_id = null;
    logoError.value = 'No se pudo cargar la vista previa del logo.';
  };

  const handleVersionChange = () => {
    if (selectedVersionId.value && selectedVersionId.value !== form._id) {
      console.log('Versión seleccionada:', selectedVersionId.value);
      router.push(`/surveys/${selectedVersionId.value}/edit`).catch(err => {
        console.error('Error en router.push:', err);
      });
    }
  };

  const capitalize = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const previewStyle = computed(() => ({
    '--primary-color': form.primary_color || '#3498db',
    '--secondary-color': form.secondary_color || '#2ecc71',
    fontFamily: form.font_family || 'inherit'
  }));

  const logoPreviewUrl = computed(() => {
    return form.logo_file_id
      ? `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/survey_api/surveys/files/${form.logo_file_id}`
      : null;
  });

  return {
    form,
    message,
    success,
    isEditing,
    addQuestion,
    removeQuestion,
    addOption,
    removeOption,
    handleSubmit,
    addLogic,
    removeLogic,
    handleLogoUpload,
    logoError,
    logoPreviewFailed,
    dateError,
    surveyVersions,
    versionsLoading,
    versionsError,
    selectedVersionId,
    handleVersionChange,
    capitalize,
    previewStyle,
    hasTempReference,
    getPreviousQuestions,
    getQuestionKey,
    getQuestionText,
    handleLogoPreviewError,
    logoPreviewUrl,
  };
}