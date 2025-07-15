<template>
  <div v-if="hasData" class="chart-wrapper">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
  <div v-else>
    <p><em>No hay datos para mostrar.</em></p>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

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
      label: props.title || 'Datos',
      data: props.counts,
      backgroundColor: '#3b82f6',
    }
  ]
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: !!props.title, text: props.title }
  },
  scales: {
    y: { beginAtZero: true }
  }
};
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  max-width: 600px;
  height: 300px;
  margin: auto;
}
</style>
