import { ref, reactive, computed, watch, Ref } from 'vue';
import axios from 'axios';

interface Question {
  _id?: string;
  type: 'text_input' | 'multiple_choice' | 'satisfaction_scale' | 'number_input' | 'checkbox_group';
  text: string;
  options?: string[];
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
}

export function useSurveyEditor(surveyToEdit: Ref<any> | null = null, emit: Function) {
  const resetForm = (): SurveyForm => ({
    _id: null,
    title: '',
    description: '',
    questions: [],
    status: 'created',
    is_public: false,
  });

  const form = reactive<SurveyForm>(resetForm());
  const message = ref('');
  const success = ref(false);
  const backendUrl = 'http://127.0.0.1:8000/api/survey_api/surveys/';
  const token = localStorage.getItem('token');

  const isEditing = computed(() => !!form._id);

  if (surveyToEdit) {
    watch(
      surveyToEdit,
      (newVal) => {
        Object.assign(form, newVal ? JSON.parse(JSON.stringify(newVal)) : resetForm());
      },
      { immediate: true }
    );
  }

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const addQuestion = () => {
    const tempId = 'temp_' + Date.now() + Math.random().toString(36).substring(2, 10);
    form.questions.push({
      _id: tempId,
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
    if (!form.questions[qIndex].options) {
      form.questions[qIndex].options = [];
    }
    form.questions[qIndex].options!.push('');
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    form.questions[qIndex].options!.splice(oIndex, 1);
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

    const payload = JSON.parse(JSON.stringify(form));

    if ('_id' in payload) delete payload._id;

    payload.questions.forEach((q: Question) => {
      if (typeof q._id === 'string' && q._id.startsWith('temp_')) {
        delete q._id;
      }
      if (q.type !== 'multiple_choice' && q.type !== 'checkbox_group') {
        delete q.options;
      }

      // Limpiar lógica si está incompleta
      if (q.visible_if && (!q.visible_if.question_id || q.visible_if.value === '')) {
        delete q.visible_if;
      }
    });

    try {
      let response;
      if (isEditing.value) {
        response = await axios.put(`${backendUrl}${form._id}`, payload, getAuthHeaders());
        message.value = 'Encuesta actualizada correctamente.';
      } else {
        response = await axios.post(backendUrl, payload, getAuthHeaders());
        message.value = 'Encuesta creada correctamente.';
      }

      success.value = true;
      Object.assign(form, resetForm());
      emit('saved', response.data);
    } catch (err: any) {
      console.error('Error al guardar encuesta:', err);
      message.value = err.response?.data?.detail || 'Error al guardar la encuesta.';
      success.value = false;
    }
  };

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
  };
}
