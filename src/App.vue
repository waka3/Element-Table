<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <EasyTable :data="data" :columns="columns" />
  </div>
</template>

<script>
import EasyTable from './components/EasyTable/index'
export default {
  name: "App",
  components: {
    EasyTable,
  },
  data() {
    return {
      data: [
        { name: "xxxx", age: 14, weight: 48 },
        { name: "111", age: 18, weight: 49 },
        { name: "111", age: 18, weight: 50 },
        { name: "22", age: 14, weight: 45 },
        { name: "33", age: 18, weight: 46 },
        { name: "444", age: 14, weight: 40 },
      ],
      columns: [
        { prop: "name", label: "姓名" },
        { prop: "age", label: "年龄" },
        { prop: "weight", label: "身高" },
      ],
    };
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
