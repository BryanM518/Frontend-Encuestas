<template>
  <div class="template-selector">
    <h2>Crear Nueva Encuesta</h2>
    <div class="options">
      <div class="option-card" @click="startFromScratch">
        <h3>Desde Cero</h3>
        <p>Comienza con un formulario en blanco y personalízalo a tu gusto.</p>
        <button class="select-btn">Seleccionar</button>
      </div>
      <div
        v-for="template in templates"
        :key="template._id"
        class="option-card"
        @click="selectTemplate(template._id)"
      >
        <div class="template-logo">
          <img
            v-if="template.logo_file_id"
            :src="logoUrl(template.logo_file_id)"
            alt="Logo de la plantilla"
            @error="handleLogoError(template)"
          />
          <div v-else class="logo-placeholder">Sin logo</div>
        </div>
        <h3>{{ template.title }}</h3>
        <p>{{ template.description }}</p>
        <button class="select-btn">Usar Plantilla</button>
      </div>
    </div>

    <p v-if="loading">Cargando plantillas...</p>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

interface Template {
  _id: string;
  title: string;
  description: string;
  questions: any[];
  logo_file_id?: string | null;
  primary_color?: string;
  secondary_color?: string;
  font_family?: string;
}

export default defineComponent({
  name: 'TemplateSelector',
  setup() {
    const router = useRouter();
    const templates = ref<Template[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

    const token = localStorage.getItem('token');

    const getAuthHeaders = () => ({
      headers: { Authorization: `Bearer ${token}` }
    });

    const logoUrl = (fileId: string) => {
      const url = `${baseUrl}/api/survey_api/surveys/files/${fileId}`;
      console.log('Generated logo URL for template:', url);
      return url;
    };

    const handleLogoError = (template: Template) => {
      template.logo_file_id = null;
      console.warn(`Failed to load logo for template ${template._id}`);
    };

    const fetchTemplates = async () => {
      loading.value = true;
      error.value = null;
      try {
        const response = await axios.get(`${baseUrl}/api/survey_api/templates`, getAuthHeaders());
        templates.value = response.data;
        console.log('Fetched templates:', JSON.stringify(templates.value, null, 2));
      } catch (err: any) {
        console.error('Error fetching templates:', err);
        error.value = 'No se pudieron cargar las plantillas.';
      } finally {
        loading.value = false;
      }
    };

    const startFromScratch = async () => {
      router.push('/surveys/new/scratch');
    };

    const selectTemplate = async (templateId: string) => {
      try {
        const response = await axios.post(
          `${baseUrl}/api/survey_api/surveys/from_template/${templateId}`,
          {},
          getAuthHeaders()
        );
        const surveyId = response.data.survey_id;
        console.log('Created survey from template, new survey ID:', surveyId);
        router.push(`/surveys/${surveyId}/edit`);
      } catch (err: any) {
        console.error('Error creating survey from template:', err);
        error.value = 'No se pudo crear la encuesta desde la plantilla.';
      }
    };

    fetchTemplates();

    return {
      templates,
      loading,
      error,
      logoUrl,
      handleLogoError,
      startFromScratch,
      selectTemplate
    };
  }
});
</script>

<style scoped>
.template-selector {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 1.5rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h2 {
  color: var(--color3);
  font-size: 2.2rem;
  margin-bottom: 2rem;
  position: relative;
  padding-bottom: 0.8rem;
}

h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 120px;
  height: 4px;
  background: linear-gradient(to right, var(--color3), var(--color4));
  border-radius: 3px;
}

.options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.option-card {
  background-color: var(--bg-white);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.option-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.template-logo {
  width: 100px;
  height: 100px;
  margin-bottom: 1rem;
}

.template-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.template-logo .logo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border-radius: 6px;
  color: #777;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.option-card h3 {
  font-size: 1.4rem;
  color: var(--text-dark);
  margin: 0.5rem 0;
}

.option-card p {
  color: #555;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.select-btn {
  background: linear-gradient(135deg, var(--color3), var(--color4));
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.select-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.error {
  padding: 1.2rem;
  background-color: rgba(204, 62, 24, 0.15);
  color: var(--color4);
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  margin: 2rem auto;
  max-width: 600px;
}
</style>