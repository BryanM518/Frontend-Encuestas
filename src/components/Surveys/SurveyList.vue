<template>
  <div class="survey-list">
    <div class="btn-survey-actions">
      <h2>Mis Encuestas</h2>
      <button @click="loadSurveys">Recargar Encuestas</button>
    </div>

    <p v-if="loading">Cargando encuestas...</p>
    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="surveys.length" class="surveys-grid">
      <div v-for="survey in surveys" :key="survey._id" class="survey-card">
        <div class="card-header">
          <div class="card-title">
            <h3>{{ survey.title }} (Versión {{ survey.version }})</h3>
            <!-- <p>{{ survey.description }}</p> -->
          </div>
          <button class="generate-link-btn" @click="generateLink(survey._id)">
            🔗 Generar enlace
          </button>
        </div>
        
        <div class="card-actions">
          <div class="action-group">
            <button @click="$router.push(`/surveys/${survey._id}/edit`)">
              <span></span> Editar
            </button>
            <button @click="deleteSurvey(survey._id)">
              <span></span> Eliminar
            </button>
          </div>
          <div class="action-group">
            <button @click="$router.push(`/surveys/${survey._id}/responses`)">
              <span></span> Respuestas
            </button>
            <button @click="$router.push(`/surveys/${survey._id}/stats`)">
              <span></span> Estadísticas
            </button>
            <button v-if="survey.status === 'closed'" @click="downloadReport(survey._id)">
              <span></span> Descargar Informe
            </button>
          </div>
        </div>
      </div>
    </div>

    <p v-else-if="!loading && !error">No tienes encuestas aún.</p>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h3>Enlace de invitación</h3>
        <input type="text" :value="invitationLink" readonly class="link-box" />
        <div class="modal-buttons">
          <button @click="copyToClipboard(invitationLink)">📋 Copiar</button>
          <button class="close-btn" @click="showModal = false">Cerrar</button>
        </div>
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
      
      try {
        const { data } = await axios.post(
          url,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        invitationLink.value = `${window.location.origin}/survey-access/${data.token_id}`;
        showModal.value = true;
        copyMessage.value = '';
      } catch (err: any) {
        console.error('Error generando enlace:', err);
        alert('No se pudo generar el enlace');
      }
    };

    const copyToClipboard = async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        copyMessage.value = 'Enlace copiado al portapapeles';
        setTimeout(() => (copyMessage.value = ''), 3000);
      } catch {
        copyMessage.value = 'No se pudo copiar';
      }
    };

    const downloadReport = async (surveyId: string) => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`http://localhost:8000/api/survey_api/surveys/${surveyId}/report`, {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `informe_encuesta_${surveyId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (err) {
        console.error('Error al descargar el informe:', err);
        alert('No se pudo descargar el informe');
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
      copyMessage,
      downloadReport
    };
  },
});
</script>

<style scoped>
.survey-list {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 1.5rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.btn-survey-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1.5rem;
}

h2 {
  color: var(--color3);
  font-size: 2.2rem;
  margin: 0;
  position: relative;
  padding-bottom: 0.8rem;
}

h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 120px;
  height: 4px;
  background: linear-gradient(to right, var(--color3), var(--color4));
  border-radius: 3px;
}

.surveys-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.survey-card {
  background-color: var(--bg-white);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.survey-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.survey-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(to right, var(--color3), var(--color4));
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.card-title h3 {
  font-size: 1.4rem;
  color: var(--text-dark);
  margin: 0 0 0.5rem;
  line-height: 1.3;
}

.card-title p {
  color: #555;
  margin: 0;
  line-height: 1.5;
  font-size: 0.95rem;
}

.generate-link-btn {
  background: linear-gradient(135deg, var(--color5), #e67e22);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 0.6rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 3px 10px rgba(240, 151, 28, 0.3);
  flex-shrink: 0;
  height: fit-content;
}

.generate-link-btn:hover {
  background: linear-gradient(135deg, #e67e22, var(--color4));
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(240, 151, 28, 0.4);
}

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.action-group {
  display: flex;
  gap: 1rem;
}

.action-group button {
  flex: 1;
  padding: 0.8rem 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-align: center;
  min-height: 50px;
}

.action-group button:nth-child(1) { /* Editar */
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.action-group button:nth-child(2) { /* Eliminar */
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.action-group button:nth-child(3) { /* Ver Respuestas */
  background: linear-gradient(135deg, #2ecc71, #27ae60);
}

.action-group button:nth-child(4) { /* Ver Estadísticas */
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
}

.action-group button:nth-child(5) { /* Descargar Informe */
  background: linear-gradient(135deg, #e91e63, #c2185b);
}

.action-group button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.survey-questions {
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
  margin-top: auto;
}

.survey-questions h4 {
  color: var(--color2);
  margin: 0 0 1rem;
  font-size: 1.2rem;
}

ol {
  counter-reset: question-counter;
  padding-left: 0;
  margin: 0;
}

ol > li {
  counter-increment: question-counter;
  margin-bottom: 1rem;
  padding-left: 1.5rem;
  position: relative;
  font-size: 0.95rem;
}

ol > li::before {
  content: counter(question-counter) ".";
  position: absolute;
  left: 0;
  top: 0;
  font-weight: bold;
  color: var(--color3);
}

ul {
  list-style: none;
  padding-left: 1rem;
  margin: 0.5rem 0 0;
}

ul > li {
  margin-bottom: 0.3rem;
  padding-left: 1rem;
  position: relative;
  font-size: 0.9rem;
}

ul > li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--color5);
}

.error {
  padding: 1.2rem;
  background-color: rgba(204, 62, 24, 0.15);
  color: var(--color4);
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  margin: 2rem auto;
  max-width: 600px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--bg-white);
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.2);
  text-align: center;
  position: relative;
}

.modal h3 {
  color: var(--color3);
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}

.link-box {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  margin: 1.5rem 0;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: var(--bg-light);
  font-family: monospace;
  word-break: break-all;
}

.modal-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.modal-buttons button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.modal-buttons button:first-child {
  background: linear-gradient(135deg, var(--color3), var(--color4));
  color: white;
}

.close-btn {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
  color: white;
}

.copy-message {
  color: #27ae60;
  font-size: 1rem;
  margin-top: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .surveys-grid {
    grid-template-columns: 1fr;
  }
  
  .survey-list {
    padding: 1rem;
  }
  
  .btn-survey-actions {
    flex-direction: column;
    align-items: flex-start;
  }
  
  h2 {
    font-size: 1.8rem;
  }
  
  .modal {
    padding: 1.5rem;
  }
  
  .card-header {
    flex-direction: column;
  }
  
  .generate-link-btn {
    width: 100%;
    justify-content: center;
  }
  
  .action-group {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .survey-card {
    padding: 1.2rem;
  }
  
  h2 {
    font-size: 1.6rem;
  }
  
  .modal-buttons {
    flex-direction: column;
  }
  
  .modal-buttons button {
    width: 100%;
  }
}
</style>