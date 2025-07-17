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
  questions: (Question | QuestionWithTempId)[];
  status: string;
  is_public: boolean;
}

interface QuestionWithTempId extends Question {
  tempId?: string;
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
        if (newVal) {
          // Preservar IDs temporales si existen
          const questionsWithTempIds = newVal.questions.map((q: any) => ({
            ...q,
            tempId: q._id?.startsWith('temp_') ? q._id : undefined
          }));
          Object.assign(form, { ...newVal, questions: questionsWithTempIds });
        } else {
          Object.assign(form, resetForm());
        }
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
      tempId, // Usar tempId en lugar de _id
      type: 'text_input',
      text: '',
      options: [],
      is_required: false,
    } as QuestionWithTempId);
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

    // Paso 1: Preparar payload inicial
    const payload = JSON.parse(JSON.stringify(form)) as SurveyForm;
    const tempIdMap = new Map<string, string>();
    
    // Procesar preguntas con IDs temporales
    payload.questions = payload.questions.map((q: any) => {
      if (q.tempId) {
        // Guardar mapeo temporal → futuro ID real
        tempIdMap.set(q.tempId, q.tempId);
        delete q.tempId;
        
        // Si es nueva pregunta, eliminar _id temporal
        if (q._id?.startsWith('temp_')) delete q._id;
      }
      return q;
    });

    try {
      let response;
      if (isEditing.value) {
        response = await axios.put(`${backendUrl}${form._id}`, payload, getAuthHeaders());
      } else {
        response = await axios.post(backendUrl, payload, getAuthHeaders());
      }

      const savedSurvey = response.data;
      message.value = isEditing.value 
        ? 'Encuesta actualizada correctamente.' 
        : 'Encuesta creada correctamente.';
      
      success.value = true;

      // Paso 2: Actualizar referencias en condiciones
      if (tempIdMap.size > 0) {
        const updatedQuestions = savedSurvey.questions.map((q: any, index: number) => {
          const originalQ = form.questions[index] as QuestionWithTempId;
          
          // Actualizar mapa con ID real
          if (originalQ.tempId) {
            tempIdMap.set(originalQ.tempId, q._id);
          }
          
          // Actualizar condiciones si existen
          if (q.visible_if?.question_id && tempIdMap.has(q.visible_if.question_id)) {
            q.visible_if.question_id = tempIdMap.get(q.visible_if.question_id);
          }
          
          return q;
        });

        // Paso 3: Guardar encuesta con referencias actualizadas
        const updatePayload = {
          ...savedSurvey,
          questions: updatedQuestions
        };
        
        await axios.put(
          `${backendUrl}${savedSurvey._id}`, 
          updatePayload, 
          getAuthHeaders()
        );

        // Actualizar formulario local con datos finales
        Object.assign(form, {
          ...savedSurvey,
          questions: updatedQuestions.map((q: any, index: number) => ({
            ...q,
            tempId: (form.questions[index] as QuestionWithTempId)?.tempId
          }))
        });
      } else {
        // Sin IDs temporales - actualizar directamente
        Object.assign(form, savedSurvey);
      }

      emit('saved', savedSurvey);
      
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