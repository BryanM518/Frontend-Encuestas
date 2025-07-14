<template>
  <div class="survey-dashboard">
    <h1 class="dashboard-title">Gestión de Encuestas</h1>

    <!-- Editor (crear o editar encuesta) -->
    <SurveyEditor :survey-to-edit="surveyToEdit" @saved="handleSurveySaved" />

    <!-- Lista de encuestas -->
    <SurveyList @edit="setSurveyToEdit" ref="surveyListRef" />
  </div>
</template>

<script>
import SurveyEditor from '../../components/Surveys/SurveyEditor.vue';
import SurveyList from '../../components/Surveys/SurveyList.vue';

export default {
  name: 'SurveyDashboard',
  components: {
    SurveyEditor,
    SurveyList
  },
  data() {
    return {
      surveyToEdit: null
    };
  },
  methods: {
    setSurveyToEdit(survey) {
      this.surveyToEdit = survey;
      window.scrollTo({ top: 0, behavior: 'smooth' }); // opcional: subir al editor
    },
    handleSurveySaved(savedSurvey) {
      this.surveyToEdit = null;
      this.$refs.surveyListRef.loadSurveys(); // recarga la lista desde el hijo
    }
  }
};
</script>

<style scoped>
.survey-dashboard {
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 20px;
}

.dashboard-title {
  text-align: center;
  color: var(--color2);
  font-size: 2rem;
  margin-bottom: 40px;
}
</style>
