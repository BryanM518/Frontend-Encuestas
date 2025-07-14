<template>
  <div class="survey-list">

    <div class="btn-survey-actions">
        <h2>Mis Encuestas</h2>
        <button @click="loadSurveys">Recargar Encuestas</button>
    </div>
    <p v-if="loading">Cargando encuestas...</p>
    <p v-if="error" class="error">{{ error }}</p>

    <ul v-if="surveys.length">
      <li v-for="survey in surveys" :key="survey._id" class="survey-item">
        <strong>{{ survey.title }}</strong> ({{ survey.status }})
        <p>{{ survey.description }}</p>

        <button @click="$emit('edit', survey)">Editar</button>
        <button @click="deleteSurvey(survey._id)">Eliminar</button>

        <div v-if="survey.questions && survey.questions.length">
          <h4>Preguntas:</h4>
          <ol>
            <li v-for="(q, idx) in survey.questions" :key="idx">
              {{ q.text }} <span v-if="q.is_required">(Requerida)</span>
              <ul v-if="q.options && q.options.length">
                <li v-for="(opt, optIdx) in q.options" :key="optIdx">{{ opt }}</li>
              </ul>
            </li>
          </ol>
        </div>
      </li>
    </ul>

    <p v-else-if="!loading && !error">No tienes encuestas aún.</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'SurveyList',
  data() {
    return {
      backendUrl: 'http://127.0.0.1:8000/api/v1/surveys/',
      token: localStorage.getItem('token'),
      surveys: [],
      loading: false,
      error: null
    };
  },
  methods: {
    getAuthHeaders() {
      return {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      };
    },
    async loadSurveys() {
      this.loading = true;
      this.error = null;

      if (!this.token) {
        this.error = 'Debes iniciar sesión para ver tus encuestas.';
        this.loading = false;
        return;
      }

      try {
        const response = await axios.get(this.backendUrl, this.getAuthHeaders());
        this.surveys = response.data;
      } catch (err) {
        console.error('Error al cargar encuestas:', err);
        this.error = 'No se pudieron cargar las encuestas.';
      } finally {
        this.loading = false;
      }
    },
    async deleteSurvey(id) {
      if (!confirm('¿Seguro que deseas eliminar esta encuesta?')) return;

      try {
        await axios.delete(`${this.backendUrl}${id}`, this.getAuthHeaders());
        this.surveys = this.surveys.filter(s => s._id !== id);
      } catch (err) {
        console.error('Error al eliminar encuesta:', err);
        this.error = 'No se pudo eliminar la encuesta.';
      }
    }
  },
  mounted() {
    this.loadSurveys();
  }
};
</script>
