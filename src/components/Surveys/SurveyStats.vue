<template>
  <div class="survey-stats">
    <h2>Estadísticas de Respuestas</h2>

    <div class="filters">
      <label>Filtros por respuestas:</label>
      <div v-for="(filter, index) in activeFilters" :key="index" class="filter-row">
        <select v-model="filter.qid" @change="updateFilterType(index)">
          <option disabled value="">Seleccione una pregunta</option>
          <option
            v-for="f in availableFilters(index)"
            :key="f.id"
            :value="f.id"
            :disabled="f.disabled"
          >
            {{ f.text }}
          </option>
        </select>

        <select v-if="filter.qid && filter.type === 'number_input'" v-model="filter.operator">
          <option value="equals">Igual</option>
          <option value="less_than">Menor que</option>
          <option value="greater_than">Mayor que</option>
          <option value="less_than_or_equal">Menor o igual</option>
          <option value="greater_than_or_equal">Mayor o igual</option>
        </select>

        <input
          v-if="filter.qid && filter.type === 'number_input'"
          type="number"
          v-model.number="filter.value"
          placeholder="Valor"
        />

        <select
          v-if="filter.qid && (filter.type === 'multiple_choice' || filter.type === 'checkbox_group')"
          v-model="filter.value"
        >
          <option disabled value="">Seleccione una opción</option>
          <option v-for="option in getQuestionOptions(filter.qid)" :key="option" :value="option">
            {{ option }}
          </option>
        </select>

        <button @click="removeFilter(index)">❌</button>
      </div>
      <button @click="addFilter">+ Agregar Filtro</button>
      <button @click="fetchStats">Aplicar filtros</button>
    </div>

    <div v-if="loading">Cargando estadísticas...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else>
      <div v-for="(q, qid) in stats" :key="qid" class="stat-card">
        <h3>{{ q.text }}</h3>

        <div v-if="(q.type === 'multiple_choice' || q.type === 'checkbox_group') && q.options && Object.keys(q.options).length">
          <div class="chart-controls">
            <label>Tipo de gráfico:</label>
            <select v-model="chartTypes[qid]">
              <option value="pie">Circular</option>
              <option value="bar">Barras</option>
            </select>
          </div>
          <p><strong>Opción más votada:</strong> {{ getMostVotedOption(q.options) || 'N/A' }}</p>
          <ChartPie
            v-if="chartTypes[qid] === 'pie'"
            :labels="Object.keys(q.options)"
            :counts="Object.values(q.options)"
            :title="q.text"
            :highlightIndex="getMostVotedIndex(q.options)"
          />
          <ChartBar
            v-else
            :labels="Object.keys(q.options)"
            :counts="Object.values(q.options)"
            :title="q.text"
            :highlightIndex="getMostVotedIndex(q.options)"
          />
        </div>

        <div v-else-if="q.type === 'number_input' && q.responses && q.responses.length">
          <div class="metrics">
            <p><strong>Promedio:</strong> {{ q.avg || 'N/A' }}</p>
            <p><strong>Mediana:</strong> {{ q.median || 'N/A' }}</p>
            <p><strong>Mínimo:</strong> {{ q.min || 'N/A' }}</p>
            <p><strong>Máximo:</strong> {{ q.max || 'N/A' }}</p>
          </div>
          <ChartBar
            v-if="q.histogram && Object.keys(q.histogram).length"
            :labels="Object.keys(q.histogram)"
            :counts="Object.values(q.histogram)"
            :title="`${q.text} (Histograma)`"
          />
          <ChartBar
            v-if="q.options && Object.keys(q.options).length"
            :labels="Object.keys(q.options)"
            :counts="Object.values(q.options)"
            :title="`${q.text} (Valores individuales)`"
          />
        </div>

        <ChartBar
          v-else-if="q.type === 'satisfaction_scale' && q.options && Object.keys(q.options).length"
          :labels="Object.keys(q.options)"
          :counts="Object.values(q.options)"
          :title="q.text"
        />

        <div v-else-if="q.type === 'text_input' && q.responses && q.responses.length">
          <ul>
            <li v-for="(resp, idx) in q.responses" :key="idx">"{{ resp }}"</li>
          </ul>
        </div>

        <div v-if="(!q.responses || q.responses.length === 0) && (!q.options || Object.keys(q.options).length === 0)">
          <p><em>Sin respuestas aún.</em></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import ChartBar from '../Charts/ChartBar.vue';
import ChartPie from '../Charts/ChartPie.vue';

export default defineComponent({
  name: 'SurveyStats',
  components: { ChartBar, ChartPie },
  setup() {
    const stats = ref<Record<string, any>>({});
    const survey = ref<Record<string, any>>({});
    const loading = ref(true);
    const error = ref<string | null>(null);
    const token = localStorage.getItem('token');
    const chartTypes = ref<Record<string, string>>({}); // Almacena el tipo de gráfico por qid

    const route = useRoute();
    const surveyId = route.params.id as string;

    const activeFilters = ref<{ qid: string; type: string; operator: string; value: any }[]>([]);

    const availableFilters = computed(() => (filterIndex: number) => {
      const selectedQids = activeFilters.value
        .filter((_, index) => index !== filterIndex)
        .map(f => f.qid)
        .filter(qid => qid);

      return Object.entries(stats.value)
        .filter(([_, q]) => ['number_input', 'multiple_choice', 'checkbox_group'].includes(q.type))
        .map(([id, q]) => ({
          id,
          text: q.text,
          type: q.type,
          disabled: selectedQids.includes(id),
        }));
    });

    const getQuestionOptions = (qid: string) => {
      console.log('getQuestionOptions: qid=', qid, 'survey=', survey.value);
      const question = survey.value.questions?.find((q: any) => q._id === qid);
      const options = question?.options || [];
      console.log('Question found:', question, 'Options:', options);
      return options;
    };

    const getMostVotedOption = (options: Record<string, number>) => {
      if (!options || !Object.keys(options).length) return null;
      const entries = Object.entries(options);
      const maxEntry = entries.reduce((max, entry) => (entry[1] > max[1] ? entry : max), entries[0]);
      return maxEntry[0];
    };

    const getMostVotedIndex = (options: Record<string, number>) => {
      if (!options || !Object.keys(options).length) return -1;
      const entries = Object.entries(options);
      const maxEntry = entries.reduce((max, entry) => (entry[1] > max[1] ? entry : max), entries[0]);
      return entries.findIndex(entry => entry[0] === maxEntry[0]);
    };

    const updateFilterType = (index: number) => {
      const filter = activeFilters.value[index];
      console.log('updateFilterType: filter.qid=', filter.qid, 'stats=', stats.value);
      const question = stats.value[filter.qid];
      if (question) {
        filter.type = question.type || 'number_input';
        filter.operator = filter.type === 'number_input' ? 'equals' : 'equals';
        filter.value = filter.type === 'number_input' ? null : '';
      } else {
        console.warn('Pregunta no encontrada para qid:', filter.qid);
        filter.type = 'number_input';
        filter.operator = 'equals';
        filter.value = null;
      }
    };

    const fetchSurvey = async () => {
      if (!token || !surveyId) return;
      try {
        const res = await axios.get(`http://localhost:8000/api/survey_api/surveys/${surveyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        survey.value = res.data;
        console.log('Survey loaded:', survey.value);
      } catch (err: any) {
        console.error(err);
        error.value = err.response?.data?.detail || 'Error al cargar la encuesta';
      }
    };

    const fetchStats = async () => {
      if (!token || !surveyId) return;
      loading.value = true;
      error.value = null;

      try {
        const filterPayload = activeFilters.value.filter(f => f.qid && f.value !== null && f.value !== '' && f.operator);

        if (filterPayload.some(f => f.type === 'number_input' && isNaN(f.value))) {
          throw new Error('Todos los valores para preguntas numéricas deben ser numéricos');
        }

        const queryParams = filterPayload
          .map((f, index) => `filter_qid_${index}=${f.qid}&filter_value_${index}=${encodeURIComponent(f.value)}&filter_operator_${index}=${f.operator}&filter_type_${index}=${f.type}`)
          .join('&');

        const url = `http://localhost:8000/api/survey_api/surveys/${surveyId}/stats${queryParams ? '?' + queryParams : ''}`;

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        stats.value = res.data;
        // Inicializar chartTypes para nuevas preguntas
        Object.keys(res.data).forEach(qid => {
          if (!(qid in chartTypes.value)) {
            chartTypes.value[qid] = 'pie'; // Por defecto, gráfico circular
          }
        });
      } catch (err: any) {
        console.error(err);
        error.value = err.message || err.response?.data?.detail || 'Error al cargar estadísticas';
      } finally {
        loading.value = false;
      }
    };

    const addFilter = () => {
      const selectedQids = activeFilters.value.map(f => f.qid).filter(qid => qid);
      const available = Object.values(stats.value)
        .filter(q => ['number_input', 'multiple_choice', 'checkbox_group'].includes(q.type))
        .some(q => !selectedQids.includes(q._id));
      if (available) {
        activeFilters.value.push({ qid: '', type: 'number_input', operator: 'equals', value: null });
      } else {
        alert('No hay más preguntas disponibles para filtrar');
      }
    };

    const removeFilter = (index: number) => {
      activeFilters.value.splice(index, 1);
    };

    onMounted(async () => {
      await fetchSurvey();
      await fetchStats();
    });

    return {
      stats,
      survey,
      loading,
      error,
      chartTypes,
      availableFilters,
      getQuestionOptions,
      getMostVotedOption,
      getMostVotedIndex,
      activeFilters,
      addFilter,
      removeFilter,
      updateFilterType,
      fetchStats,
    };
  },
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
.metrics {
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}
.metrics p {
  margin: 0;
}
.chart-controls {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.chart-controls select {
  width: 150px;
}
ul {
  padding-left: 20px;
}
.filters {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.filter-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.filter-row select,
.filter-row input {
  width: 150px;
}
.error {
  color: red;
  font-weight: bold;
}
</style>