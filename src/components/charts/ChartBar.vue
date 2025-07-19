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
:root {
  --chart-primary: #3b82f6;
  --chart-primary-light: #93c5fd;
  --chart-primary-dark: #2563eb;
  --chart-success: #10b981;
  --chart-danger: #ef4444;
  --chart-warning: #f59e0b;
  --chart-gray: #9ca3af;
  --chart-light: #f3f4f6;
  --chart-dark: #1f2937;
  --chart-border-radius: 12px;
  --chart-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  --chart-transition: all 0.3s ease;
}

.chart-wrapper {
  width: 100%;
  height: 350px;
  margin: 20px auto;
  padding: 20px;
  background: white;
  border-radius: var(--chart-border-radius);
  box-shadow: var(--chart-shadow);
  position: relative;
  overflow: hidden;
  transition: var(--chart-transition);
}

.chart-wrapper:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.no-data-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 30px;
  color: var(--chart-gray);
}

.no-data-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  color: var(--chart-light);
  position: relative;
}

.no-data-icon::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
  z-index: -1;
}

.no-data-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--chart-dark);
}

.no-data-message {
  max-width: 400px;
  line-height: 1.6;
}

.chart-header {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
}

.chart-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--chart-dark);
  margin-bottom: 5px;
}

.chart-stats {
  display: flex;
  gap: 15px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.chart-stat {
  background: var(--chart-light);
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
}

.chart-stat::before {
  content: "";
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--chart-primary);
}

.chart-actions {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
  display: flex;
  gap: 10px;
}

.chart-action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  border: 1px solid var(--chart-light);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--chart-transition);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.chart-action-btn:hover {
  background: var(--chart-primary);
  color: white;
  transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .chart-wrapper {
    height: 300px;
    padding: 15px;
  }
  
  .chart-title {
    font-size: 1.1rem;
  }
  
  .no-data-icon {
    font-size: 3rem;
  }
  
  .no-data-title {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .chart-wrapper {
    height: 250px;
  }
  
  .chart-header {
    position: relative;
    top: 0;
    left: 0;
    margin-bottom: 15px;
  }
  
  .chart-actions {
    top: 15px;
    right: 15px;
  }
  
  .chart-stat {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
}

/* Animation for no data state */
@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.7; }
  50% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.7; }
}

.no-data-icon {
  animation: pulse 2s infinite ease-in-out;
}
</style>
