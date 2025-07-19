<template>
  <div class="top-action-buttons">
    <button @click="descargarInforme">📄 Informe PDF</button>
    <button @click="exportResponses('csv')">📄 Exportar CSV</button>
    <button @click="exportResponses('xlsx')">📊 Exportar Excel</button>
  </div>

  <div class="survey-responses-list">
    <h2>Respuestas de la Encuesta</h2>
    <div>
      <div v-if="loading" class="empty-message">Cargando respuestas...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="responses.length === 0" class="empty-message">
        <p>No hay respuestas registradas aún.</p>
      </div>
      <div v-else>
        <div
          v-for="(response, index) in responses"
          :key="index"
          class="response-card"
          :style="`--index: ${index}`"
        >
          <h4>Respuesta {{ index + 1 }}</h4>
          <div class="responder-email" v-if="response.responder_email">
            {{ response.responder_email }}
          </div>
          <ul>
            <li v-for="(value, qid) in response.answers" :key="qid">
              <strong>{{ getQuestionText(qid) }}</strong>
              {{ value }}
            </li>
          </ul>
          <span class="timestamp">
            Enviado el {{ formatDate(response.submitted_at) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'

const route = useRoute()
const surveyId = route.params.id

const responses = ref([])
const error = ref(null)
const loading = ref(false)
const questionMap = ref({})
const surveyTitle = ref('')

const fetchResponses = async () => {
  loading.value = true
  error.value = null
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(
      `http://127.0.0.1:8000/api/survey_api/surveys/${surveyId}/responses`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    responses.value = response.data
  } catch (err) {
    console.error(err)
    error.value = 'No se pudieron cargar las respuestas.'
  } finally {
    loading.value = false
  }
}

const fetchSurveyQuestions = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(
      `http://127.0.0.1:8000/api/survey_api/surveys/${surveyId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    const map = {}
    for (const q of response.data.questions) {
      map[q._id] = q.text
    }
    questionMap.value = map
    surveyTitle.value = response.data.title || ''
  } catch (err) {
    console.error('Error al obtener preguntas:', err)
  }
}

const getQuestionText = (qid) => {
  return questionMap.value[qid] || `Pregunta ${qid}`
}

const formatDate = (iso) => {
  return new Date(iso).toLocaleString()
}

const descargarInforme = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(
      `http://127.0.0.1:8000/api/survey_api/surveys/${surveyId}/final-report`,
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      }
    )
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `informe_encuesta_${surveyId}.pdf`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Error al descargar el informe:', err)
    alert('No se pudo descargar el informe.')
  }
}

const exportResponses = async (format) => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(
      `http://127.0.0.1:8000/api/survey_api/surveys/${surveyId}/export`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { format },
        responseType: 'blob',
      }
    )

    const blob = new Blob([response.data], {
      type:
        format === 'csv'
          ? 'text/csv'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const safeTitle = surveyTitle.value
      ? surveyTitle.value.replace(/\s+/g, '_').toLowerCase()
      : surveyId
    link.setAttribute('download', `respuestas_${safeTitle}.${format}`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Error al exportar respuestas:', err)
    alert('No se pudo exportar las respuestas.')
  }
}

onMounted(() => {
  fetchResponses()
  fetchSurveyQuestions()
})
</script>



<style scoped>
.survey-responses-list {
  max-width: 1000px;
  margin: 2rem auto;
  padding: 1.5rem;
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

.response-card {
  background-color: var(--bg-white);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.response-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.response-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 5px;
  height: 100%;
  background: linear-gradient(to bottom, var(--color3), var(--color4));
}

.response-card h4 {
  color: var(--color2);
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid #eee;
  position: relative;
}

.response-card h4::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 50px;
  height: 3px;
  background: var(--color5);
}

.responder-email {
  background-color: rgba(52, 152, 219, 0.1);
  padding: 0.8rem 1.2rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  border-left: 3px solid var(--color3);
  display: inline-block;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.response-card ul > li {
  margin-bottom: 1.5rem;
  padding-left: 1.5rem;
  position: relative;
  line-height: 1.6;
}

.response-card ul > li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--color5);
  font-size: 1.5rem;
  top: -5px;
}

.response-card ul > li strong {
  color: var(--text-dark);
  font-weight: 600;
  display: block;
  margin-bottom: 0.5rem;
}

.response-card ul ul {
  margin-top: 0.5rem;
  padding-left: 1.5rem;
}

.response-card ul ul li {
  margin-bottom: 0.5rem;
  position: relative;
  padding-left: 1.2rem;
}

.response-card ul ul li::before {
  content: '○';
  position: absolute;
  left: 0;
  color: var(--color4);
  font-size: 0.8rem;
  top: 2px;
}

.timestamp {
  display: block;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px dashed #ddd;
  color: #777;
  font-style: italic;
  text-align: right;
}

.error {
  padding: 1.5rem;
  background-color: rgba(231, 76, 60, 0.15);
  color: #c0392b;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  margin: 2rem auto;
  max-width: 600px;
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.empty-message {
  text-align: center;
  padding: 3rem;
  background-color: var(--bg-white);
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  margin-top: 2rem;
}

.empty-message p {
  font-size: 1.2rem;
  color: #555;
  margin-bottom: 1.5rem;
}

/* Animación para la entrada de las tarjetas */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.response-card {
  animation: fadeInUp 0.5s ease forwards;
  animation-delay: calc(var(--index) * 0.1s);
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .survey-responses-list {
    padding: 1rem;
  }
  
  h2 {
    font-size: 1.8rem;
  }
  
  .response-card {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  h2 {
    font-size: 1.6rem;
  }
  
  .response-card ul > li {
    padding-left: 1rem;
  }
  
  .response-card ul ul {
    padding-left: 1rem;
  }
}

.export-buttons {
  margin: 1rem 0;
  display: flex;
  gap: 1rem;
}
.export-buttons button {
  padding: 0.5rem 1rem;
  background-color: var(--color3);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.export-buttons button:hover {
  background-color: var(--color4);
}

.top-action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin: 1rem 2rem 1rem auto;
  max-width: 1000px;
}

.top-action-buttons button {
  padding: 0.6rem 1.4rem;
  font-size: 0.95rem;
  background: var(--color3);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.top-action-buttons button:hover {
  background: var(--color4);
}
</style>