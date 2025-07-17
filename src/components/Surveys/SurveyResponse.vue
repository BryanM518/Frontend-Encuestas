<template>
  <div class="survey-response-form" v-if="survey">
    <div class="survey-header">
      <h2>{{ survey.title }}</h2>
      <p>{{ survey.description }}</p>
    </div>

    <form @submit.prevent="submitResponses" class="response-form">
      <!-- Correo electrónico -->
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

      <!-- Preguntas -->
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

        <!-- Tipos de input -->
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
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
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
    };
  },
  computed: {
    activeSurvey(): Survey | null {
      return this.survey || this.localSurvey;
    },
    visibleQuestions(): Question[] {
      return this.activeSurvey?.questions.filter(q => this.isQuestionVisible(q)) || [];
    }
  },
  methods: {
    async fetchSurvey() {
      this.loading = true;
      this.error = null;
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
          questions: data.questions.map((q: any) => ({
            ...q,
            id: q._id,
          }))
        };

        this.initAnswers();

      } catch (err: any) {
        console.error('Error al cargar la encuesta pública:', err);
        this.error = err.response?.data?.detail || 'No se pudo cargar la encuesta.';
      } finally {
        this.loading = false;
      }
    },

    initAnswers() {
      const survey = this.activeSurvey;
      if (survey) {
        for (const q of survey.questions) {
          this.answers[q.id] = q.type === 'checkbox_group' ? [] : '';
        }
      }
    },

    isChecked(qid: string, opt: string) {
      return this.answers[qid]?.includes(opt);
    },
    handleCheckboxChange(qid: string, opt: string) {
      const current = this.answers[qid];
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

