<template>
  <h1 class="my-3">Eredmények</h1>
  <div class="container">
    <div class="row">
      <div class="col-6">
        <select
          class="form-select"
          @change="fillup($event), competitionResult()"
          Id="selectedCompetition"
        >
          <option value="" selected disabled hidden>
            Válasszon egy versenyt!
          </option>
          <option v-for="a in competitions" :key="a.nev" v-bind:value="a.nev">
            {{ a.nev }}
          </option>
        </select>
      </div>

      <div class="col-6">
        <select
          class="form-select"
          Id="selectedDistance"
          @change="competitionResult()"
        >
          <option value="" selected disabled hidden>
            Válasszon egy távot!
          </option>
          <option
            v-for="a in selectedCompetitionDistances"
            :key="a.tavId"
            v-bind:value="JSON.stringify(a)"
          >
            {{ a.tav }} km
          </option>
        </select>
      </div>

      <div class="table-wrapper-scroll-y my-custom-scrollbar mt-2">
        <table class="table mt-3">
          <tr>
            <th>
              <input
                type="button"
                @click="sortedByCompetitionId()"
                class="btn btn-light"
                value="Verseny Azonosító"
              />
            </th>
            <th>
              <input
                type="button"
                @click="sortedByDistanceId()"
                class="btn btn-light"
                value="Távok"
              />
            </th>
            <th>
              <input
                type="button"
                @click="sortedByNameId()"
                class="btn btn-light"
                value="Versenyző Azonosító"
              />
            </th>
            <th>
              <input
                type="button"
                class="btn btn-light"
                value="Indulási Idő"
              />
            </th>
            <th>
              <input
                type="button"
                class="btn btn-light"
                value="Érkezési Idő"
              />
            </th>
            <th>
              <input
                type="button"
                @click="sortedByStartNumber()"
                class="btn btn-light"
                value="Rajtszám"
              />
            </th>
          </tr>
          <tr v-for="r in competitionResults" :key="r.Id">
            <td>{{ r.versenyId }}</td>
            <td>{{ r.tav }} km</td>
            <td>{{ r.versenyzoId }}</td>
            <td>{{ r.indulas }}</td>
            <td>{{ r.erkezes }}</td>
            <td>{{ r.rajtszam }}</td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

export default {
  setup() {
    const user = ref(null);
    const isAuthorized = ref(false);
    const router = useRouter();

    const loadUserData = () => {
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        user.value = {
          apiKey: parsedUser.apiKey,
        };
        isAuthorized.value = ["admin", "organizer","user","competitor"].includes(parsedUser.tipus);
        axios.defaults.headers.common["Authorization"] = `Bearer ${user.value.apiKey}`;
      } else {
        router.push("/login");
      }
    };

    loadUserData();

    return {
      isAuthorized,
    };
  },
  data() {
    return {
      results: [],
      competitionResults: [],
      competitions: [],
      distances: [],
      sortedResults: [],
      competitionDistances: [],
      competitionDistanceIds: [],
      selectedCompetitionDistances: [],
      postCompetitionDistances: [],
      ascDesc: 0,
    };
  },

  created() {
    if (this.isAuthorized) {
      axios.get("https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/versenyindulas")
        .then((response) => {
          this.results = response.data;
        })
        .catch((error) => console.log(error));

      axios.get("https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/versenyek")
        .then((response) => {
          this.competitions = response.data;
        })
        .catch((error) => console.log(error));

      axios.get("https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/versenytav")
        .then((response) => {
          this.competitionDistances = response.data;
        })
        .catch((error) => console.log(error));
    }
  },
  methods: {
    fillup(event) {
      document.getElementById("selectedDistance").selectedIndex = 0;
      this.selectedCompetitionDistances = [];

      this.competitionDistanceIds = [];
      this.selectedCompetitionDistances = [];
      this.competitionDistances.forEach((element) => {
        if (element.versenyId == event.target.selectedIndex) {
          this.selectedCompetitionDistances.push(element);
        }
      });
    },

    competitionResult() {
      this.competitionResults = [];
      var selectedDistanceId = 0;

      if (document.getElementById("selectedDistance").selectedIndex == 0) {
        this.results.forEach((element) => {
          if (
            element.versenyId ==
            document.getElementById("selectedCompetition").selectedIndex
          ) {
            this.competitionResults.push(element);
          }
        });
      } else {
        selectedDistanceId = document.getElementById("selectedDistance").value.match(/(\d+)/)[0];

        this.results.forEach((element) => {
          if (
            element.versenyId ==
              document.getElementById("selectedCompetition").selectedIndex &&
            element.tav == selectedDistanceId
          ) {
            this.competitionResults.push(element);
          }
        });
      }
    },
    sortedByCompetitionId() {
      if (this.ascDesc % 2 == 0) {
        this.competitionResults.sort((a, b) => a.versenyId - b.versenyId);
      } else {
        this.competitionResults.sort((a, b) => b.versenyId - a.versenyId);
      }
      this.ascDesc += 1;
    },

    sortedByDistanceId() {
      if (this.ascDesc % 2 == 0) {
        this.competitionResults.sort((a, b) => a.tav - b.tav);
      } else {
        this.competitionResults.sort((a, b) => b.tav - a.tav);
      }
      this.ascDesc += 1;
    },

    sortedByNameId() {
      if (this.ascDesc % 2 == 0) {
        this.competitionResults.sort((a, b) => a.versenyzoId - b.versenyzoId);
      } else {
        this.competitionResults.sort((a, b) => b.versenyzoId - a.versenyzoId);
      }
      this.ascDesc += 1;
    },
    sortedByStartNumber() {
      if (this.ascDesc % 2 == 0) {
        this.competitionResults.sort((a, b) => a.rajtszam - b.rajtszam);
      } else {
        this.competitionResults.sort((a, b) => b.rajtszam - a.rajtszam);
      }
      this.ascDesc += 1;
    },
  },
};
</script>

<style>
h1 {
  font-size: 1000px;
}

.my-custom-scrollbar {
  position: relative;
  height: 400px;
  overflow: auto;
}
.table-wrapper-scroll-y {
  display: block;
}

th {
  position: sticky;
  top: 0;
  background-color: white;
}
.post-select{
  height: 30px !important;
}
h1 {
  font-size: 3em;
}
</style>