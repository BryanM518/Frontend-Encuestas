<template>
  <div class="template-selector">
    <h2>Seleccionar Plantilla</h2>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="loading" class="loading">Cargando plantillas...</div>
    <div v-else-if="templates.length === 0" class="no-templates">No hay plantillas disponibles.</div>
    <div v-else class="template-list">
      <div v-for="template in templates" :key="template._id" class="template-item">
        <h3>{{ template.title || 'Sin título' }}</h3>
        <p>{{ template.description || 'Sin descripción' }}</p>
        <button @click="selectTemplate(template.id)">Usar esta plantilla</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

export default defineComponent({
  name: 'TemplateSelector',
  setup() {
    const templates = ref<any[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const router = useRouter();
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
    const token = localStorage.getItem('token');

    const getAuthHeaders = () => {
      if (!token) {
        console.warn('No token found in localStorage');
        return { headers: { 'Content-Type': 'application/json' } };
      }
      return {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
    };

    const fetchTemplates = async () => {
      loading.value = true;
      error.value = null;
      try {
        const response = await axios.get(`${baseUrl}/api/survey_api/templates`, getAuthHeaders());
        console.log('Templates received:', JSON.stringify(response.data, null, 2));
        templates.value = response.data;
        // Validar que todas las plantillas tengan _id
        templates.value.forEach((template, index) => {
          if (!template._id) {
            console.warn(`Template at index ${index} is missing _id:`, template);
          }
        });
      } catch (err: any) {
        console.error('Error fetching templates:', err);
        error.value = err.response?.status === 401
          ? 'Sesión expirada. Por favor, inicia sesión nuevamente.'
          : `Error al cargar plantillas: ${err.response?.data?.detail || err.message}`;
      } finally {
        loading.value = false;
      }
    };

    const selectTemplate = async (templateId: string) => {
      console.log('selectTemplate called with templateId:', templateId);
      if (!token) {
        error.value = 'Por favor, inicia sesión para usar esta función.';
        router.push('/login');
        return;
      }
      if (!templateId) {
        error.value = 'No se proporcionó un ID de plantilla válido.';
        console.error('selectTemplate called with undefined templateId');
        return;
      }
      try {
        console.log('Creating survey from template ID:', templateId);
        const response = await axios.post(
          `${baseUrl}/api/survey_api/surveys/from_template/${templateId}`,
          {},
          getAuthHeaders()
        );
        const surveyData = response.data;
        console.log('Created survey data:', JSON.stringify(surveyData, null, 2));

        if (!surveyData._id) {
          throw new Error('No survey ID returned');
        }

        // Asegurar que isFromTemplate esté presente
        surveyData.isFromTemplate = true;

        // Pasar los datos de la encuesta al estado del router
        router.push({
          path: `/surveys/${surveyData._id}/edit`,
          state: { surveyData }
        });
      } catch (err: any) {
        console.error('Error creating survey from template:', err);
        error.value = err.response?.status === 404
          ? 'La plantilla seleccionada no existe.'
          : err.response?.status === 401
          ? 'Sesión expirada. Por favor, inicia sesión nuevamente.'
          : err.response?.status === 400
          ? 'ID de plantilla inválido. Por favor, intenta de nuevo.'
          : `Error: ${err.response?.data?.detail || err.message}`;
      }
    };

    onMounted(() => {
      fetchTemplates();
    });

    return {
      templates,
      loading,
      error,
      selectTemplate
    };
  }
});
</script>

<style scoped>
.template-selector {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text-dark);
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--color2);
}

.error {
  background-color: rgba(204, 62, 24, 0.1);
  color: var(--color4);
  padding: 1rem;
  border: 1px solid var(--color4);
  border-radius: 5px;
  margin-bottom: 1rem;
}

.loading,
.no-templates {
  text-align: center;
  font-style: italic;
  color: var(--color2);
  margin-bottom: 1rem;
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.template-item {
  border: 1px solid var(--color3);
  border-radius: 10px;
  padding: 1rem;
  background-color: var(--bg-white);
  box-shadow: 0 2px 5px var(--shadow);
  transition: transform 0.2s ease;
}

.template-item:hover {
  transform: translateY(-2px);
}

.template-item h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  color: var(--color1);
}

.template-item p {
  font-size: 1rem;
  color: var(--text-dark);
  margin-bottom: 1rem;
}

.template-item button {
  padding: 0.5rem 1rem;
  background-color: var(--color5);
  border: none;
  color: var(--text-light);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.template-item button:hover {
  background-color: var(--color3);
}
</style>


