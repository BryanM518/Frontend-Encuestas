<template>
  <div class="survey-response-form" v-if="survey">
    <h2>{{ survey.title }}</h2>
    <p>{{ survey.description }}</p>

    <form @submit.prevent="submitResponses">
      <!-- Correo -->
      <div class="email-block">
        <label for="responderEmail">Correo electrónico *</label>
        <input
          id="responderEmail"
          v-model="responderEmail"
          type="email"
          required
          placeholder="tu@correo.com"
        />
      </div>

      <!-- Preguntas visibles -->
      <div
        v-for="(q, index) in survey.questions"
        :key="q._id"
        class="question-block"
        v-if="isQuestionVisible(q)"
      >
        <label :for="q._id">
          <strong>{{ index + 1 }}. {{ q.text }}</strong>
          <span v-if="q.is_required" class="required">*</span>
        </label>

        <!-- Text input -->
        <input
          v-if="q.type === 'text_input'"
          v-model="answers[q._id]"
          type="text"
          :required="q.is_required"
        />

        <!-- Number input -->
        <input
          v-if="q.type === 'number_input'"
          v-model.number="answers[q._id]"
          type="number"
          :required="q.is_required"
        />

        <!-- Multiple Choice -->
        <div v-if="q.type === 'multiple_choice'">
          <div v-for="opt in q.options" :key="opt">
            <input
              type="radio"
              :name="q._id"
              :value="opt"
              v-model="answers[q._id]"
              :required="q.is_required"
            />
            <label>{{ opt }}</label>
          </div>
        </div>

        <!-- Checkbox Group -->
        <div v-if="q.type === 'checkbox_group'">
          <div v-for="opt in q.options" :key="opt">
            <input
              type="checkbox"
              :value="opt"
              @change="handleCheckboxChange(q._id, opt)"
              :checked="isChecked(q._id, opt)"
            />
            <label>{{ opt }}</label>
          </div>
        </div>

        <!-- Satisfaction scale -->
        <div v-if="q.type === 'satisfaction_scale'">
          <input
            type="range"
            v-model="answers[q._id]"
            min="1"
            max="5"
            step="1"
          />
          <span>Valor: {{ answers[q._id] }}</span>
        </div>
      </div>

      <button type="submit">Enviar respuestas</button>
    </form>

    <p v-if="message" :class="{ success: success, error: !success }">{{ message }}</p>
  </div>

  <div v-else-if="loading">Cargando encuesta...</div>
  <div v-else-if="error" class="error">{{ error }}</div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'SurveyResponseForm',
  data() {
    return {
      survey: null,
      answers: {},
      responderEmail: '',
      message: '',
      success: false,
      loading: true,
      error: null,
    };
  },
  methods: {
    async fetchSurvey() {
      const surveyId = this.$route.params.id;
      try {
        const response = await axios.get(`http://localhost:8000/api/survey_api/surveys/public/${surveyId}`);
        this.survey = response.data;

        // Inicializar respuestas
        this.survey.questions.forEach((q) => {
          if (q.type === 'checkbox_group') {
            this.answers[q._id] = [];
          } else {
            this.answers[q._id] = '';
          }
        });
      } catch (err) {
        this.error = 'No se pudo cargar la encuesta pública.';
      } finally {
        this.loading = false;
      }
    },

    isChecked(questionId, option) {
      return this.answers[questionId]?.includes(option);
    },

    handleCheckboxChange(questionId, option) {
      const current = this.answers[questionId];
      if (!current.includes(option)) {
        current.push(option);
      } else {
        this.answers[questionId] = current.filter((o) => o !== option);
      }
    },

    isQuestionVisible(question) {
  if (!question || !this.survey || !this.survey.questions) return false;

  const cond = question.visible_if;
  if (!cond || !cond.question_id) return true;

  const answer = this.answers[cond.question_id];
  const operator = cond.operator || 'equals';
  const expected = cond.value;

  switch (operator) {
    case 'equals':
      return answer === expected;
    case 'not_equals':
      return answer !== expected;
    case 'in':
      return Array.isArray(expected)
        ? expected.includes(answer)
        : String(expected).split(',').includes(answer);
    case 'not_in':
      return Array.isArray(expected)
        ? !expected.includes(answer)
        : !String(expected).split(',').includes(answer);
    default:
      return true;
  }
},

    async submitResponses() {
      const surveyId = this.$route.params.id;
      this.message = '';
      this.success = false;

      if (!this.responderEmail) {
        this.message = 'El correo es obligatorio.';
        return;
      }

      try {
        const payload = {
          responder_email: this.responderEmail,
        };

        // Incluir solo respuestas de preguntas visibles
        this.survey.questions.forEach((q) => {
          if (this.isQuestionVisible(q)) {
            payload[q._id] = this.answers[q._id];
          }
        });

        await axios.post(`http://localhost:8000/api/survey_api/surveys/${surveyId}/responses`, payload);
        this.message = '¡Respuestas enviadas correctamente!';
        this.success = true;
      } catch (err) {
        console.error(err);
        this.message = err.response?.data?.detail || 'Error al enviar las respuestas.';
        this.success = false;
      }
    },
  },
  mounted() {
    this.fetchSurvey();
  },
};
</script>

<style scoped>
.survey-response-form {
  max-width: 700px;
  margin: auto;
  padding: 20px;
}
.question-block {
  margin-bottom: 20px;
}
.required {
  color: red;
}
.email-block {
  margin-bottom: 30px;
}
.error {
  color: red;
}
.success {
  color: green;
}
</style>
