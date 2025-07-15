<template>
  <div class="survey-responses-list">
    <h2>Respuestas recibidas</h2>

    <div v-if="loading">Cargando respuestas...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else-if="responses.length">
  <div v-for="(response, index) in responses" :key="response._id" class="response-card">
    <h4>Respuesta #{{ index + 1 }}</h4>
    
    <p v-if="response.responder_email" class="responder-email">
      Respondido por: <strong>{{ response.responder_email }}</strong>
    </p>

    <ul>
      <li v-for="(answer, qid) in response.answers" :key="qid">
        <strong>{{ getQuestionText(qid) }}:</strong>
        <span v-if="Array.isArray(answer)">
          <ul>
            <li v-for="(opt, i) in answer" :key="i">{{ opt }}</li>
          </ul>
        </span>
        <span v-else>{{ answer }}</span>
      </li>
    </ul>
    
    <small class="timestamp">Enviada: {{ formatDate(response.submitted_at) }}</small>
  </div>
</div>

    <div v-else>
      <p>No hay respuestas aún.</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'SurveyResponsesList',
  data() {
    return {
      responses: [],
      survey: null,
      loading: true,
      error: null,
      token: localStorage.getItem('token')
    };
  },
  methods: {
    async fetchResponses() {
      const id = this.$route.params.id;

      try {
        // 1. Obtener encuesta para mapear preguntas
        const surveyRes = await axios.get(`http://localhost:8000/api/survey_api/surveys/${id}`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        this.survey = surveyRes.data;

        // 2. Obtener respuestas
        const res = await axios.get(`http://localhost:8000/api/survey_api/surveys/${id}/responses`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });

        this.responses = res.data;
      } catch (err) {
        console.error(err);
        this.error = err.response?.data?.detail || 'No se pudieron cargar las respuestas.';
      } finally {
        this.loading = false;
      }
    },
    getQuestionText(qid) {
      const question = this.survey?.questions.find(q => q._id === qid);
      return question ? question.text : `(Pregunta ${qid})`;
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleString('es-ES');
    }
  },
  mounted() {
    this.fetchResponses();
  }
};
</script>
