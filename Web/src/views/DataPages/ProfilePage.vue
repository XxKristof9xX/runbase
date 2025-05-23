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
        <div class="text-center mt-4">
          <h5>
            {{ ujVersenyzo ? "Új versenyzői adatok megadása" : "Már regisztrált versenyző hozzárendelése" }}
          </h5>
          <div class="form-check form-switch d-inline-block mt-2" style="transform: scale(1.8);">
            <input class="form-check-input" type="checkbox" id="ujVersenyzoSwitch" v-model="ujVersenyzo">
          </div>
        </div>


        <div v-if="ujVersenyzo">
          <input v-model="newCompetitor.nev" type="text" class="form-control mt-3" placeholder="Név" />
          <input v-model="newCompetitor.szuletesiEv" type="number" class="form-control mt-2"
            placeholder="Születési év" />
          <select v-model="newCompetitor.neme" class="form-select mt-2">
            <option disabled value="">Neme kiválasztása</option>
            <option value="ferfi">Férfi</option>
            <option value="no">Nő</option>
          </select>
          <input v-model="newCompetitor.tajSzam" type="text" class="form-control mt-2" placeholder="TAJ szám" />
          <button class="btn btn-success mt-3" @click="createAndAssignCompetitor">Létrehozás</button>
        </div>
        <div v-else>
          <input v-model="tajszam" type="text" class="form-control mt-2" placeholder="TAJ szám megadása" />
          <button class="btn btn-success mt-2" @click="identifyCompetitor">Azonosítás</button>
        </div>
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
                <v-card class="pa-4 elevation-2">
                  <v-card-title class="text-h6 font-weight-bold">Statisztikai adatok</v-card-title>
                  <v-card-text>
                    <v-row>
                      <v-col cols="12" sm="6" md="4">
                        <strong>Helyezés: </strong> {{ statistics.rank }} / {{ statistics.total }}
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <strong>Medián idő: </strong>
                        <span v-if="statistics.median !== null"> {{ statistics.median.toFixed(2) }} perc</span>
                        <span v-else>N/A</span>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <strong>Saját idő: </strong> {{ statistics.competitorTime.toFixed(2) }} perc
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <strong>Tempó: </strong> {{ statistics.competitorPace.toFixed(2) }} perc/km
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
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
import api from '@/services/api';

export default {
  setup() {
    const router = useRouter();
    const user = ref(null);
    const competitionResults = ref([]);
    const competitorName = ref("");
    const tajszam = ref("");
    const message = ref("");
    const success = ref(false);
    const ujVersenyzo = ref(false);
    const newCompetitor = ref({
      nev: "",
      szuletesiEv: "",
      neme: "",
      tajSzam: "",
    });

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
        api.defaults.headers.common["Authorization"] = `Bearer ${user.value.apiKey}`;
      } else {
        router.push("/login");
      }
    };

    const fetchCompetitorData = async () => {
      if (!user.value.competitorId) return;

      try {
        const competitorResponse = await api.get(
          `/versenyzo/${user.value.competitorId}`
        );
        competitorName.value = competitorResponse.data.nev;
      } catch (error) {
        console.error("Hiba a versenyző lekérésekor:", error);
        competitorName.value = "Ismeretlen";
      }

      try {
        const resultsResponse = await api.get(
          `/versenyindulas/${user.value.competitorId}`
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
        const response = await api.put(
          `/versenyzo/addVersenyzo`,
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
        const response = await api.get(
          "/versenyindulas");
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

        let median = 0;
        const n = allResultsInCategory.length;
        if (n > 0) {
          if (n % 2 === 0) {
            median = (allResultsInCategory[n / 2 - 1].result + allResultsInCategory[n / 2].result) / 2;
          } else {
            median = allResultsInCategory[Math.floor(n / 2)].result;
          }
        } else {
          median = null;
        }
        const filteredResults = allResults.filter(
          (r) => r.versenyId === raceId && r.tav === distanceId
        );

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

    const createAndAssignCompetitor = async () => {
      const adat = newCompetitor.value;

      if (!adat.nev || !adat.szuletesiEv || !adat.neme || !adat.tajSzam) {
        message.value = "Kérlek, töltsd ki az összes mezőt!";
        success.value = false;
        return;
      }

      try {
        const createResponse = await api.post(
          "/versenyzo/hozzaad",
          {
            nev: adat.nev,
            szuletesiEv: adat.szuletesiEv,
            neme: adat.neme,
            tajSzam: adat.tajSzam,
          }
        );
        if (createResponse.status === 200) {
          const getIdResponse = await api.get(
            `/versenyzo/getByTaj/${adat.tajSzam}`
          );
          const versenyzoId = getIdResponse.data.versenyzoId;
          const assignResponse = await api.put(
            "/versenyzo/addVersenyzo",
            {
              tajSzam: adat.tajSzam,
              felhasznaloId: user.value.id,
            }
          );
          if (assignResponse.status === 200) {
            user.value.competitorId = versenyzoId;
            user.value.type = "competitor";

            const updatedUser = {
              id: user.value.id,
              nev: user.value.username,
              tipus: "competitor",
              versenyzoId: versenyzoId,
              apiKey: user.value.apiKey,
            };
            sessionStorage.setItem("user", JSON.stringify(updatedUser));
            message.value = "Versenyző sikeresen létrehozva és hozzárendelve!";
            success.value = true;
            newCompetitor.value = { nev: "", szuletesiEv: "", neme: "", tajSzam: "" };
          } else {
            message.value = "Hiba a hozzárendelés során.";
            success.value = false;
          }
        } else {
          message.value = "Hiba történt a létrehozás során.";
          success.value = false;
        }
      } catch (error) {
        console.error("Hiba:", error);
        message.value = error.response?.data?.message || "Ismeretlen hiba történt.";
        success.value = false;
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
      ujVersenyzo,
      newCompetitor,
      createAndAssignCompetitor,
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
