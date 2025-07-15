<template>
  <div class="survey-stats">
    <h2>Estadísticas de Respuestas</h2>

    <div v-if="loading">Cargando estadísticas...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else>
      <div v-for="(q, qid) in stats" :key="qid" class="stat-card">
        <h3>{{ q.text }}</h3>

        <!-- Gráfico de Pastel para opciones -->
        <ChartPie
          v-if="(q.type === 'multiple_choice' || q.type === 'checkbox_group') && q.options && Object.keys(q.options).length"
          :labels="Object.keys(q.options)"
          :counts="Object.values(q.options)"
          :title="q.text"
        />

        <!-- Gráfico de Barras -->
        <ChartBar
          v-else-if="(q.type === 'satisfaction_scale' || q.type === 'number_input') && q.options && Object.keys(q.options).length"
          :labels="Object.keys(q.options)"
          :counts="Object.values(q.options)"
          :title="q.text"
        />

        <!-- Texto libre -->
        <div v-else-if="q.type === 'text_input' && q.responses && q.responses.length">
          <ul>
            <li v-for="(resp, idx) in q.responses" :key="idx">"{{ resp }}"</li>
          </ul>
        </div>

        <!-- Sin respuestas -->
        <div v-if="(!q.responses || q.responses.length === 0) && (!q.options || Object.keys(q.options).length === 0)">
          <p><em>Sin respuestas aún.</em></p>
        </div>
      </div>
    </div>
  </div>
</template>


<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import ChartBar from '../Charts/ChartBar.vue';
import ChartPie from '../Charts/ChartPie.vue';

export default defineComponent({
  name: 'SurveyStats',
  components: { ChartBar, ChartPie },
  setup() {
    const stats = ref<Record<string, any>>({});
    const loading = ref(true);
    const error = ref<string | null>(null);
    const token = localStorage.getItem('token');

    const route = useRoute();
    const surveyId = route.params.id as string;

    const fetchStats = async () => {
      if (!token || !surveyId) {
        error.value = 'Token o ID de encuesta no encontrado.';
        loading.value = false;
        return;
      }

      try {
        const res = await axios.get(`http://localhost:8000/api/survey_api/surveys/${surveyId}/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        stats.value = res.data;
      } catch (err: any) {
        console.error(err);
        error.value = err.response?.data?.detail || 'Error al cargar estadísticas';
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchStats);

    return { stats, loading, error };
  }
});
</script>


<style scoped>
.survey-stats {
  max-width: 900px;
  margin: auto;
  padding: 20px;
}
.stat-card {
  margin-bottom: 40px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}
.stat-card h3 {
  margin-bottom: 15px;
}
ul {
  padding-left: 20px;
}
.error {
  color: red;
  font-weight: bold;
}
</style>
