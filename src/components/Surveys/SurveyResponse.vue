<template>
  <div class="survey-response-form" :style="surveyStyle">
    <div v-if="loading">Cargando encuesta...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="activeSurvey && activeSurvey.status !== 'published'" class="blocked-message">
      <h2>{{ activeSurvey.title }}</h2>
      <p v-if="activeSurvey.status === 'created'">Esta encuesta no está disponible aún. Abre el {{ formatDate(activeSurvey.start_date) }}.</p>
      <p v-else-if="activeSurvey.status === 'closed'">Esta encuesta ha finalizado. Cerró el {{ formatDate(activeSurvey.end_date) }}.</p>
    </div>
    <div v-else-if="activeSurvey">
      <div class="survey-header">
        <img
          v-if="activeSurvey.logo_url"
          :src="activeSurvey.logo_url"
          alt="Survey Logo"
          class="survey-logo"
          @error="handleLogoError"
        />
        <h2>{{ activeSurvey.title }}</h2>
        <p>{{ activeSurvey.description }}</p>
      </div>

      <form @submit.prevent="submitResponses" class="response-form">
        <div class="email-block form-group">
          <label for="responderEmail">Correo electrónico *</label>
          <input
            id="responderEmail"
            v-model="responderEmail"
            type="email"
            required
            placeholder="tu@correo.com"
            class="email-input"
          />
        </div>

        <div
          v-for="(q, index) in visibleQuestions"
          :key="q.id"
          class="question-block form-group"
          :class="{ 'conditional-question': hasCondition(q) }"
        >
          <div class="question-header">
            <label :for="q.id">
              <strong>{{ index + 1 }}. {{ q.text }}</strong>
              <span v-if="q.is_required" class="required">*</span>
            </label>
            <span v-if="hasCondition(q)" class="condition-indicator">⚙️ Condicional</span>
          </div>

          <input
            v-if="q.type === 'text_input'"
            v-model="answers[q.id]"
            :id="q.id"
            type="text"
            :required="q.is_required"
            class="text-input"
          />

          <input
            v-if="q.type === 'number_input'"
            v-model.number="answers[q.id]"
            :id="q.id"
            type="number"
            :required="q.is_required"
            class="number-input"
          />

          <div v-if="q.type === 'multiple_choice'" class="options-group">
            <div v-for="opt in q.options" :key="opt" class="option-item">
              <input
                type="radio"
                :name="q.id"
                :id="`${q.id}_${opt}`"
                :value="opt"
                v-model="answers[q.id]"
                :required="q.is_required"
              />
              <label :for="`${q.id}_${opt}`">{{ opt }}</label>
            </div>
          </div>

          <div v-if="q.type === 'checkbox_group'" class="options-group">
            <div v-for="opt in q.options" :key="opt" class="option-item">
              <input
                type="checkbox"
                :id="`${q.id}_${opt}`"
                :value="opt"
                @change="handleCheckboxChange(q.id, opt)"
                :checked="isChecked(q.id, opt)"
              />
              <label :for="`${q.id}_${opt}`">{{ opt }}</label>
            </div>
          </div>

          <div v-if="q.type === 'satisfaction_scale'" class="satisfaction-scale">
            <div class="scale-labels">
              <span>Muy insatisfecho</span>
              <span>Neutral</span>
              <span>Muy satisfecho</span>
            </div>
            <input
              type="range"
              v-model="answers[q.id]"
              :id="q.id"
              min="1"
              max="5"
              step="1"
              class="scale-input"
            />
            <div class="scale-value">
              Valor seleccionado:
              <span class="value-display">{{ answers[q.id] || 'Ninguno' }}</span>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-btn">Enviar respuestas</button>
        </div>
      </form>

      <div v-if="message" :class="['message', success ? 'success' : 'error']">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, CSSProperties } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

interface Question {
  id: string;
  type: string;
  text: string;
  options?: string[];
  is_required: boolean;
  visible_if?: {
    question_id: string;
    operator: string;
    value: any;
  } | null;
}

interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  status: string;
  start_date?: string;
  end_date?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  font_family?: string;
}

export default defineComponent({
  name: 'SurveyResponseForm',
  props: {
    survey: {
      type: Object as PropType<Survey>,
      required: false
    }
  },
  data() {
    return {
      localSurvey: null as Survey | null,
      answers: {} as Record<string, any>,
      responderEmail: '',
      message: '',
      success: false,
      loading: true,
      error: null as string | null,
      logoLoadFailed: false
    };
  },
  computed: {
    activeSurvey(): Survey | null {
      return this.survey || this.localSurvey;
    },
    visibleQuestions(): Question[] {
      return this.activeSurvey?.questions.filter(q => this.isQuestionVisible(q)) || [];
    },
    surveyStyle(): CSSProperties {
      return {
        '--primary-color': this.activeSurvey?.primary_color || '#3498db',
        '--secondary-color': this.activeSurvey?.secondary_color || '#2ecc71',
        fontFamily: this.activeSurvey?.font_family || 'inherit'
      } as CSSProperties;
    }
  },
  methods: {
    async fetchSurvey() {
      this.loading = true;
      this.error = null;
      this.logoLoadFailed = false;
      const route = useRoute();
      const surveyId = route.params.id as string;

      try {
        const { data } = await axios.get(
          `http://localhost:8000/api/survey_api/surveys/public/${surveyId}`
        );

        this.localSurvey = {
          id: data._id,
          title: data.title,
          description: data.description,
          status: data.status || 'created',
          start_date: data.start_date,
          end_date: data.end_date,
          logo_url: data.logo_url,
          primary_color: data.primary_color,
          secondary_color: data.secondary_color,
          font_family: data.font_family,
          questions: data.questions?.map((q: any) => ({
            ...q,
            id: q._id,
          })) || []
        };

        if (this.localSurvey.status === 'published') {
          this.initAnswers();
        } else {
          this.error = this.localSurvey.status === 'created'
            ? `Esta encuesta no está disponible aún. Abre el ${this.formatDate(this.localSurvey.start_date)}.`
            : `Esta encuesta ha finalizado. Cerró el ${this.formatDate(this.localSurvey.end_date)}.`;
        }
      } catch (err: any) {
        console.error('Error al cargar la encuesta pública:', err);
        this.error = err.response?.data?.detail || 'No se pudo cargar la encuesta.';
      } finally {
        this.loading = false;
      }
    },

    initAnswers() {
      const survey = this.activeSurvey;
      if (survey && survey.questions) {
        for (const q of survey.questions) {
          this.answers[q.id] = q.type === 'checkbox_group' ? [] : '';
        }
      }
    },

    formatDate(date?: string): string {
      if (!date) return 'desconocido';
      return new Date(date).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    isChecked(qid: string, opt: string) {
      return this.answers[qid]?.includes(opt);
    },

    handleCheckboxChange(qid: string, opt: string) {
      const current = this.answers[qid] || [];
      if (!current.includes(opt)) {
        this.answers[qid] = [...current, opt];
      } else {
        this.answers[qid] = current.filter((o: string) => o !== opt);
      }
    },

    hasCondition(q: Question): boolean {
      return !!q.visible_if;
    },

    isQuestionVisible(q: Question): boolean {
      const cond = q.visible_if;
      if (!cond || !cond.question_id) return true;

      const answer = this.answers[cond.question_id];
      const operator = cond.operator || 'equals';
      const expected = cond.value;

      const toArray = (val: any): string[] => {
        if (Array.isArray(val)) return val.map(String);
        if (val === null || val === undefined) return [];
        return [String(val)];
      };

      const answerArray = toArray(answer);
      const expectedArray = toArray(expected);

      switch (operator) {
        case 'equals': return answerArray.join(',') === expectedArray.join(',');
        case 'not_equals': return answerArray.join(',') !== expectedArray.join(',');
        case 'in': return answerArray.some(a => expectedArray.includes(a));
        case 'not_in': return !answerArray.some(a => expectedArray.includes(a));
        default: return true;
      }
    },

    handleLogoError() {
      this.logoLoadFailed = true;
      this.message = 'No se pudo cargar el logo. El formulario sigue disponible.';
    },

    async submitResponses() {
      const surveyId = this.activeSurvey?.id;
      if (!surveyId) {
        this.message = 'Encuesta no cargada.';
        return;
      }

      if (!this.responderEmail) {
        this.message = 'El correo electrónico es obligatorio.';
        return;
      }

      for (const q of this.visibleQuestions) {
        if (q.is_required && !this.answers[q.id]) {
          this.message = `La pregunta "${q.text}" es obligatoria.`;
          return;
        }
      }

      try {
        const payload = {
          responder_email: this.responderEmail,
          ...Object.fromEntries(
            Object.entries(this.answers).filter(([key]) =>
              this.visibleQuestions.some(q => q.id === key)
            )
          )
        };

        await axios.post(
          `http://localhost:8000/api/survey_api/surveys/${surveyId}/responses`,
          payload
        );

        this.message = '¡Respuestas enviadas correctamente!';
        this.success = true;

        setTimeout(() => {
          this.answers = {};
          this.responderEmail = '';
          this.success = false;
          this.message = '';
        }, 3000);
      } catch (err: any) {
        console.error('Error al enviar respuestas:', err);
        this.message = err.response?.data?.detail || 'No se pudieron enviar las respuestas.';
      }
    }
  },
  mounted() {
    if (!this.survey) {
      this.fetchSurvey();
    } else {
      this.loading = false;
      this.initAnswers();
    }
  }
});
</script>

<style scoped>
.survey-response-form {
  max-width: 700px;
  margin: 2rem auto;
  padding: 2.5rem;
  background-color: var(--bg-white);
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  font-family: var(--font-family, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif);
}

.survey-header {
  margin-bottom: 2.5rem;
  text-align: center;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--bg-light);
}

.survey-logo {
  max-width: 180px;
  max-height: 100px;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.survey-header h2 {
  color: var(--text-dark);
  font-size: 1.8rem;
  margin-bottom: 1rem;
  position: relative;
  padding-bottom: 0.8rem;
}

.survey-header h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 3px;
  background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
  border-radius: 3px;
}

.survey-header p {
  color: #555;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

.response-form {
  margin-top: 1.5rem;
}

.form-group {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border-radius: 10px;
  background-color: var(--bg-light);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border-left: 4px solid var(--primary-color);
}

.form-group:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.email-block {
  border-left-color: var(--secondary-color);
}

.conditional-question {
  border-left-color: var(--color5);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.2rem;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.question-header label {
  font-size: 1.1rem;
  color: var(--text-dark);
  font-weight: 600;
  flex: 1;
}

.required {
  color: var(--color4);
  margin-left: 0.3rem;
}

.condition-indicator {
  background-color: rgba(240, 151, 28, 0.15);
  color: var(--color5);
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.text-input,
.number-input,
.email-input {
  width: 100%;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: var(--bg-white);
}

.text-input:focus,
.number-input:focus,
.email-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15);
}

.options-group {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 0.8rem;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.option-item:hover {
  background-color: rgba(52, 152, 219, 0.1);
}

.option-item input[type="radio"],
.option-item input[type="checkbox"] {
  accent-color: var(--primary-color);
  width: 18px;
  height: 18px;
}

.satisfaction-scale {
  margin-top: 1.2rem;
}

.scale-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
  font-size: 0.9rem;
  color: #555;
}

.scale-input {
  width: 100%;
  height: 8px;
  accent-color: var(--primary-color);
  cursor: pointer;
}

.scale-value {
  margin-top: 1rem;
  text-align: center;
  font-weight: 500;
}

.value-display {
  font-weight: bold;
  color: var(--primary-color);
  font-size: 1.1rem;
}

.form-actions {
  margin-top: 2.5rem;
  text-align: center;
}

.submit-btn {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  padding: 1rem 2.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

.submit-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
  background: linear-gradient(135deg, var(--secondary-color), var(--primary-color));
}

.message {
  margin-top: 2rem;
  padding: 1.2rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
}

.success {
  background-color: rgba(46, 204, 113, 0.15);
  color: #1a7d48;
  border: 1px solid rgba(46, 204, 113, 0.3);
}

.error,
.blocked-message {
  background-color: rgba(231, 76, 60, 0.15);
  color: #c0392b;
  border: 1px solid rgba(231, 76, 60, 0.3);
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 2rem;
}

.blocked-message h2 {
  color: var(--text-dark);
  margin-bottom: 1rem;
}

.blocked-message p {
  font-size: 1.1rem;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .survey-response-form {
    padding: 1.5rem;
    margin: 1rem;
  }
  
  .options-group {
    grid-template-columns: 1fr;
  }
  
  .survey-header h2 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .form-group {
    padding: 1.2rem;
  }
  
  .question-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .condition-indicator {
    align-self: flex-start;
  }
}
</style>