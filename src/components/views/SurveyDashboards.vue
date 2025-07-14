<template>
  <div class="survey-dashboard">
    <h1 class="dashboard-title">Gestión de Encuestas</h1>

    <SurveyEditor :survey-to-edit="surveyToEdit" @saved="handleSurveySaved" />

    <SurveyList @edit="setSurveyToEdit" ref="surveyListRef" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SurveyEditor from '../../components/Surveys/SurveyEditor.vue';
import SurveyList from '../../components/Surveys/SurveyList.vue';
import { useSurveyDashboard } from '../../scripts/views/SurveyDashboards';

export default defineComponent({
  name: 'SurveyDashboard',
  components: {
    SurveyEditor,
    SurveyList,
  },
  setup() {
    // Destructure the reactive variables and methods from the composable
    const {
      surveyToEdit,
      surveyListRef, // The ref to the SurveyList component
      setSurveyToEdit,
      handleSurveySaved,
    } = useSurveyDashboard();

    // Return them to make them accessible in the template
    return {
      surveyToEdit,
      surveyListRef,
      setSurveyToEdit,
      handleSurveySaved,
    };
  },
});
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