<template>
  <div class="survey-editor">
    <h2>{{ isEditing ? 'Editar Encuesta' : 'Crear Nueva Encuesta' }}</h2>

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

        <!-- 🔁 Lógica condicional -->
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
          {{ isEditing ? 'Actualizar Encuesta' : 'Crear Encuesta' }}
        </button>
      </div>
    </form>

    <div v-if="message" :class="['message', success ? 'success' : 'error']">
      {{ message }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue';
import { useSurveyEditor } from '../../scripts/Surveys/SurveyEditor';

export default defineComponent({
  name: 'SurveyEditor',
  props: {
    surveyToEdit: {
      type: Object,
      default: null,
    },
  },
  setup(props, { emit }) {
    const { surveyToEdit } = toRefs(props);

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
    } = useSurveyEditor(surveyToEdit, emit);

    // Determina si una pregunta tiene referencia temporal
    const hasTempReference = (question: any) => {
      if (!question.visible_if) return false;
      return question.visible_if.question_id?.startsWith('temp_');
    };

    // Obtener preguntas anteriores a la actual
    const getPreviousQuestions = (currentIndex: number) => {
      return form.questions.slice(0, currentIndex);
    };

    // Generar clave única para cada pregunta
    const getQuestionKey = (question: any, index: number) => {
      return question.tempId || question._id || `question-${index}`;
    };

    // Obtener texto para mostrar en opciones de condiciones
    const getQuestionText = (question: any, index: number) => {
      return question.text || `Pregunta ${index + 1} (sin texto)`;
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
      hasTempReference,
      getPreviousQuestions,
      getQuestionKey,
      getQuestionText,
    };
  },
});
</script>

<style scoped>
.survey-editor {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h2 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 30px;
}

h3 {
  color: #3498db;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
  margin-top: 30px;
}

h4 {
  color: #2c3e50;
  margin-top: 15px;
  margin-bottom: 10px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

input[type="text"],
input[type="email"],
input[type="number"],
textarea,
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input[type="text"]:focus,
input[type="email"]:focus,
input[type="number"]:focus,
textarea:focus,
select:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

textarea {
  min-height: 80px;
  resize: vertical;
}

.public-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.question-card {
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 25px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.options-group {
  margin-top: 15px;
  padding: 15px;
  background-color: #f0f7ff;
  border-radius: 6px;
}

.option-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.option-item input {
  flex: 1;
}

.logic-group {
  margin-top: 20px;
  padding: 15px;
  background-color: #fff8e6;
  border-radius: 6px;
  border-left: 4px solid #ffc107;
}

.logic-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.logic-row {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.logic-row > * {
  flex: 1;
  min-width: 120px;
}

.add-logic {
  margin-top: 15px;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

button {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.add-btn {
  background-color: #2ecc71;
  color: white;
}

.add-btn:hover {
  background-color: #27ae60;
}

.submit-btn {
  background-color: #3498db;
  color: white;
  padding: 12px 25px;
}

.submit-btn:hover {
  background-color: #2980b9;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
}

.delete-btn:hover {
  background-color: #c0392b;
}

.small-btn {
  padding: 6px 10px;
  font-size: 14px;
}

.add-logic-btn {
  background-color: #f39c12;
  color: white;
}

.add-logic-btn:hover {
  background-color: #d35400;
}

.remove-logic-btn {
  background-color: #95a5a6;
  color: white;
  margin-top: 10px;
}

.remove-logic-btn:hover {
  background-color: #7f8c8d;
}

.temp-ref-warning {
  background-color: #fef9e7;
  border: 1px solid #f1c40f;
  color: #d35400;
  padding: 10px;
  border-radius: 4px;
  margin-top: 15px;
  font-size: 0.9em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.message {
  padding: 15px;
  border-radius: 4px;
  margin-top: 20px;
  text-align: center;
  font-weight: 600;
}

.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@media (max-width: 768px) {
  .survey-editor {
    padding: 15px;
  }
  
  .logic-row {
    flex-direction: column;
    gap: 8px;
  }
  
  .logic-row > * {
    width: 100%;
  }
  
  .actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .submit-btn {
    width: 100%;
  }
}
</style>