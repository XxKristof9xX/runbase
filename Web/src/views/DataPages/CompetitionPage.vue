<template>
  <h1 class="my-3 text-center">Versenyek</h1>
  <div class="container">
    <div class="row justify-content-center" v-if="loading">
      <div class="card mx-2 my-3" style="width: 18rem;" v-for="i in 6" :key="i">
        <div class="card-header text-center">
          <div class="skeleton-header"></div>
        </div>
        <div class="card-body text-center d-flex flex-column justify-content-center">
          <div class="skeleton-image"></div>
        </div>
        <div class="card-footer text-center">
          <div class="skeleton-button"></div>
        </div>
      </div>
    </div>
    <div class="row justify-content-center" v-else>
      <div
        class="card mx-2 my-3"
        style="width: 18rem;"
        v-for="c in competitions"
        :key="c.id"
      >
        <div class="card-header text-center">
          <h2 class="card-title">{{ c.nev }}</h2>
        </div>
        <div class="card-body text-center d-flex flex-column justify-content-center">
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
                max_letszam: c.maxLetszam,
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
      loading: true,
    };
  },
  created() {
    axios
      .get("https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/versenyek")
      .then((response) => {
        console.log(response.data);
        this.competitions = response.data;
        this.loading = false;
      })
      .catch((error) => {
        console.log(error);
        this.loading = false;
      });
  },
};
</script>

<style scoped>
.card {
  border-color: #20283f;
  padding: 0;
}

.card-header {
  background-color: #add8e6;
  height: 8em; 
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.5em;
}

.card-title {
  margin: 0;
  padding: 0;
  font-size: 1.2rem;
  word-break: break-word;
}

.card-body {
  height: 200px;
}

.row {
  margin: 10px;
}

h1 {
  font-size: 3em;
}

img {
  width: 10em;
}
.skeleton-header {
  width: 80%;
  height: 30px;
  background-color: #f2f2f2;
  margin: 0 auto;
  border-radius: 5px;
  animation: skeleton-loading 1.2s linear infinite alternate;
}

.skeleton-image {
  width: 8em;
  height: 8em;
  background-color: #f2f2f2;
  margin: 0 auto;
  border-radius: 50%;
  animation: skeleton-loading 1.2s linear infinite alternate;
}

.skeleton-button {
  width: 60%;
  height: 35px;
  background-color: #f2f2f2;
  margin: 0 auto;
  border-radius: 5px;
  animation: skeleton-loading 1.2s linear infinite alternate;
}

@keyframes skeleton-loading {
  0% {
    background-color: #f2f2f2;
  }
  100% {
    background-color: #ddd;
  }
}
</style>