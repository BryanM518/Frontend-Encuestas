<template>
  <div class="survey-editor">
    <h2>{{ isEditing ? 'Editar Encuesta' : 'Crear Nueva Encuesta' }}</h2>

    <!-- ✅ Bloque para mostrar otras versiones de la encuesta como lista desplegable -->
    <div v-if="isEditing" class="survey-versions-block">
      <h3>📚 Versiones disponibles:</h3>
      <select
        v-model="selectedVersionId"
        @change="handleVersionChange"
        class="version-select"
      >
        <option value="" disabled>Seleccione una versión</option>
        <option
          v-for="version in surveyVersions"
          :key="version._id"
          :value="version._id"
          :disabled="version._id === form._id"
        >
          Versión {{ version.version }} {{ version._id === form._id ? '(Actual)' : '' }}
        </option>
      </select>
      <p v-if="versionsLoading">Cargando versiones...</p>
      <p v-if="versionsError" class="error-text">{{ versionsError }}</p>
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="survey-title">Título de la Encuesta *</label>
        <input
          id="survey-title"
          v-model="form.title"
          placeholder="Título de la Encuesta"
          required
        />
      </div>

      <div class="form-group">
        <label for="survey-description">Descripción</label>
        <textarea
          id="survey-description"
          v-model="form.description"
          placeholder="Descripción de la Encuesta"
          rows="3"
        ></textarea>
      </div>

      <div class="form-group">
        <label class="public-toggle">
          <input type="checkbox" v-model="form.is_public" />
          ¿Hacer pública esta encuesta?
        </label>
      </div>

      <div class="form-group">
        <label for="survey-start-date">Fecha de Apertura</label>
        <input
          id="survey-start-date"
          type="datetime-local"
          v-model="form.start_date"
        />
      </div>

      <div class="form-group">
        <label for="survey-end-date">Fecha de Cierre</label>
        <input
          id="survey-end-date"
          type="datetime-local"
          v-model="form.end_date"
        />
        <p v-if="dateError" class="error-text">{{ dateError }}</p>
      </div>

      <div class="form-group">
        <label>Estado de la Encuesta:</label>
        <span :class="['survey-status', form.status]">{{ capitalize(form.status) }}</span>
      </div>

      <h3>Personalización Visual</h3>
      <div class="customization-group">
        <div class="form-group">
          <label for="survey-logo">Logo (PNG o JPEG, máx. 2MB)</label>
          <input
            id="survey-logo"
            type="file"
            accept="image/png,image/jpeg"
            @change="handleLogoUpload"
          />
          <p v-if="logoError" class="error-text">{{ logoError }}</p>
          <img v-if="form.logo_url && !logoPreviewFailed" :src="form.logo_url" alt="Logo Preview" class="logo-preview" @error="handleLogoPreviewError" />
        </div>

        <div class="form-group">
          <label for="primary-color">Color Primario</label>
          <input
            id="primary-color"
            type="color"
            v-model="form.primary_color"
          />
        </div>

        <div class="form-group">
          <label for="secondary-color">Color Secundario</label>
          <input
            id="secondary-color"
            type="color"
            v-model="form.secondary_color"
          />
        </div>

        <div class="form-group">
          <label for="font-family">Tipografía</label>
          <select id="font-family" v-model="form.font_family">
            <option value="">Por defecto</option>
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Georgia">Georgia</option>
            <option value="Roboto">Roboto</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Lato">Lato</option>
            <option value="Montserrat">Montserrat</option>
          </select>
        </div>

        <div class="preview-container" :style="previewStyle">
          <h4>Vista Previa</h4>
          <div class="preview-content">
            <img v-if="form.logo_url && !logoPreviewFailed" :src="form.logo_url" alt="Logo Preview" class="preview-logo" @error="handleLogoPreviewError" />
            <p :style="{ fontFamily: form.font_family || 'inherit' }">
              Ejemplo de texto con la tipografía seleccionada.
            </p>
            <button :style="{ backgroundColor: form.primary_color || '#3498db', color: '#fff' }">
              Botón Primario
            </button>
            <button :style="{ backgroundColor: form.secondary_color || '#2ecc71', color: '#fff' }">
              Botón Secundario
            </button>
          </div>
        </div>
      </div>

      <h3>Preguntas</h3>
      
      <div
        v-for="(question, qIndex) in form.questions"
        :key="getQuestionKey(question, qIndex)"
        class="question-card"
      >
        <div class="question-header">
          <p><strong>Pregunta {{ qIndex + 1 }}</strong></p>
          <button
            type="button"
            class="delete-btn"
            @click="removeQuestion(qIndex)"
          >
            Eliminar Pregunta
          </button>
        </div>

        <div class="form-group">
          <label>Tipo:</label>
          <select v-model="question.type">
            <option value="text_input">Texto Libre</option>
            <option value="multiple_choice">Opción Múltiple</option>
            <option value="satisfaction_scale">Escala de Satisfacción</option>
            <option value="number_input">Número</option>
            <option value="checkbox_group">Casillas de Verificación</option>
          </select>
        </div>

        <div class="form-group">
          <label>Texto de la pregunta *</label>
          <input v-model="question.text" type="text" required />
        </div>

        <div class="form-group">
          <label>
            <input type="checkbox" v-model="question.is_required" />
            ¿Es requerida?
          </label>
        </div>

        <div
          v-if="question.type === 'multiple_choice' || question.type === 'checkbox_group'"
          class="options-group"
        >
          <h4>Opciones:</h4>
          <div
            v-for="(option, oIndex) in question.options"
            :key="oIndex"
            class="option-item"
          >
            <input
              v-model="question.options[oIndex]"
              type="text"
              placeholder="Opción"
              required
            />
            <button
              type="button"
              class="small-btn"
              @click="removeOption(qIndex, oIndex)"
            >
              Eliminar
            </button>
          </div>
          <button
            type="button"
            class="add-btn"
            @click="addOption(qIndex)"
          >
            Agregar Opción
          </button>
        </div>

        <div v-if="question.visible_if" class="logic-group">
          <h4>Lógica Condicional:</h4>
          <div class="logic-controls">
            <div class="logic-row">
              <span>Mostrar esta pregunta solo si</span>
              <select v-model="question.visible_if.question_id">
                <option disabled value="">Seleccione una pregunta anterior</option>
                <option
                  v-for="(prev, pIndex) in getPreviousQuestions(qIndex)"
                  :key="prev.tempId || prev._id"
                  :value="prev.tempId || prev._id"
                >
                  {{ getQuestionText(prev, pIndex) }}
                </option>
              </select>
            </div>

            <div class="logic-row">
              <select v-model="question.visible_if.operator">
                <option value="equals">es igual a</option>
                <option value="not_equals">no es igual a</option>
                <option value="in">está en</option>
                <option value="not_in">no está en</option>
              </select>
              <input
                v-model="question.visible_if.value"
                placeholder="Valor esperado"
              />
            </div>
          </div>

          <button
            type="button"
            class="remove-logic-btn"
            @click="removeLogic(qIndex)"
          >
            ❌ Eliminar condición
          </button>
          
          <div v-if="hasTempReference(question)" class="temp-ref-warning">
            ⚠ Referencia a pregunta no guardada - guarda la encuesta para establecer la referencia permanente
          </div>
        </div>
        <div v-else class="add-logic">
          <button
            type="button"
            class="add-logic-btn"
            @click="addLogic(qIndex)"
          >
            ➕ Añadir lógica condicional
          </button>
        </div>
      </div>

      <div class="actions">
        <button type="button" class="add-btn" @click="addQuestion">
          Agregar Pregunta
        </button>
        <button type="submit" class="submit-btn">
          {{ isEditing ? 'Crear Nueva Versión' : 'Crear Encuesta' }}
        </button>
      </div>
    </form>

    <div v-if="message" :class="['message', success ? 'success' : 'error']">
      {{ message }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted, toRefs } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useSurveyEditor } from '../../scripts/Surveys/SurveyEditor';

export default defineComponent({
  name: 'SurveyEditor',
  setup(_, { emit }) {
    const route = useRoute();
    const router = useRouter();
    const surveyId = route.params.id as string | undefined;

    const surveyToEdit = ref<any>(null);
    const logoPreviewFailed = ref(false);
    const selectedVersionId = ref<string>(''); // Nueva ref para el select

    // ✅ Refs para versiones anteriores
    const surveyVersions = ref<Array<{ _id: string; version: number }>>([]);
    const versionsLoading = ref(false);
    const versionsError = ref('');

    const formatDateForInput = (dateString: string | null): string => {
      if (!dateString) return '';
      
      try {
        const date = new Date(dateString);
        // Ajustar para la zona horaria local
        const tzOffset = date.getTimezoneOffset() * 60000; // offset en milisegundos
        const localISOTime = new Date(date.getTime() - tzOffset).toISOString();
        return localISOTime.slice(0, 16);
      } catch {
        return '';
      }
    };

    const loadSurveyVersions = async () => {
      if (!surveyId) return;
      try {
        versionsLoading.value = true;
        const token = localStorage.getItem('token');
        console.log('Cargando versiones para surveyId:', surveyId);
        console.log('Token usado:', token);
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/survey_api/surveys/${surveyId}/versions`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Versiones recibidas:', data);
        surveyVersions.value = data;
        // Establecer la versión actual como seleccionada
        if (surveyId && data.some((v: any) => v._id === surveyId)) {
          selectedVersionId.value = surveyId;
        }
      } catch (err: any) {
        console.error('Error al cargar versiones:', err.response?.data || err.message);
        versionsError.value = 'No se pudieron cargar las versiones.';
      } finally {
        versionsLoading.value = false;
      }
    };

    // ✅ Cargar la encuesta actual
    onMounted(async () => {
      if (surveyId) {
        try {
          console.log('Cargando encuesta con ID:', surveyId);
          const token = localStorage.getItem('token');
          console.log('Token usado:', token);
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/survey_api/surveys/${surveyId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log('Datos de la encuesta:', response.data);
          surveyToEdit.value = response.data;

          // Formatear fechas para los inputs
          // if (surveyToEdit.value.start_date) {
          //   surveyToEdit.value.start_date = formatDateForInput(surveyToEdit.value.start_date);
          // }
          // if (surveyToEdit.value.end_date) {
          //   surveyToEdit.value.end_date = formatDateForInput(surveyToEdit.value.end_date);
          // }

          // 🔄 Cargar versiones después
          await loadSurveyVersions();
        } catch (err: any) {
          console.error('Error al cargar la encuesta:', err.response?.data || err.message);
          versionsError.value = 'Error al cargar la encuesta.';
        }
      }
    });

    // ✅ Watcher para cambios en route.params.id
    watch(
      () => route.params.id,
      async (newId) => {
        if (newId && newId !== surveyId) {
          console.log('Cambio de ID detectado:', newId);
          try {
            const token = localStorage.getItem('token');
            console.log('Token usado para nueva encuesta:', token);
            const response = await axios.get(
              `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/survey_api/surveys/${newId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('Datos de la nueva encuesta:', response.data);
            surveyToEdit.value = response.data;

            // Formatear fechas para los inputs
            if (surveyToEdit.value.start_date) {
              surveyToEdit.value.start_date = formatDateForInput(surveyToEdit.value.start_date);
            }
            if (surveyToEdit.value.end_date) {
              surveyToEdit.value.end_date = formatDateForInput(surveyToEdit.value.end_date);
            }

            // Recargar versiones
            await loadSurveyVersions();
          } catch (err: any) {
            console.error('Error al cargar nueva encuesta:', err.response?.data || err.message);
            versionsError.value = 'Error al cargar la nueva encuesta.';
          }
        }
      },
      { immediate: true }
    );

    const {
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
    } = useSurveyEditor(surveyToEdit, emit);

    const dateError = computed(() => {
      if (form.start_date && form.end_date && new Date(form.start_date) > new Date(form.end_date)) {
        return "La fecha de inicio debe ser anterior a la fecha de fin";
      }
      return "";
    });

    const previewStyle = computed(() => ({
      '--primary-color': form.primary_color || '#3498db',
      '--secondary-color': form.secondary_color || '#2ecc71',
      fontFamily: form.font_family || 'inherit'
    }));

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
      form.logo_url = null;
      logoError.value = 'No se pudo cargar la vista previa del logo.';
    };

    const handleVersionClick = (versionId: string) => {
      console.log('Botón Ver clicado, version._id:', versionId);
      console.log('Ruta actual:', route.path);
      console.log('Ruta destino:', `/surveys/${versionId}/edit`);
      router.push(`/surveys/${versionId}/edit`).catch(err => {
        console.error('Error en router.push:', err);
      });
    };

    const handleVersionChange = () => {
      if (selectedVersionId.value && selectedVersionId.value !== form._id) {
        console.log('Versión seleccionada:', selectedVersionId.value);
        console.log('Ruta actual:', route.path);
        console.log('Ruta destino:', `/surveys/${selectedVersionId.value}/edit`);
        router.push(`/surveys/${selectedVersionId.value}/edit`).catch(err => {
          console.error('Error en router.push:', err);
        });
      }
    };

    const wrappedHandleSubmit = async (event: Event) => {
      console.log('Form submitted, event:', event);
      await handleSubmit();
    };

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

    const capitalize = (str: string) => {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
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
      handleSubmit: wrappedHandleSubmit,
      addLogic,
      removeLogic,
      handleLogoUpload,
      logoError,
      handleLogoPreviewError,
      previewStyle,
      hasTempReference,
      getPreviousQuestions,
      getQuestionKey,
      getQuestionText,
      capitalize,
      logoPreviewFailed,
      dateError,
      surveyVersions,
      versionsLoading,
      versionsError,
      handleVersionClick,
      selectedVersionId,
      handleVersionChange
    };
  }
});
</script>

<style scoped>
.survey-editor {
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: var(--bg-white);
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  color: var(--color3);
  margin-bottom: 2rem;
  font-size: 2.2rem;
  position: relative;
  padding-bottom: 1rem;
}

h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 150px;
  height: 4px;
  background: linear-gradient(to right, var(--color3), var(--color4));
  border-radius: 3px;
}

h3 {
  color: var(--color2);
  border-bottom: 2px solid var(--color5);
  padding-bottom: 0.8rem;
  margin: 2rem 0 1.5rem;
  font-size: 1.6rem;
}

h4 {
  color: var(--color2);
  margin: 1.5rem 0 1rem;
  font-size: 1.2rem;
}

.form-group {
  margin-bottom: 1.8rem;
}

label {
  display: block;
  margin-bottom: 0.7rem;
  font-weight: 600;
  color: var(--text-dark);
  font-size: 1.05rem;
}

input[type="text"],
input[type="email"],
input[type="number"],
input[type="datetime-local"],
input[type="color"],
input[type="file"],
textarea,
select {
  width: 100%;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: var(--bg-light);
}

input[type="text"]:focus,
input[type="email"]:focus,
input[type="number"]:focus,
input[type="datetime-local"]:focus,
input[type="color"]:focus,
input[type="file"]:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: var(--color3);
  box-shadow: 0 0 0 3px rgba(158, 11, 65, 0.15);
  background-color: var(--bg-white);
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.public-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  color: var(--text-dark);
}

.survey-status {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.95rem;
}
.survey-status.created {
  background-color: rgba(240, 151, 28, 0.2);
  color: #b36d0a;
}
.survey-status.published {
  background-color: rgba(46, 204, 113, 0.2);
  color: #1a7d48;
}
.survey-status.closed {
  background-color: rgba(231, 76, 60, 0.2);
  color: #c0392b;
}

.error-text {
  color: var(--color4);
  font-size: 0.95rem;
  margin-top: 0.5rem;
  font-weight: 500;
}

.customization-group {
  background-color: rgba(25, 118, 210, 0.05);
  padding: 1.8rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(25, 118, 210, 0.1);
}

.logo-preview {
  max-width: 200px;
  margin-top: 1rem;
  border-radius: 8px;
  border: 1px solid #eee;
  padding: 5px;
}

.preview-container {
  margin-top: 1.5rem;
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: var(--bg-white);
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.05);
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
  padding: 1rem;
}

.preview-logo {
  max-width: 120px;
  border-radius: 6px;
}

.preview-container button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: default;
  font-weight: 600;
  transition: all 0.3s ease;
  min-width: 180px;
  text-align: center;
}

.question-card {
  background-color: var(--bg-white);
  border-radius: 10px;
  padding: 1.8rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px var(--shadow);
  border: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.question-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.question-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 5px;
  height: 100%;
  background: linear-gradient(to bottom, var(--color3), var(--color4));
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.options-group {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background-color: rgba(46, 204, 113, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(46, 204, 113, 0.1);
}

.option-item {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  align-items: center;
}

.option-item input {
  flex: 1;
  padding: 0.9rem;
}

.logic-group {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background-color: rgba(255, 193, 7, 0.08);
  border-radius: 8px;
  border-left: 4px solid var(--color5);
}

.logic-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.logic-row {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.logic-row > * {
  flex: 1;
  min-width: 150px;
}

.add-logic {
  margin-top: 1.5rem;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

button {
  padding: 0.9rem 1.7rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.05rem;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.add-btn {
  background: linear-gradient(135deg, var(--color5), #e67e22);
  color: white;
  box-shadow: 0 4px 15px rgba(240, 151, 28, 0.3);
}

.add-btn:hover {
  background: linear-gradient(135deg, #e67e22, var(--color4));
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(240, 151, 28, 0.4);
}

.submit-btn {
  background: linear-gradient(135deg, var(--color3), var(--color4));
  color: white;
  padding: 1rem 2.5rem;
  box-shadow: 0 4px 15px rgba(158, 11, 65, 0.3);
}

.submit-btn:hover {
  background: linear-gradient(135deg, var(--color4), var(--color5));
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(158, 11, 65, 0.4);
}

.delete-btn {
  background-color: rgba(231, 76, 60, 0.9);
  color: white;
  box-shadow: 0 3px 10px rgba(231, 76, 60, 0.3);
}

.delete-btn:hover {
  background-color: rgba(192, 57, 43, 0.9);
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(231, 76, 60, 0.4);
}

.small-btn {
  padding: 0.6rem 1rem;
  font-size: 0.95rem;
  border-radius: 6px;
  background-color: rgba(231, 76, 60, 0.8);
  color: white;
}

.small-btn:hover {
  background-color: rgba(192, 57, 43, 0.9);
}

.add-logic-btn {
  background: linear-gradient(135deg, var(--color5), #d35400);
  color: white;
  box-shadow: 0 4px 10px rgba(243, 156, 18, 0.3);
}

.add-logic-btn:hover {
  background: linear-gradient(135deg, #d35400, var(--color4));
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(243, 156, 18, 0.4);
}

.remove-logic-btn {
  background-color: rgba(149, 165, 166, 0.9);
  color: white;
  margin-top: 1rem;
  padding: 0.7rem 1.2rem;
}

.remove-logic-btn:hover {
  background-color: rgba(127, 140, 141, 0.9);
  transform: translateY(-3px);
}

.temp-ref-warning {
  background-color: #fef9e7;
  border: 1px solid var(--color5);
  color: #d35400;
  padding: 0.9rem;
  border-radius: 8px;
  margin-top: 1.5rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
}

.message {
  padding: 1.2rem;
  border-radius: 8px;
  margin-top: 2rem;
  text-align: center;
  font-weight: 600;
  font-size: 1.1rem;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
}

.success {
  background-color: rgba(46, 204, 113, 0.15);
  color: #1a7d48;
  border: 1px solid rgba(46, 204, 113, 0.3);
}

.error {
  background-color: rgba(231, 76, 60, 0.15);
  color: #c0392b;
  border: 1px solid rgba(231, 76, 60, 0.3);
}

@media (max-width: 768px) {
  .survey-editor {
    padding: 1.5rem;
  }
  
  .logic-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .logic-row > * {
    width: 100%;
  }
  
  .actions {
    flex-direction: column;
    gap: 15px;
  }
  
  .add-btn,
  .submit-btn {
    width: 100%;
    text-align: center;
  }
  
  h2 {
    font-size: 1.9rem;
  }
  
  h3 {
    font-size: 1.4rem;
  }
}

@media (max-width: 480px) {
  .question-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .customization-group {
    padding: 1.2rem;
  }
  
  h2 {
    font-size: 1.7rem;
  }
}
</style>