<template>
  <div class="public-survey-list">
    <h2>Encuestas Públicas</h2>

    <p v-if="loading">Cargando encuestas...</p>
    <p v-if="error" class="error">{{ error }}</p>

    <ul v-if="surveys.length">
      <li v-for="survey in surveys" :key="survey._id" class="survey-item">
        <div class="survey-header">
          <strong>{{ survey.title }}</strong>
          <div class="survey-logo">
            <img
              v-if="survey.logo_file_id"
              :src="logoUrl(survey.logo_file_id)"
              alt="Logo de la encuesta"
              @error="handleLogoError(survey)"
            />
            <div v-else class="logo-placeholder">Sin logo</div>
          </div>
        </div>
        <p>{{ survey.description }}</p>
        <div class="survey-status">
          Estado: <span :class="['status', survey.status]">{{ capitalize(survey.status) }}</span>
        </div>
        <div v-if="survey.status === 'published'">
          <router-link :to="`/response/${survey._id}`" class="respond-link">Responder Encuesta</router-link>
        </div>
        <div v-else class="blocked-message">
          <span v-if="survey.status === 'created'">Esta encuesta no está disponible aún.</span>
          <span v-else-if="survey.status === 'closed'">Esta encuesta ha finalizado.</span>
        </div>
      </li>
    </ul>

    <p v-else-if="!loading && !error">No hay encuestas públicas disponibles.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import axios from 'axios';

interface Survey {
  _id: string;
  title: string;
  description: string;
  status: string;
  start_date?: string;
  end_date?: string;
  logo_file_id?: string | null;
}

export default defineComponent({
  name: 'PublicSurveyList',
  setup() {
    const surveys = ref<Survey[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const endpoint = 'http://127.0.0.1:8000/api/survey_api/surveys/public';
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

    const capitalize = (value: string) => {
      if (!value) return '';
      return value.charAt(0).toUpperCase() + value.slice(1);
    };

    const logoUrl = (fileId: string) => {
      return `${baseUrl}/api/survey_api/surveys/files/${fileId}`;
    };

    const handleLogoError = (survey: Survey) => {
      survey.logo_file_id = null;
    };

    const loadSurveys = async () => {
      loading.value = true;
      error.value = null;
      try {
        const response = await axios.get(endpoint);
        surveys.value = response.data.map((survey: any) => ({
          ...survey,
          status: survey.status || 'created',
          logo_file_id: survey.logo_file_id || null
        }));
      } catch (err) {
        console.error(err);
        error.value = 'No se pudieron cargar las encuestas públicas.';
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      loadSurveys();
    });

    return {
      surveys,
      loading,
      error,
      capitalize,
      logoUrl,
      handleLogoError
    };
  }
});
</script>

<style scoped>
.public-survey-list {
  max-width: 900px;
  margin: 2rem auto;
  padding: 1.5rem;
  background-color: var(--bg-white);
  border-radius: 12px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.08);
}

h2 {
  text-align: center;
  color: var(--color3);
  margin-bottom: 1.8rem;
  font-size: 2.2rem;
  position: relative;
  padding-bottom: 0.8rem;
}

h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 4px;
  background: linear-gradient(to right, var(--color3), var(--color4));
  border-radius: 3px;
}

ul {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.survey-item {
  background-color: var(--bg-white);
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px var(--shadow);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.survey-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: rgba(158, 11, 65, 0.1);
}

.survey-item:hover::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(to right, var(--color3), var(--color4));
}

.survey-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.survey-logo {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.survey-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.survey-logo .logo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border-radius: 6px;
  color: #777;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid rgba(0, 0, 0, 0.1);
  text-align: center;
}

.survey-item strong {
  font-size: 1.3rem;
  color: var(--text-dark);
  line-height: 1.3;
}

.survey-item p {
  color: #555;
  flex-grow: 1;
  margin-bottom: 1.2rem;
  font-size: 0.98rem;
}

.survey-status {
  margin: 1rem 0;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

.status {
  font-weight: 600;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  margin-left: 0.5rem;
  font-size: 0.85rem;
}

.status.created {
  background-color: rgba(240, 151, 28, 0.2);
  color: #b36d0a;
}

.status.published {
  background-color: rgba(46, 204, 113, 0.2);
  color: #1a7d48;
}

.status.closed {
  background-color: rgba(231, 76, 60, 0.2);
  color: #c0392b;
}

.respond-link {
  display: inline-block;
  width: 100%;
  padding: 0.7rem;
  background: linear-gradient(to right, var(--color3), var(--color4));
  color: var(--text-light);
  text-align: center;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
  box-shadow: 0 3px 10px rgba(158, 11, 65, 0.3);
}

.respond-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(158, 11, 65, 0.4);
  background: linear-gradient(to right, var(--color4), var(--color5));
}

.blocked-message {
  margin-top: 0.8rem;
  padding: 0.7rem;
  background-color: rgba(204, 62, 24, 0.1);
  color: var(--color4);
  border-radius: 6px;
  text-align: center;
  font-weight: 500;
  font-size: 0.9rem;
}

.public-survey-list p {
  text-align: center;
  color: #777;
}

.error {
  padding: 1rem;
  background-color: rgba(204, 62, 24, 0.15);
  color: var(--color4);
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  max-width: 600px;
  margin: 0 auto;
}

/* Animación para cuando se cargan las encuestas */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

.survey-item {
  animation: fadeIn 0.5s ease;
}

@media (max-width: 768px) {
  .survey-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .survey-logo {
    margin-top: 0.5rem;
  }
}
</style>