import { ref, reactive, computed, watch, Ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

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
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  font_family: string | null;
}

export function useSurveyEditor(surveyToEdit: Ref<any> | null = null, emit: Function) {
  const router = useRouter();
  const resetForm = (): SurveyForm => ({
    _id: null,
    title: '',
    description: '',
    questions: [],
    status: 'created',
    is_public: false,
    start_date: null,
    end_date: null,
    logo_url: null,
    primary_color: null,
    secondary_color: null,
    font_family: null
  });

  const form = reactive<SurveyForm>(resetForm());
  const message = ref('');
  const success = ref(false);
  const logoError = ref<string | null>(null);
  const backendUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/survey_api/surveys/`;
  const uploadUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/survey_api/surveys/upload-logo`;
  const token = localStorage.getItem('token');
  const isEditing = computed(() => !!form._id);

  if (surveyToEdit) {
    watch(
      surveyToEdit,
      (newVal) => {
        if (newVal) {
          const questionsProcessed = (newVal.questions || []).map((q: any) => ({
            ...q,
            options: q.options || [],
            tempId: q._id?.startsWith('temp_') ? q._id : undefined
          })) as Question[];
          Object.assign(form, {
            ...newVal,
            start_date: newVal.start_date ? new Date(newVal.start_date).toISOString().slice(0, 16) : null,
            end_date: newVal.end_date ? new Date(newVal.end_date).toISOString().slice(0, 16) : null,
            logo_url: newVal.logo_url || null,
            primary_color: newVal.primary_color || null,
            secondary_color: newVal.secondary_color || null,
            font_family: newVal.font_family || null,
            questions: questionsProcessed
          });
        } else {
          Object.assign(form, resetForm());
        }
      },
      { immediate: true }
    );
  }

  const getAuthHeaders = (contentType: string = 'application/json') => ({
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': contentType
    },
  });

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

    try {
      const response = await axios.post(uploadUrl, formData, getAuthHeaders('multipart/form-data'));
      form.logo_url = response.data.logo_url;
      logoError.value = null;
    } catch (err: any) {
      console.error('Error uploading logo:', err);
      logoError.value = err.response?.data?.detail || 'Error al subir el logo. Verifica la conexión o intenta de nuevo.';
      form.logo_url = null;
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

  // const handleSubmit = async () => {
  //   message.value = '';
  //   success.value = false;

  //   if (!token) {
  //     message.value = 'Debes iniciar sesión para guardar encuestas.';
  //     return;
  //   }

  //   if (form.start_date && form.end_date && new Date(form.start_date) > new Date(form.end_date)) {
  //     message.value = 'La fecha de inicio debe ser anterior a la fecha de fin.';
  //     success.value = false;
  //     return;
  //   }

  //   const payload = JSON.parse(JSON.stringify(form)) as SurveyForm;
  //   const tempIdMap = new Map<string, string>();

  //   payload.questions = payload.questions.map((q: Question) => {
  //     if (q.tempId) {
  //       tempIdMap.set(q.tempId, q.tempId);
  //       const newQ = { ...q };
  //       delete newQ.tempId;
  //       if (newQ._id?.startsWith('temp_')) {
  //         delete newQ._id;
  //       }
  //       return newQ;
  //     }
  //     return q;
  //   });

  //   try {
  //     let response;
  //     if (isEditing.value) {
  //       response = await axios.put(`${backendUrl}${form._id}`, payload, getAuthHeaders());
  //       // Redirigir a la nueva versión
  //       router.push(`/surveys/${response.data._id}/edit`);
  //     } else {
  //       response = await axios.post(backendUrl, payload, getAuthHeaders());
  //     }

  //     const savedSurvey = response.data;
  //     message.value = isEditing.value
  //       ? 'Nueva versión creada correctamente.'
  //       : 'Encuesta creada correctamente.';
      
  //     success.value = true;

  //     if (tempIdMap.size > 0) {
  //       const updatedQuestions = savedSurvey.questions.map((q: any, index: number) => {
  //         const originalQ = form.questions[index];
  //         if (originalQ.tempId) {
  //           tempIdMap.set(originalQ.tempId, q._id);
  //         }
  //         if (q.visible_if?.question_id && tempIdMap.has(q.visible_if.question_id)) {
  //           q.visible_if.question_id = tempIdMap.get(q.visible_if.question_id);
  //         }
  //         return q;
  //       });

  //       const updatePayload = {
  //         ...savedSurvey,
  //         questions: updatedQuestions
  //       };

  //       await axios.put(
  //         `${backendUrl}${savedSurvey._id}`,
  //         updatePayload,
  //         getAuthHeaders()
  //       );

  //       Object.assign(form, {
  //         ...savedSurvey,
  //         start_date: savedSurvey.start_date ? new Date(savedSurvey.start_date).toISOString().slice(0, 16) : null,
  //         end_date: savedSurvey.end_date ? new Date(savedSurvey.end_date).toISOString().slice(0, 16) : null,
  //         logo_url: savedSurvey.logo_url || null,
  //         primary_color: savedSurvey.primary_color || null,
  //         secondary_color: savedSurvey.secondary_color || null,
  //         font_family: savedSurvey.font_family || null,
  //         questions: updatedQuestions.map((q: any, index: number) => ({
  //           ...q,
  //           tempId: form.questions[index]?.tempId
  //         })) as Question[]
  //       });
  //     } else {
  //       Object.assign(form, {
  //         ...savedSurvey,
  //         start_date: savedSurvey.start_date ? new Date(savedSurvey.start_date).toISOString().slice(0, 16) : null,
  //         end_date: savedSurvey.end_date ? new Date(savedSurvey.end_date).toISOString().slice(0, 16) : null,
  //         logo_url: savedSurvey.logo_url || null,
  //         primary_color: savedSurvey.primary_color || null,
  //         secondary_color: savedSurvey.secondary_color || null,
  //         font_family: savedSurvey.font_family || null,
  //         questions: (savedSurvey.questions || []).map((q: any) => ({
  //           ...q,
  //           options: q.options || [],
  //           tempId: (form.questions.find(fq => fq._id === q._id) || {}).tempId
  //         })) as Question[]
  //       });
  //     }

  //     emit('saved', savedSurvey);

  //   } catch (err: any) {
  //     console.error('Error al guardar encuesta:', err);
  //     message.value = err.response?.data?.detail || 'Error al guardar la encuesta.';
  //     success.value = false;
  //   }
  // } ;

  const handleSubmit = async () => {
  try {
    const payload = { ...form };
    let response;
    console.log('Backend URL:', backendUrl); // ✅ Depuración
    console.log('Payload:', payload); // ✅ Depuración

    if (isEditing.value) {
      console.log('Enviando PUT a:', `${backendUrl}${form._id}`);
      response = await axios.put(
        `${backendUrl}${form._id}`,
        payload,
        getAuthHeaders()
      );
      router.push(`/surveys/${response.data._id}/edit`);
    } else {
      console.log('Enviando POST a:', backendUrl);
      response = await axios.post(
        backendUrl,
        payload,
        getAuthHeaders()
      );
      router.push(`/surveys/${response.data._id}/edit`);
    }

    message.value = isEditing.value
      ? "Encuesta actualizada exitosamente"
      : "Encuesta creada exitosamente";
    success.value = true;
  } catch (err: any) {
    console.error("Error al guardar encuesta:", err);
    console.log('Response data:', err.response?.data); // ✅ Depuración
    message.value = `Error al guardar encuesta: ${err.message}`;
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
    handleLogoUpload,
    logoError
  } ;
}