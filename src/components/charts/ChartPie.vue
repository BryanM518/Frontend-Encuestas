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
:root {
  --pie-primary: #8b5cf6;
  --pie-primary-light: #ede9fe;
  --pie-secondary: #3b82f6;
  --pie-success: #10b981;
  --pie-warning: #f59e0b;
  --pie-danger: #ef4444;
  --pie-light: #f8fafc;
  --pie-dark: #1e293b;
  --pie-gray: #64748b;
  --pie-border-radius: 18px;
  --pie-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
  --pie-transition: all 0.3s ease;
}

.chart-container {
  width: 100%;
  max-width: 600px;
  margin: 20px auto;
  position: relative;
}

.chart-wrapper {
  background: white;
  border-radius: var(--pie-border-radius);
  padding: 25px;
  box-shadow: var(--pie-shadow);
  height: 420px;
  display: flex;
  flex-direction: column;
  transition: var(--pie-transition);
  position: relative;
  overflow: hidden;
}

.chart-wrapper:hover {
  transform: translateY(-8px);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.15);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid var(--pie-light);
}

.chart-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--pie-dark);
  position: relative;
  padding-left: 15px;
}

.chart-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 5px;
  height: 80%;
  background: var(--pie-primary);
  border-radius: 10px;
}

.chart-actions {
  display: flex;
  gap: 10px;
}

.chart-action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--pie-light);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--pie-transition);
  color: var(--pie-gray);
}

.chart-action-btn:hover {
  background: var(--pie-primary);
  color: white;
  transform: scale(1.1);
}

.chart-content {
  flex: 1;
  display: flex;
  position: relative;
}

.chart-canvas {
  flex: 1;
  height: 100%;
}

.chart-legend {
  width: 45%;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--pie-light);
  transition: var(--pie-transition);
  cursor: pointer;
}

.legend-item:hover {
  background: white;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  transform: translateX(5px);
}

.legend-color {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  margin-right: 12px;
  flex-shrink: 0;
}

.legend-text {
  flex: 1;
  font-weight: 500;
  color: var(--pie-dark);
  font-size: 0.95rem;
}

.legend-value {
  font-weight: 700;
  color: var(--pie-dark);
  min-width: 50px;
  text-align: right;
}

.legend-percentage {
  font-weight: 700;
  color: var(--pie-primary);
  min-width: 60px;
  text-align: right;
  margin-left: 10px;
}

.chart-stats {
  display: flex;
  gap: 15px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid var(--pie-light);
}

.stat-card {
  flex: 1;
  text-align: center;
  padding: 15px;
  border-radius: 12px;
  background: var(--pie-light);
  transition: var(--pie-transition);
}

.stat-card:hover {
  transform: translateY(-5px);
  background: white;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 5px;
}

.stat-value.total { color: var(--pie-primary); }
.stat-value.most { color: var(--pie-success); }
.stat-value.least { color: var(--pie-warning); }

.stat-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--pie-gray);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.no-data-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  z-index: 10;
  padding: 30px;
  text-align: center;
  border-radius: var(--pie-border-radius);
}

.no-data-icon {
  font-size: 4.5rem;
  margin-bottom: 20px;
  color: var(--pie-light);
  position: relative;
}

.no-data-icon::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f0f4ff 0%, #e6eeff 100%);
  z-index: -1;
}

.no-data-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: var(--pie-dark);
}

.no-data-text {
  color: var(--pie-gray);
  max-width: 350px;
  line-height: 1.6;
  margin-bottom: 25px;
}

.refresh-btn {
  padding: 10px 25px;
  background: var(--pie-primary);
  color: white;
  border: none;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: var(--pie-transition);
}

.refresh-btn:hover {
  background: var(--pie-secondary);
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(139, 92, 246, 0.3);
}

/* Responsive Design */
@media (max-width: 768px) {
  .chart-wrapper {
    height: 500px;
  }
  
  .chart-content {
    flex-direction: column;
  }
  
  .chart-legend {
    width: 100%;
    padding-left: 0;
    margin-top: 20px;
    max-height: 200px;
    overflow-y: auto;
  }
  
  .chart-stats {
    flex-wrap: wrap;
  }
  
  .stat-card {
    min-width: calc(50% - 10px);
  }
}

@media (max-width: 480px) {
  .chart-wrapper {
    height: 550px;
    padding: 20px;
  }
  
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .chart-actions {
    align-self: flex-end;
  }
  
  .stat-card {
    min-width: 100%;
  }
  
  .no-data-icon {
    font-size: 3.5rem;
  }
  
  .no-data-title {
    font-size: 1.3rem;
  }
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.chart-wrapper {
  animation: fadeIn 0.6s ease-out;
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.7; }
  50% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.7; }
}

.no-data-icon {
  animation: pulse 2.5s infinite ease-in-out;
}
</style>
