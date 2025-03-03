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

      <!-- Leírás gomb (csak ha van versenyző ID) -->
      <button
        v-if="user.competitorId"
        type="button"
        class="btn btn-primary mt-3"
        data-bs-toggle="modal"
        data-bs-target="#exampleModal6"
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

              <div class="table-wrapper-scroll-y my-custom-scrollbar">
                <table class="table mt-3">
                  <tr>
                    <th>
                      <input type="button" @click="sortedByCompetitionID()" class="btn btn-light" value="VersenyID" />
                    </th>
                    <th>
                      <input type="button" @click="sortedByDistanceID()" class="btn btn-light" value="TávID" />
                    </th>
                    <th>
                      <input type="button" @click="sortedByNameID()" class="btn btn-light" value="NévID" />
                    </th>
                    <th>
                      <input type="button" @click="sortedByStart()" class="btn btn-light" value="Indulási idő" />
                    </th>
                    <th>
                      <input type="button" @click="sortedByFinish()" class="btn btn-light" value="Érkezési idő" />
                    </th>
                    <th>
                      <input type="button" @click="sortedByStartNumber()" class="btn btn-light" value="Rajtszám" />
                    </th>
                  </tr>
                  <tr v-for="r in competitionResults" :key="r.id">
                    <td>{{ r.versenyID }}</td>
                    <td>{{ r.tav }}</td>
                    <td>{{ r.versenyzoID }}</td>
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

export default {
  setup() {
    const router = useRouter();
    const user = ref(null);
    const competitionResults = ref([]);

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

    // Kijelentkezés
    const logout = () => {
      sessionStorage.removeItem("user");
      window.dispatchEvent(new Event("loginStatusChanged"));
      router.push("/");
    };

    // Eredmények rendezése
    const sortedByCompetitionID = () => {
      competitionResults.value.sort((a, b) => a.versenyID - b.versenyID);
    };
    const sortedByDistanceID = () => {
      competitionResults.value.sort((a, b) => a.tav - b.tav);
    };
    const sortedByNameID = () => {
      competitionResults.value.sort((a, b) => a.versenyzoID.localeCompare(b.versenyzoID));
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
      sortedByCompetitionID,
      sortedByDistanceID,
      sortedByNameID,
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
