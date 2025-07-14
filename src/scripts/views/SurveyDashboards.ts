// src/composables/useSurveyDashboard.ts
import { ref } from 'vue';

interface Survey {
  _id: string;
  title: string;
  description: string;
  status: string;
  questions?: any[];
}

export function useSurveyDashboard() {
  const surveyToEdit = ref<Survey | null>(null);
  const surveyListRef = ref<any>(null);

  const setSurveyToEdit = (survey: Survey) => {
    surveyToEdit.value = survey;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSurveySaved = (savedSurvey: Survey) => {
    surveyToEdit.value = null;
    if (surveyListRef.value && typeof surveyListRef.value.loadSurveys === 'function') {
      surveyListRef.value.loadSurveys();
    }
  };

  return {
    surveyToEdit,
    surveyListRef,
    setSurveyToEdit,
    handleSurveySaved,
  };
}