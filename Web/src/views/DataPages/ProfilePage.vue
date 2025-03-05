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

      <!-- Gomb csak akkor látható, ha van competitorId -->
      <button
        v-if="user.competitorId"
        type="button"
        class="btn btn-primary mt-3"
        data-bs-toggle="modal"
        data-bs-target="#exampleModal6"
        @click="fetchCompetitionResults"
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
              <h5 class="modal-title text-danger" id="exampleModalLabel6">Üdvözöljük!</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <h4 class="text-start">Versenyeken elért eredményeid:</h4>

              <!-- Betöltési állapot -->
              <div v-if="isLoading">Adatok betöltése...</div>
              <div v-else-if="errorMessage" class="text-danger">{{ errorMessage }}</div>

              <!-- Ha vannak eredmények, megjelenítés táblázatban -->
              <div v-else-if="competitionResults.length">
                <div class="table-wrapper-scroll-y my-custom-scrollbar">
                  <table class="table mt-3">
                    <thead>
                      <tr>
                        <th><button @click="sortedByCompetitionID" class="btn btn-light">VersenyID</button></th>
                        <th><button @click="sortedByDistanceID" class="btn btn-light">TávID</button></th>
                        <th><button @click="sortedByStart" class="btn btn-light">Indulási idő</button></th>
                        <th><button @click="sortedByFinish" class="btn btn-light">Érkezési idő</button></th>
                        <th><button @click="sortedByStartNumber" class="btn btn-light">Rajtszám</button></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="r in competitionResults" :key="r.id">
                        <td>{{ r.versenyId }}</td>
                        <td>{{ r.tav }}</td>
                        <td>{{ r.indulas }}</td>
                        <td>{{ r.erkezes }}</td>
                        <td>{{ r.rajtszam }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div v-else>Nincsenek versenyindulási adatok.</div>
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
    const isLoading = ref(false);
    const errorMessage = ref("");

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

    // Versenyindulási adatok lekérése API-ból
    const fetchCompetitionResults = async () => {
      if (!user.value.competitorId) return;

      isLoading.value = true;
      errorMessage.value = "";
      competitionResults.value = [];

      try {
        const response = await axios.get(
          `https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/versenyindulas/${user.value.competitorId}`
        );
        competitionResults.value = response.data;
      } catch (error) {
        errorMessage.value =
          error.response?.data || "Hiba történt az adatok lekérésekor.";
      } finally {
        isLoading.value = false;
      }
    };

    // Kijelentkezés
    const logout = () => {
      sessionStorage.removeItem("user");
      window.dispatchEvent(new Event("loginStatusChanged"));
      router.push("/");
    };

    // Eredmények rendezése
    const sortedByCompetitionID = () => {
      competitionResults.value.sort((a, b) => a.versenyId - b.versenyId);
    };
    const sortedByDistanceID = () => {
      competitionResults.value.sort((a, b) => a.tav - b.tav);
    };
    const sortedByStart = () => {
      competitionResults.value.sort((a, b) => new Date(a.indulas) - new Date(b.indulas));
    };
    const sortedByFinish = () => {
      competitionResults.value.sort((a, b) => new Date(a.erkezes) - new Date(b.erkezes));
    };
    const sortedByStartNumber = () => {
      competitionResults.value.sort((a, b) => a.rajtszam - b.rajtszam);
    };

    onMounted(loadUserData);

    return {
      user,
      logout,
      competitionResults,
      fetchCompetitionResults,
      isLoading,
      errorMessage,
      sortedByCompetitionID,
      sortedByDistanceID,
      sortedByStart,
      sortedByFinish,
      sortedByStartNumber,
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
