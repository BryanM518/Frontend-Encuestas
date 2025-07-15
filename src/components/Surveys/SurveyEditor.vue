<template>
  <div class="survey-editor">
    <h2>{{ isEditing ? 'Editar Encuesta' : 'Crear Nueva Encuesta' }}</h2>

    <form @submit.prevent="handleSubmit">
      <input v-model="form.title" placeholder="Título de la Encuesta" required />
      <textarea v-model="form.description" placeholder="Descripción de la Encuesta"></textarea>

      <label class="public-toggle">
        <input type="checkbox" v-model="form.is_public" />
        ¿Hacer pública esta encuesta?
      </label>

      <h3>Preguntas</h3>
      <div
        v-for="(question, qIndex) in form.questions"
        :key="question._id || qIndex"
        class="question-card"
      >
        <p><strong>Pregunta {{ qIndex + 1 }}</strong></p>

        <label>Tipo:</label>
        <select v-model="question.type">
          <option value="text_input">Texto Libre</option>
          <option value="multiple_choice">Opción Múltiple</option>
          <option value="satisfaction_scale">Escala de Satisfacción</option>
          <option value="number_input">Número</option>
          <option value="checkbox_group">Casillas de Verificación</option>
        </select>

        <label>Texto de la pregunta:</label>
        <input v-model="question.text" type="text" required />

        <label>
          <input type="checkbox" v-model="question.is_required" />
          ¿Es requerida?
        </label>

        <div v-if="question.type === 'multiple_choice' || question.type === 'checkbox_group'">
          <h4>Opciones:</h4>
          <div v-for="(option, oIndex) in question.options" :key="oIndex" class="option-item">
            <input v-model="question.options[oIndex]" type="text" placeholder="Opción" required />
            <button type="button" @click="removeOption(qIndex, oIndex)">Eliminar</button>
          </div>
          <button type="button" @click="addOption(qIndex)">Agregar Opción</button>
        </div>

        <!-- 🔁 Lógica condicional opcional -->
        <div v-if="question.visible_if">
          <h4>Lógica Condicional:</h4>
          Mostrar esta pregunta solo si
          <select v-model="question.visible_if.question_id">
            <option disabled value="">Seleccione una pregunta anterior</option>
            <option
              v-for="(prev, pIndex) in form.questions.slice(0, qIndex)"
              :key="prev._id"
              :value="prev._id"
            >
              {{ prev.text }}
            </option>
          </select>

          <select v-model="question.visible_if.operator">
            <option value="equals">es igual a</option>
            <option value="not_equals">no es igual a</option>
            <option value="in">está en</option>
            <option value="not_in">no está en</option>
          </select>

          <input v-model="question.visible_if.value" placeholder="Valor esperado" />

          <button type="button" @click="removeLogic(qIndex)">❌ Eliminar condición</button>
        </div>
        <div v-else>
          <button type="button" @click="addLogic(qIndex)">➕ Añadir lógica condicional</button>
        </div>

        <button type="button" @click="removeQuestion(qIndex)">Eliminar Pregunta</button>
      </div>

      <button type="button" @click="addQuestion">Agregar Pregunta</button>
      <button type="submit">{{ isEditing ? 'Actualizar Encuesta' : 'Crear Encuesta' }}</button>
    </form>

    <p v-if="message" :class="{ success: success, error: !success }">{{ message }}</p>
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
  },
});
</script>
