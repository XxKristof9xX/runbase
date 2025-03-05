<template>
  <div class="container mt-4">
    <h1>Profil</h1>
    <div v-if="user">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Felhasználónév: <strong>{{ user.username }}</strong></h5>
          <p class="card-text"><strong>Felhasználó típus:</strong> {{ user.type }}</p>
          <p class="card-text"><strong>Versenyző azonosító:</strong> {{ user.competitorId || "Nincs hozzárendelve" }}</p>
        </div>
      </div>

      <button
        v-if="user.competitorId"
        type="button"
        class="btn btn-primary mt-3"
        data-bs-toggle="modal"
        data-bs-target="#exampleModal6"
        @click="fetchCompetitorData"
      >
        Leírás
      </button>

      <button class="btn btn-danger mt-3 ms-2" @click="logout">Kijelentkezés</button>

      <!-- Modal -->
      <div
        class="modal fade bd-example-modal-lg"
        id="exampleModal6"
        tabindex="-1"
        aria-labelledby="exampleModalLabel6"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title text-danger" id="exampleModalLabel6">
                Üdvözöljük, {{ competitorName || "Versenyző" }}!
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <h4 class="text-start">Versenyeken elért eredményeid:</h4>

              <div class="table-wrapper-scroll-y my-custom-scrollbar">
                <table class="table mt-3">
                  <tr>
                    <th>VersenyID</th>
                    <th>TávID</th>
                    <th>NévID</th>
                    <th>Indulási idő</th>
                    <th>Érkezési idő</th>
                    <th>Rajtszám</th>
                  </tr>
                  <tr v-for="r in competitionResults" :key="r.id">
                    <td>{{ r.versenyId }}</td>
                    <td>{{ r.tav }}</td>
                    <td>{{ r.versenyzoId }}</td>
                    <td>{{ r.indulas }}</td>
                    <td>{{ r.erkezes }}</td>
                    <td>{{ r.rajtszam }}</td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Modal vége -->
    </div>
    <div v-else>
      <p>Nincs bejelentkezett felhasználó.</p>
      <router-link to="/login" class="btn btn-primary">Bejelentkezés</router-link>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

export default {
  setup() {
    const router = useRouter();
    const user = ref(null);
    const competitionResults = ref([]);
    const competitorName = ref("");

    // Felhasználói adatok betöltése
    const loadUserData = () => {
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        user.value = {
          id: parsedUser.id,
          username: parsedUser.nev,
          type: parsedUser.tipus,
          competitorId: parsedUser.versenyzoId,
        };
      } else {
        router.push("/login");
      }
    };

    // Versenyző adatainak és eredményeinek lekérése
    const fetchCompetitorData = async () => {
      if (!user.value.competitorId) return;
      try {
        const [competitorResponse, resultsResponse] = await Promise.all([
          axios.get(`https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/versenyzo/${user.value.competitorId}`),
          axios.get(`https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/versenyindulas/${user.value.competitorId}`)
        ]);
        
        competitorName.value = competitorResponse.data.nev;
        competitionResults.value = resultsResponse.data;
      } catch (error) {
        console.error("Hiba történt az adatok lekérésekor:", error);
        competitorName.value = "Ismeretlen versenyző";
        competitionResults.value = [];
      }
    };

    // Kijelentkezés
    const logout = () => {
      sessionStorage.removeItem("user");
      window.dispatchEvent(new Event("loginStatusChanged"));
      router.push("/");
    };

    onMounted(loadUserData);

    return {
      user,
      logout,
      competitionResults,
      competitorName,
      fetchCompetitorData,
    };
  },
};
</script>

<style scoped>
.card {
  max-width: 400px;
  margin: auto;
}
</style>
