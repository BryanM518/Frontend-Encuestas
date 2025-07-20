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
import MainHeader from './layouts/MainHeader.vue';
import MainFooter from './layouts/MainFooter.vue';
</script>