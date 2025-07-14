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

<script lang="ts">
import { defineComponent } from 'vue';
import { useSurveyList } from '../../scripts/Surveys/SurveyList';

export default defineComponent({
  name: 'SurveyList',
  setup() {
    const {
      surveys,
      loading,
      error,
      loadSurveys,
      deleteSurvey,
    } = useSurveyList();

    return {
      surveys,
      loading,
      error,
      loadSurveys,
      deleteSurvey,
    };
  },
});
</script>