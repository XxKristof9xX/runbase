<template>
  <div class="container mt-4">
    <h1>Profil</h1>
    <div v-if="user">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Felhasználónév: <strong>{{ user.username }}</strong></h5>
          <p class="card-text"><strong>Felhasználó típus:</strong> {{ user.type }}</p>
          <p class="card-text"><strong>Versenyző azonosító:</strong> {{ user.competitorId || "Nincs hozzárendelve" }}
          </p>
        </div>
      </div>

      <div v-if="!user.competitorId">
        <h5 class="mt-3">Versenyző azonosítása</h5>
        <input v-model="tajszam" type="text" class="form-control mt-2" placeholder="TAJ szám megadása" />
        <button class="btn btn-success mt-2" @click="identifyCompetitor">Azonosítás</button>
        <p v-if="message" :class="{ 'text-success': success, 'text-danger': !success }">{{ message }}</p>
      </div>

      <button v-if="user.competitorId" type="button" class="btn btn-primary mt-3" data-bs-toggle="modal"
        data-bs-target="#exampleModal6" @click="fetchCompetitorData">
        Leírás
      </button>

      <button class="btn btn-danger mt-3 ms-2" @click="logout">Kijelentkezés</button>

      <div class="modal fade bd-example-modal-lg" id="exampleModal6" tabindex="-1" aria-labelledby="exampleModalLabel6"
        aria-hidden="true">
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
                  <thead>
                    <tr>
                      <th>VersenyID</th>
                      <th>TávID</th>
                      <th>NévID</th>
                      <th>Indulási idő</th>
                      <th>Érkezési idő</th>
                      <th>Rajtszám</th>
                      <th>Statisztika</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="r in competitionResults" :key="r.id">
                      <td>{{ r.versenyId }}</td>
                      <td>{{ r.tav }}</td>
                      <td>{{ r.versenyzoId }}</td>
                      <td>{{ r.indulas }}</td>
                      <td>{{ r.erkezes }}</td>
                      <td>{{ r.rajtszam }}</td>
                      <td>
                        <button class="btn btn-sm btn-info" @click="calculateStatistics(r.versenyId, r.tav)">
                          Statisztika
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-if="statistics" class="mt-4">
                <h5>Statisztikai adatok</h5>
                <p v-if="statistics.error" class="text-danger">
                  <strong>Hiba:</strong> {{ statistics.error }}
                </p>
                <p v-else>
                  <strong>Helyezés a kategóriában: </strong> {{ statistics.rank }}.
                </p>
                <p><strong>Adott versenykategóriában elindult versenyzők:</strong> {{ statistics.total }}</p>
                <p><strong>Medián idő:</strong> {{ statistics.median }} perc</p>
                <p><strong>Versenyző idő:</strong> {{ Math.round(statistics.competitorTime * 100) / 100 }} perc</p>
                <p><strong>Versenyző tempója:</strong> {{ Math.round(statistics.competitorPace * 100) / 100 }} perc/km
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
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
    const tajszam = ref("");
    const message = ref("");
    const success = ref(false);

    const loadUserData = () => {
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        user.value = {
          id: parsedUser.id,
          username: parsedUser.nev,
          type: parsedUser.tipus,
          competitorId: parsedUser.versenyzoId,
          apiKey: parsedUser.apiKey,
        };
        axios.defaults.headers.common["Authorization"] = `Bearer ${user.value.apiKey}`;
      } else {
        router.push("/login");
      }
    };

    const fetchCompetitorData = async () => {
      if (!user.value.competitorId) return;

      try {
        const competitorResponse = await axios.get(
          `https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/versenyzo/${user.value.competitorId}`
        );
        competitorName.value = competitorResponse.data.nev;
      } catch (error) {
        console.error("Hiba a versenyző lekérésekor:", error);
        competitorName.value = "Ismeretlen";
      }

      try {
        const resultsResponse = await axios.get(
          `https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/versenyindulas/${user.value.competitorId}`
        );
        competitionResults.value = resultsResponse.data;
      } catch (error) {
        console.warn("Nincs versenyindulási adat:", error);
        competitionResults.value = [];
      }
    };


    const identifyCompetitor = async () => {
      if (!tajszam.value) {
        message.value = "Kérlek, add meg a TAJ számot!";
        success.value = false;
        return;
      }

      try {
        const response = await axios.put(
          `https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/versenyzo/addVersenyzo`,
          {
            tajSzam: tajszam.value,
            felhasznaloId: user.value.id,
          }
        );

        if (response.status === 200 && response.data.versenyzoId) {
          user.value = {
            id: user.value.id,
            username: user.value.username,
            apiKey: user.value.apiKey,
            competitorId: response.data.versenyzoId,
            type: "competitor",
          };
          sessionStorage.setItem("user", JSON.stringify(user));

          message.value = "Azonosítás sikeres!";
          success.value = true;
          tajszam.value = "";
        } else {
          message.value = "Azonosítás sikertelen, próbáld újra!";
          success.value = false;
        }
      } catch (error) {
        console.error("Hiba történt az azonosításkor:", error);
        message.value = error.response?.data?.message || "Hiba történt az azonosítás során.";
        success.value = false;
      }
    };


    const statistics = ref(null);

    const calculateStatistics = async (raceId, distanceId) => {
      try {
        const response = await axios.get(
          "https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/versenyindulas");
        const allResults = response.data;

        const allResultsInCategory = [];
        const alapDatum = "2025-03-11";

        allResults.forEach((result) => {
          if (result.versenyId === raceId && result.tav === distanceId) {
            const differentiesInMs = new Date(`${alapDatum}T${result.erkezes}`) - new Date(`${alapDatum}T${result.indulas}`);
            const differentiesInMin = differentiesInMs / 60000;
            allResultsInCategory.push(
              {
                id: result.versenyzoId,
                result: differentiesInMin
              }
            );
          }
        });
        allResultsInCategory.sort((a, b) => a.result - b.result);

        const rank = allResultsInCategory.findIndex(result => result.id === user.value.competitorId) + 1;

        let median;
        if (allResultsInCategory.length % 2 === 0) {
          const mid1 = allResultsInCategory[allResultsInCategory.length / 2 - 1];
          const mid2 = allResultsInCategory[allResultsInCategory.length / 2];
          median = (mid1 + mid2) / 2;
        } else {
          median = allResultsInCategory[Math.floor(allResultsInCategory.length + 1 / 2)];
        }
        const filteredResults = allResults.filter(
          (r) => r.versenyId === raceId && r.tav === distanceId
        );
        console.log(median);

        if (!filteredResults.length) {
          statistics.value = null;
          return;
        }

        const competitorResult = competitionResults.value.find(
          (r) => r.versenyId === raceId && r.tav === distanceId
        );
        if (!competitorResult) {
          statistics.value = null;
          return;
        }

        const competitorTime = (new Date(`${alapDatum}T${competitorResult.erkezes}`) - new Date(`${alapDatum}T${competitorResult.indulas}`)) / 60000;

        const competitorPace = competitorTime / competitorResult.tav;


        statistics.value = {
          rank,
          total: allResultsInCategory.length,
          median,
          competitorTime,
          competitorPace,
        };
      } catch (error) {
        console.error("Hiba a statisztika számításakor:", error);
        statistics.value = null;
      }
    };

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
      tajszam,
      identifyCompetitor,
      message,
      success,
      statistics,
      calculateStatistics,
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
