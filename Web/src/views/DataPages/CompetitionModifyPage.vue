<template>
  <div class="container mt-4">
    <h2 class="mt-5 text-center">Verseny adatok feltöltése</h2>
    <div v-if="isAuthorized">
      <div class="row g-3">
        <div class="col-sm-12 col-md-6">
          <select
            id="postCompetitionId"
            class="form-select"
            @change="postFillUpCompetitionsDistances($event)"
            required
          >
            <option value="" selected disabled hidden>Válasszon egy versenyt!</option>
            <option v-for="a in competitions" :key="a.versenyId" :value="a.versenyId">
              {{ a.nev }}
            </option>
          </select>
        </div>

        <div class="col-sm-12 col-md-6">
          <select id="postDistanceId" class="form-select" required>
            <option value="" selected disabled hidden>Válasszon egy távot!</option>
            <option v-for="a in postCompetitionDistances" :key="a" :value="a">
              {{ a }}
            </option>
          </select>
        </div>

        <div class="col-sm-12 col-md-6 col-lg-4">
          <input type="text" id="postCompetitorId" class="form-control" placeholder="Versenyző ID" required />
        </div>

        <div class="col-sm-12 col-md-6 col-lg-4">
          <input type="datetime-local" id="postStart" class="form-control" placeholder="Indulási idő" required />
        </div>

        <div class="col-sm-12 col-md-6 col-lg-4">
          <input type="datetime-local" id="postFinish" class="form-control" placeholder="Érkezési idő" required />
        </div>

        <div class="col-sm-12 col-md-6">
          <input type="text" id="postStartNumber" class="form-control" placeholder="Rajtszám" required />
        </div>
      </div>

      <div class="d-flex justify-content-center mt-4">
        <button @click="post" class="btn btn-success">Adatok feltöltése!</button>
      </div>
    </div>

    <div v-else class="text-center mt-3">
      <p class="text-danger">Nincs jogosultságod az oldal megtekintéséhez.</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

export default {
  created() {
    axios
      .get("https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/versenyindulas")
      .then((response) => {
        console.log(response.data);
        this.results = response.data;
      })
      .catch((error) => console.log(error));

    axios
      .get("https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/versenyek")
      .then((response) => {
        console.log(this.competitions.data);
        this.competitions = response.data;
      })
      .catch((error) => console.log(error));

    axios
      .get("https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/versenytav")
      .then((response) => {
        console.log(this.competitionDistances.data);
        this.competitionDistances = response.data;
      })
      .catch((error) => console.log(error));

  },
  methods: {
  postFillUpCompetitionsDistances(event) {
      this.postCompetitionDistances = [];
      this.competitionDistances.forEach((element) => {
        if (element.versenyId == event.target.value) {
          this.postCompetitionDistances.push(element.tav);
        }
      });
    },
  },
  setup() {
    const competitions = ref([]);
    const postCompetitionDistances = ref([]);
    const user = ref(null);
    const isAuthorized = ref(false);
    const router = useRouter();

    const loadUserData = () => {
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        user.value = parsedUser;
        isAuthorized.value = ["admin", "organizer"].includes(parsedUser.tipus);
      } else {
        router.push("/login");
      }
    };

    const loadCompetitions = async () => {
      try {
        const response = await axios.get("https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/versenyek");
        competitions.value = response.data;
        console.log("Versenyek betöltve:", competitions.value);
      } catch (error) {
        console.error("Hiba a versenyek betöltésekor:", error);
      }
    };

    const handleCompetitionChange = async (event) => {
      const selectedCompetitionId = event.target.value;
      try {
        const response = await axios.get(`https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/verseny/${selectedCompetitionId}/tavok`);
        postCompetitionDistances.value = response.data;
        console.log("Betöltött távok:", response.data);
      } catch (error) {
        console.error("Hiba a távok betöltésekor:", error);
      }
    };
    

    const post = async () => {
      const competitionId = document.getElementById("postCompetitionId").value;
      const distanceId = document.getElementById("postDistanceId").value;
      const competitorId = document.getElementById("postCompetitorId").value;
      const startTime = document.getElementById("postStart").value;
      const finishTime = document.getElementById("postFinish").value;
      const startNumber = document.getElementById("postStartNumber").value;

      if (!competitionId || !distanceId || !competitorId || !startTime || !finishTime || !startNumber) {
        alert("Nincs minden mező kitöltve!");
        return;
      }

      const article = {
        versenyzoId: competitorId,
        versenyId: competitionId,
        tav: distanceId,
        indulas: startTime,
        erkezes: finishTime,
        rajtszam: startNumber,
      };

      try {
        await axios.post("https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/versenyindulas", article);
        alert("Sikeres feltöltés!");
      } catch (error) {
        console.error("Hiba történt a feltöltés során:", error);
        alert("Hiba történt a feltöltés során.");
      }
    };

    onMounted(() => {
      loadUserData();
      loadCompetitions();
    });

    return {
      competitions,
      postCompetitionDistances,
      handleCompetitionChange,
      post,
      isAuthorized,
      competitionDistances: [],
    };
  },
};
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: auto;
}
</style>
