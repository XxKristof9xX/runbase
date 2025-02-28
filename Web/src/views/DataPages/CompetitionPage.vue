<template>
  <h1 class="my-3 text-center">Versenyek</h1>
  <div class="container">
    <div class="row justify-content-center">
      <div
        class="card mx-2 my-3"
        style="width: 18rem;"
        v-for="c in competitions"
        :key="c.id"
      >
        <div class="card-header text-center">
          <h2 class="card-title">{{ c.nev }}</h2>
        </div>
        <div class="card-body text-center">
          <img
            class="img-fluid"
            src="../../assets/Futoverseny_logo_pelda.jpg"
            alt="Verseny logó"
          />
        </div>
        <div class="card-footer text-center">
          <router-link
  :to="{
    name: 'CompetitionDetails',
    params: { nev: c.nev },
    query: {
      helyszin: c.helyszin,
      datum: c.datum,
      leiras: c.leiras,
      max_letszam: c.max_letszam,
    },
  }"
>
  <span class="btn btn-info">További információk</span>
</router-link>
        </div>
      </div>
    </div>
  </div>
  <router-view />
</template>


<script>
import axios from "axios";
export default {
  data() {
    return {
      competitions: [],
    };
  },
  created() {
    axios
      .get("runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/versenyek")
      .then((response) => {
        console.log(response.data);
        this.competitions = response.data;
      })
      .catch((error) => console.log(error));
  },
};
</script>

<style scoped>
div.card {
  /*background-color: #ADD8E6;*/
  border-color: #20283f;
}
div.card-header {
  background-color: #add8e6;
  font-size: 10rem !important;
}

div.row {
  margin: 10px;
}
h3 {
  padding-top: 10px;
  color: black;
}

h1 {
  font-size: 3em;
}
img{
  /* width: 10em; */
}
</style>