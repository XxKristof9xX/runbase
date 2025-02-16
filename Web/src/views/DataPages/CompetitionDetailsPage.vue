<template>
  <div class="container">
    <div class="col-12 pb-5">
      <h1>{{ $route.params.nev }}</h1>
    </div>

    <div class="col-12">
      <p>Helyszín: {{ $route.query.helyszin }}</p>
      <p>Időpont: {{ $route.query.datum }}</p>
      <p>Maximális létszám: {{ $route.query.max_letszam }} fő</p>
    </div>
    <div class="col-12">
      <p>{{ $route.query.leiras }}</p>
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
    console.log("Route params:", this.$route.params);
    console.log("Route query:", this.$route.query);
  },
};
</script>
