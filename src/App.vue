<template>
  <div id="app">
    <MainHeader />
    
    <main class="page">
      <router-view />
    </main>
    
    <MainFooter />
  </div>
</template>

<script lang="ts" setup>
import MainHeader from './components/includes/MainHeader.vue';
import MainFooter from './components/includes/MainFooter.vue';
</script>