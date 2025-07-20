import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

interface QuestionFilter {
  qid: string;
  type: string;
  operator: string;
  value: any;
}

interface SurveyStats {
  [key: string]: {
    text: string;
    type: string;
    options?: Record<string, number>;
    responses?: any[];
    avg?: number;
    median?: number;
    min?: number;
    max?: number;
    histogram?: Record<string, number>;
  };
}

export function useSurveyStats(surveyId: string) {
  // Estados reactivos
  const stats = ref<SurveyStats>({});
  const survey = ref<Record<string, any>>({});
  const loading = ref(true);
  const error = ref<string | null>(null);
  const chartTypes = ref<Record<string, string>>({});
  const activeFilters = ref<QuestionFilter[]>([]);
  const token = ref(localStorage.getItem('token') || '');

  // Computed: Filtros disponibles
  const availableFilters = computed(() => (filterIndex: number) => {
    const selectedQids = activeFilters.value
      .filter((_, idx) => idx !== filterIndex)
      .map(f => f.qid)
      .filter(Boolean);

    return Object.entries(stats.value)
      .filter(([_, q]) => ['number_input', 'multiple_choice', 'checkbox_group'].includes(q.type))
      .map(([id, q]) => ({
        id,
        text: q.text,
        type: q.type,
        disabled: selectedQids.includes(id),
      }));
  });

  // Métodos
  const getQuestionOptions = (qid: string): string[] => {
    const question = survey.value.questions?.find((q: any) => q._id === qid);
    return question?.options || [];
  };

  const getMostVotedOption = (options: Record<string, number>): string | null => {
    if (!options || !Object.keys(options).length) return null;
    return Object.entries(options).reduce(
      (max, entry) => entry[1] > max[1] ? entry : max, 
      ['', -Infinity] as [string, number]
    )[0];
  };

  const getMostVotedIndex = (options: Record<string, number>): number => {
    if (!options || !Object.keys(options).length) return -1;
    const entries = Object.entries(options);
    const maxEntry = entries.reduce(
      (max, entry) => entry[1] > max[1] ? entry : max, 
      entries[0]
    );
    return entries.findIndex(entry => entry[0] === maxEntry[0]);
  };

  const updateFilterType = (index: number) => {
    const filter = activeFilters.value[index];
    const question = stats.value[filter.qid];
    
    if (question) {
      filter.type = question.type;
      filter.operator = filter.type === 'number_input' ? 'equals' : 'equals';
      filter.value = filter.type === 'number_input' ? null : '';
    } else {
      filter.type = 'number_input';
      filter.operator = 'equals';
      filter.value = null;
    }
  };

  const fetchSurvey = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/survey_api/surveys/${surveyId}`,
        { headers: { Authorization: `Bearer ${token.value}` } }
      );
      survey.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Error al cargar la encuesta';
      console.error(err);
    }
  };

  const fetchStats = async () => {
    loading.value = true;
    error.value = null;

    try {
      // Validar filtros numéricos
      const invalidNumberFilter = activeFilters.value.find(
        f => f.type === 'number_input' && isNaN(Number(f.value))
      );
      
      if (invalidNumberFilter) {
        throw new Error('Valores numéricos deben ser números válidos');
      }

      // Construir query params
      const params = new URLSearchParams();
      activeFilters.value.forEach((filter, index) => {
        if (filter.qid && filter.value !== null && filter.value !== '') {
          params.append(`filter_qid_${index}`, filter.qid);
          params.append(`filter_value_${index}`, filter.value);
          params.append(`filter_operator_${index}`, filter.operator);
          params.append(`filter_type_${index}`, filter.type);
        }
      });

      const response = await axios.get(
        `http://localhost:8000/api/survey_api/surveys/${surveyId}/stats`,
        {
          headers: { Authorization: `Bearer ${token.value}` },
          params
        }
      );

      stats.value = response.data;
      
      // Inicializar tipos de gráficos
      Object.keys(response.data).forEach(qid => {
        if (!chartTypes.value[qid]) {
          chartTypes.value[qid] = 'pie';
        }
      });
    } catch (err: any) {
      error.value = err.message || err.response?.data?.detail || 'Error al cargar estadísticas';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const addFilter = () => {
    const selectedQids = activeFilters.value.map(f => f.qid).filter(Boolean);
    const hasAvailable = Object.entries(stats.value).some(
      ([qid, q]) => ['number_input', 'multiple_choice', 'checkbox_group'].includes(q.type) && 
           !selectedQids.includes(qid)
    );

    if (hasAvailable) {
      activeFilters.value.push({
        qid: '',
        type: 'number_input',
        operator: 'equals',
        value: null
      });
    } else {
      alert('No hay más preguntas disponibles para filtrar');
    }
  };

  const removeFilter = (index: number) => {
    activeFilters.value.splice(index, 1);
  };

  // Inicialización
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
    activeFilters,
    availableFilters,
    getQuestionOptions,
    getMostVotedOption,
    getMostVotedIndex,
    updateFilterType,
    fetchStats,
    addFilter,
    removeFilter
  };
}