<template>
  <div id="app">
     <Net />
  </div>
</template>

<script>
import Net from './components/net.vue'

export default {
  name: 'App',
  components: {
    Net
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 30px auto;
  max-width: 1080px;
}
</style>
