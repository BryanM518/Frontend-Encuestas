import { ref, reactive, computed, watch, Ref } from 'vue';
import axios from 'axios';

// Updated Question interface to include tempId directly
interface Question {
  _id?: string;
  tempId?: string; // Add tempId here
  type: 'text_input' | 'multiple_choice' | 'satisfaction_scale' | 'number_input' | 'checkbox_group';
  text: string;
  options: string[]; // Make options non-optional, always an array
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
  questions: Question[]; // Now all questions in the form will conform to this type
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
        if (newVal) {
          // Ensure options are arrays and tempId is preserved/added
          const questionsProcessed = newVal.questions.map((q: any) => ({
            ...q,
            options: q.options || [], // Ensure options is an array
            tempId: q._id?.startsWith('temp_') ? q._id : undefined // Preserve tempId if it came from server this way
          })) as Question[]; // Cast to Question[]
          Object.assign(form, { ...newVal, questions: questionsProcessed });
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
      tempId,
      type: 'text_input',
      text: '',
      options: [], // Always initialize as an empty array
      is_required: false,
    });
  };

  const removeQuestion = (index: number) => {
    form.questions.splice(index, 1);
  };

  const addOption = (qIndex: number) => {
    // 'options' is now guaranteed to be an array due to interface change and initialization
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

    // Step 1: Prepare initial payload
    const payload = JSON.parse(JSON.stringify(form)) as SurveyForm;
    const tempIdMap = new Map<string, string>();

    // Process questions with temporary IDs
    payload.questions = payload.questions.map((q: Question) => {
      if (q.tempId) {
        // Save mapping tempId -> future real ID
        tempIdMap.set(q.tempId, q.tempId);
        const newQ = { ...q }; // Create a copy to avoid mutating the reactive form directly
        delete newQ.tempId; // Remove tempId for the backend
        
        // If it's a new question (temp _id on backend), delete it
        if (newQ._id?.startsWith('temp_')) {
          delete newQ._id;
        }
        return newQ;
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

      // Step 2: Update references in conditions (if tempIds were present)
      if (tempIdMap.size > 0) {
        const updatedQuestions = savedSurvey.questions.map((q: any, index: number) => {
          const originalQ = form.questions[index]; // Use the original question from the form

          // Update map with real ID from the saved survey response
          if (originalQ.tempId) {
            tempIdMap.set(originalQ.tempId, q._id);
          }

          // Update conditions if they refer to a tempId that now has a real ID
          if (q.visible_if?.question_id && tempIdMap.has(q.visible_if.question_id)) {
            q.visible_if.question_id = tempIdMap.get(q.visible_if.question_id);
          }
          
          return q;
        });

        // Step 3: Save survey with updated references
        const updatePayload = {
          ...savedSurvey,
          questions: updatedQuestions
        };

        await axios.put(
          `${backendUrl}${savedSurvey._id}`,
          updatePayload,
          getAuthHeaders()
        );

        // Update local form with final data and preserve tempIds if they existed
        Object.assign(form, {
          ...savedSurvey,
          questions: updatedQuestions.map((q: any, index: number) => ({
            ...q,
            tempId: form.questions[index]?.tempId // Preserve original tempId if it existed in the form
          })) as Question[]
        });
      } else {
        // No temporary IDs - update directly, ensuring options are arrays
        Object.assign(form, {
          ...savedSurvey,
          questions: savedSurvey.questions.map((q: any) => ({
            ...q,
            options: q.options || [],
            tempId: (form.questions.find(fq => fq._id === q._id) || {}).tempId // Maintain tempId if it existed
          })) as Question[]
        });
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