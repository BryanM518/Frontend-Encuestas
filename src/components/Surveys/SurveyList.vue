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
        <strong>{{ survey.title }}</strong>
        <p>{{ survey.description }}</p>

        <button @click="$emit('edit', survey)">Editar</button>
        <button @click="deleteSurvey(survey._id)">Eliminar</button>
        <button @click="$router.push(`/surveys/${survey._id}/responses`)">Ver Respuestas</button>
        <router-link :to="`/surveys/${survey._id}/stats`">Ver Estadísticas</router-link>
        <button @click="generateLink(survey._id)">🔗 Generar enlace</button>

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

    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h3>Enlace de invitación</h3>
        <input type="text" :value="invitationLink" readonly class="link-box" />
        <button @click="copyToClipboard(invitationLink)">📋 Copiar</button>
        <button class="close-btn" @click="showModal = false">Cerrar</button>
        <p v-if="copyMessage" class="copy-message">{{ copyMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useSurveyList } from '../../scripts/Surveys/SurveyList';
import axios from 'axios';

export default defineComponent({
  name: 'SurveyList',
  setup() {
    const { surveys, loading, error, loadSurveys, deleteSurvey } = useSurveyList();
    const showModal = ref(false);
    const invitationLink = ref('');
    const copyMessage = ref('');

    const generateLink = async (surveyId: string) => {
      const token = localStorage.getItem('token')!;
      const url = `http://localhost:8000/api/survey_api/invitations/generate-access-link/${surveyId}`;
      console.log('[generateLink] surveyId:', surveyId);
      console.log('[generateLink] token:', token);
      console.log('[generateLink] URL:', url);

      try {
        const { data } = await axios.post(
          url,
          {}, // body vacío
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        invitationLink.value = `${window.location.origin}/survey-access/${data.token_id}`;
        showModal.value = true;
        copyMessage.value = '';
      } catch (err: any) {
        console.error('[generateLink] error object:', err);
        console.error('[generateLink] error.response:', err.response);
        alert('No se pudo generar el enlace');
      }
    };

    const copyToClipboard = async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        copyMessage.value = '✅ Enlace copiado al portapapeles';
        setTimeout(() => (copyMessage.value = ''), 3000);
      } catch {
        copyMessage.value = '❌ No se pudo copiar';
      }
    };

    return {
      surveys,
      loading,
      error,
      loadSurveys,
      deleteSurvey,
      showModal,
      invitationLink,
      generateLink,
      copyToClipboard,
      copyMessage
    };
  },
});
</script>


<style scoped>
.survey-item {
  margin-bottom: 30px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 6px;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.modal {
  background: white;
  padding: 25px;
  border-radius: 8px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  text-align: center;
}
.link-box {
  width: 100%;
  padding: 10px;
  font-size: 0.95em;
  margin: 15px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.close-btn {
  background-color: #eee;
  border: none;
  padding: 10px 15px;
  margin-top: 10px;
  cursor: pointer;
}
.copy-message {
  color: green;
  font-size: 0.9em;
  margin-top: 8px;
}
</style>
