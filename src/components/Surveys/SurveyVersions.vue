<template>
  <div v-if="versions.length" class="versions-list">
    <h3>Otras versiones de esta encuesta</h3>
    <ul>
      <li v-for="v in versions" :key="v._id">
        <strong>Versión {{ v.version }}</strong> - {{ v.title }}
        <button @click="$router.push(`/surveys/${v._id}/edit`)">Ver</button>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useSurveyVersions } from '../../scripts/Surveys/SurveyVersions';

interface SurveyVersion {
  _id: string;
  version: number | string;
  title: string;
}

    const { versions, loading, error, loadSurveyVersions } = useSurveyVersions();

    // Type assertion for versions
    const typedVersions = versions as unknown as SurveyVersion[];
  
export default defineComponent({
  name: 'SurveyVersions',
  setup() {
    return {
      versions: typedVersions,
      loading,
      error
    };
    const route = useRoute();
    const surveyId = route.params.id as string;

    onMounted(() => {
      loadSurveyVersions(surveyId);
    });

    return {
      versions,
      loading,
      error
    };
  }
});
</script>

<style scoped>
.versions-list {
  background-color: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 2rem;
  border: 1px solid #ddd;
}

.versions-list ul {
  list-style: none;
  padding-left: 0;
}

.versions-list li {
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.versions-list button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.versions-list button:hover {
  background-color: #2980b9;
}
</style>
