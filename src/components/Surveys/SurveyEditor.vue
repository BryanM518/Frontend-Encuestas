<template>
  <div class="survey-editor">
    <h2>{{ isEditing ? 'Editar Encuesta' : 'Crear Nueva Encuesta' }}</h2>

    <form @submit.prevent="handleSubmit">
      <input v-model="form.title" placeholder="Título de la Encuesta" required />
      <textarea v-model="form.description" placeholder="Descripción de la Encuesta"></textarea>

      <h3>Preguntas</h3>
      <div v-for="(question, qIndex) in form.questions" :key="question._id || qIndex" class="question-card">
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

        <button type="button" @click="removeQuestion(qIndex)">Eliminar Pregunta</button>
      </div>

      <button type="button" @click="addQuestion">Agregar Pregunta</button>
      <button type="submit">{{ isEditing ? 'Actualizar Encuesta' : 'Crear Encuesta' }}</button>
    </form>

    <p v-if="message" :class="{ success: success, error: !success }">{{ message }}</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'SurveyEditor',
  props: {
    surveyToEdit: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      form: this.resetForm(),
      message: '',
      success: false,
      backendUrl: 'http://127.0.0.1:8000/api/v1/surveys/',
      token: localStorage.getItem('token')
    };
  },
  computed: {
    isEditing() {
      return !!this.form._id;
    }
  },
  watch: {
    surveyToEdit: {
      immediate: true,
      handler(newVal) {
        this.form = newVal ? JSON.parse(JSON.stringify(newVal)) : this.resetForm();
      }
    }
  },
  methods: {
    resetForm() {
      return {
        _id: null,
        title: '',
        description: '',
        questions: [],
        status: 'created'
      };
    },
    getAuthHeaders() {
      return {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      };
    },
    addQuestion() {
      const tempId = 'temp_' + Date.now() + Math.random().toString(36).substring(2, 10);
      this.form.questions.push({
        _id: tempId,
        type: 'text_input',
        text: '',
        options: [],
        is_required: false
      });
    },
    removeQuestion(index) {
      this.form.questions.splice(index, 1);
    },
    addOption(qIndex) {
      if (!this.form.questions[qIndex].options) {
        this.form.questions[qIndex].options = [];
      }
      this.form.questions[qIndex].options.push('');
    },
    removeOption(qIndex, oIndex) {
      this.form.questions[qIndex].options.splice(oIndex, 1);
    },
    async handleSubmit() {
      this.message = '';
      this.success = false;

      if (!this.token) {
        this.message = 'Debes iniciar sesión para guardar encuestas.';
        return;
      }

      const payload = JSON.parse(JSON.stringify(this.form));

      if ('_id' in payload) delete payload._id;

      payload.questions.forEach(q => {
        if (typeof q._id === 'string' && q._id.startsWith('temp_')) {
          delete q._id;
        }
        if (q.type !== 'multiple_choice' && q.type !== 'checkbox_group' && q.options) {
          delete q.options;
        } else if ((q.type === 'multiple_choice' || q.type === 'checkbox_group') && (!q.options || q.options.length === 0)) {
          q.options = [];
        }
      });

      try {
        let response;
        if (this.isEditing) {
          response = await axios.put(`${this.backendUrl}${this.form._id}`, payload, this.getAuthHeaders());
          this.message = 'Encuesta actualizada correctamente.';
        } else {
          response = await axios.post(this.backendUrl, payload, this.getAuthHeaders());
          this.message = 'Encuesta creada correctamente.';
        }

        this.success = true;
        this.form = this.resetForm();
        this.$emit('saved', response.data); // Notifica al componente padre
      } catch (err) {
        console.error('Error al guardar encuesta:', err);
        this.message = err.response?.data?.detail || 'Error al guardar la encuesta.';
        this.success = false;
      }
    }
  }
};
</script>