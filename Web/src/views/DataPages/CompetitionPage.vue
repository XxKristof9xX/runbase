<template>
  <h1 class="my-3 text-center">Versenyek</h1>
  <v-container>
    <v-row justify="center">
      <v-col v-for="c in competitions" :key="c.id" cols="12" sm="6" md="4" lg="3">
        <v-card class="hoverable" :to="{
          name: 'CompetitionDetails',
          params: { nev: c.nev },
          query: {
            id: c.versenyId,
            helyszin: c.helyszin,
            datum: c.datum,
            leiras: c.leiras,
            max_letszam: c.maxLetszam,
            kep: c.kep,
          },
        }">
          <v-img v-if="c.kep" :src="getImage(c.kep)" cover></v-img>
          <v-card-title class="text-center">{{ c.nev }}</v-card-title>
          <v-card-actions>
            <v-btn color="primary">
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
import FutoVersenyLogo from "@/assets/Futoverseny_logo_pelda.jpg";
import api from '@/services/api';

export default {
  data() {
    return {
      competitions: [],
      loading: true,
      futoVersenyLogo: FutoVersenyLogo,
    };
  },
  created() {
    api
      .get("/versenyek")
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
<style>
v-card img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
