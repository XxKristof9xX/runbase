<template>
  <div class="container mt-4">
    <h2 class="mt-5">Verseny adatok feltöltése</h2>
    <div v-if="isAuthorized">
      <div>
        <select
          id="postCompetitionId"
          class="col-2 post-select"
          @change="postFillUpCompetitionsDistances($event)"
          required
        >
          <option value="" selected disabled hidden>Válasszon egy versenyt!</option>
          <option v-for="a in competitions" :key="a.versenyId" :value="a.versenyId">
            {{ a.nev }}
          </option>
        </select>
        
        <select id="postDistanceId" class="col-2 post-select" required>
          <option value="" selected disabled hidden>Válasszon egy távot!</option>
          <option v-for="a in postCompetitionDistances" :key="a" :value="a">
            {{ a }}
          </option>
        </select>
        
        <input type="text" id="postCompetitorId" class="col-2" placeholder="Versenyző ID" required />
        <input type="text" id="postStart" class="col-2" placeholder="Indulási idő" required />
        <input type="text" id="postFinish" class="col-2" placeholder="Érkezési idő" required />
        <input type="text" id="postStartNumber" class="col-2" placeholder="Rajtszám" required />
      </div>

      <div class="mt-4">
        <button @click="post" class="col-3 btn btn-success">Adatok feltöltése!</button>
      </div>
    </div>
    <div v-else>
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
    fillup(event) {
      document.getElementById("selectedDistance").selectedIndex = 0;
      this.selectedCompetitionDistances = [];
      
      (this.competitionDistanceIds = []),
        (this.selectedCompetitionDistances = []),
        this.competitionDistances.forEach((element) => {
          if (element.versenyId == event.target.selectedIndex) {
            this.selectedCompetitionDistances.push(element);
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

    const postFillUpCompetitionsDistances = async (event) => {
      const selectedCompetitionId = event.target.value;
      try {
        const response = await axios.get(`https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/verseny/${selectedCompetitionId}/tavok`);
        postCompetitionDistances.value = response.data;
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
    });

    return {
      competitions,
      postCompetitionDistances,
      postFillUpCompetitionsDistances,
      post,
      isAuthorized,
    };
  },
};
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: auto;
}
.post-select {
  margin-right: 10px;
}
</style>
