<template>
  <div v-if="hasData" class="chart-wrapper">
    <Pie :data="chartData" :options="chartOptions" />
  </div>
  <div v-else>
    <p><em>No hay datos para mostrar.</em></p>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { Pie } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

const props = defineProps<{
  labels: string[];
  counts: number[];
  title?: string;
}>();

const hasData = computed(() => props.labels?.length > 0 && props.counts?.length > 0);

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: props.title || 'Respuestas',
      data: props.counts,
      backgroundColor: ['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa'],
      borderColor: '#fff',
      borderWidth: 1
    }
  ]
}));

import type { ChartOptions } from 'chart.js';

const chartOptions: ChartOptions<'pie'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' },
    title: { display: !!props.title, text: props.title }
  }
};
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  max-width: 400px;
  height: 300px;
  margin: auto;
}
</style>
