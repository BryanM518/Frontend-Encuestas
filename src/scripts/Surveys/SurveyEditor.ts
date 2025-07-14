// src/composables/useSurveyEditor.ts
import { ref, reactive, computed, watch, Ref } from 'vue';
import axios from 'axios';

interface Question {
  _id?: string; // Optional for new questions
  type: 'text_input' | 'multiple_choice' | 'satisfaction_scale' | 'number_input' | 'checkbox_group';
  text: string;
  options?: string[];
  is_required: boolean;
}

interface SurveyForm {
  _id: string | null;
  title: string;
  description: string;
  questions: Question[];
  status: string;
}

export function useSurveyEditor(surveyToEdit: Ref<any> | null = null, emit: Function) {
  const resetForm = (): SurveyForm => ({
    _id: null,
    title: '',
    description: '',
    questions: [],
    status: 'created',
  });

  const form = reactive<SurveyForm>(resetForm());
  const message = ref('');
  const success = ref(false);
  const backendUrl = 'http://127.0.0.1:8000/api/v1/surveys/';
  const token = localStorage.getItem('token');

  const isEditing = computed(() => !!form._id);

  // Watch for changes in surveyToEdit prop
  if (surveyToEdit) {
    watch(
      surveyToEdit,
      (newVal) => {
        // Deep copy the object to avoid direct mutation of props
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

  const handleSubmit = async () => {
    message.value = '';
    success.value = false;

    if (!token) {
      message.value = 'Debes iniciar sesión para guardar encuestas.';
      return;
    }

    // Create a deep copy of the form data to manipulate for the payload
    const payload = JSON.parse(JSON.stringify(form));

    // Remove _id from the top level if it exists, as it's for API identification, not part of the payload creation for new surveys
    if ('_id' in payload) delete payload._id;

    payload.questions.forEach((q: Question) => {
      // Remove temporary IDs from new questions before sending to backend
      if (typeof q._id === 'string' && q._id.startsWith('temp_')) {
        delete q._id;
      }
      // Remove options array if the question type doesn't use it
      if (q.type !== 'multiple_choice' && q.type !== 'checkbox_group') {
        delete q.options;
      } else if ((q.type === 'multiple_choice' || q.type === 'checkbox_group') && (!q.options || q.options.length === 0)) {
        // Ensure options is an empty array if required but no options are provided
        q.options = [];
      }
    });

    try {
      let response;
      if (isEditing.value) {
        // For updating an existing survey, include the _id in the URL
        response = await axios.put(`${backendUrl}${form._id}`, payload, getAuthHeaders());
        message.value = 'Encuesta actualizada correctamente.';
      } else {
        // For creating a new survey
        response = await axios.post(backendUrl, payload, getAuthHeaders());
        message.value = 'Encuesta creada correctamente.';
      }

      success.value = true;
      Object.assign(form, resetForm()); // Reset form
      emit('saved', response.data); // Notify parent component
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
  };
}