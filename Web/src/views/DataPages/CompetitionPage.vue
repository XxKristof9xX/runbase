<template>
  <h1 class="my-3 text-center">Versenyek</h1>
  <v-container>
    <v-row justify="center" v-if="loading">
      <v-col v-for="i in 6" :key="i" cols="12" sm="6" md="4" lg="3">
        <v-card>
          <v-card-title class="text-center">
            <v-skeleton-loader type="text"></v-skeleton-loader>
          </v-card-title>
          <v-card-text class="d-flex justify-center">
            <v-skeleton-loader type="image"></v-skeleton-loader>
          </v-card-text>
          <v-card-actions class="justify-center">
            <v-skeleton-loader type="button"></v-skeleton-loader>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-row justify="center" v-else>
      <v-col v-for="c in competitions" :key="c.id" cols="12" sm="6" md="4" lg="3">
        <v-card>
          <v-img height="400px" v-if="c.kep" :src="getImage(c.kep)" cover></v-img>
          <v-card-title class="text-center">{{ c.nev }}</v-card-title>
          <v-card-actions>
            <v-btn 
              color="primary" 
              :to="{
                name: 'CompetitionDetails',
                params: { nev: c.nev },
                query: {
                  helyszin: c.helyszin,
                  datum: c.datum,
                  leiras: c.leiras,
                  max_letszam: c.maxLetszam,
                  kep: c.kep,
                },
              }"
            >
              További információk
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
  <router-view />
</template>

<script>
import axios from "axios";
import FutoVersenyLogo from "@/assets/Futoverseny_logo_pelda.jpg";

export default {
  data() {
    return {
      competitions: [],
      loading: true,
      futoVersenyLogo: FutoVersenyLogo,
    };
  },
  created() {
    axios
      .get("https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/versenyek")
      .then((response) => {
        this.competitions = response.data;
        this.loading = false;
      })
      .catch((error) => {
        console.log(error);
        this.loading = false;
      });
  },
  methods: {
  getImage(base64Data) {
    return `data:image/jpeg;base64,${base64Data}`;
  }
}
};
</script>
