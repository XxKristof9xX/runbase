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
            <th>
              <input
                type="button"
                @click="sortedByRunTime()"
                class="btn btn-light"
                value="Eltelt idő"
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
            <td>{{ Math.round(r.difference_minutes* 100) / 100 }} perc</td>
          </tr>
        </table>
      </div>
      
    </div>
    <br>
    <div class="chart-container" style="position: relative; height:20vh; width:80vw">
        <canvas id="myChart"></canvas>
      </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

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
      myChart: null
    };
  },

  created() {
    if (this.isAuthorized) {
      axios.get("https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/versenyindulas")
        .then((response) => {
          this.results = response.data;
          this.results.forEach(result => {
            const indulasTime = result.indulas;
            const erkezesTime = result.erkezes;
             const alapDatum = "2025-03-11";
            if (!indulasTime || !erkezesTime) {
              console.error("Invalid date found:", indulasTime, erkezesTime);
              result.difference_minutes = NaN;
            } else {
              const startTime = new Date(`${alapDatum}T${indulasTime}`);
              const endTime = new Date(`${alapDatum}T${erkezesTime}`);
                if (isNaN(startTime) || isNaN(endTime)) {
                  console.error("Invalid date found:", indulasTime, erkezesTime);
                  result.difference_minutes = NaN;
                }
                else{
                  result.difference_minutes = (endTime - startTime) / (1000 * 60);
                }
            }
          });
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
  mounted() {
      this.renderChart();
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
        this.renderChart();
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
    sortedByRunTime() {
      if (this.ascDesc % 2 == 0) {
        this.competitionResults.sort((a, b) => a.difference_minutes - b.difference_minutes);
      } else {
        this.competitionResults.sort((a, b) => b.difference_minutes - a.difference_minutes);
      }
      this.ascDesc += 1;
    },
    renderChart() {
    const ctx = document.getElementById('myChart');
    if (!ctx) {
        console.error("Canvas element with id 'myChart' not found!");
        return;
    }

    const chartCtx = ctx.getContext('2d');
    if (!chartCtx) {
        console.error("Could not get 2D context for the chart!");
        return;
    }

    if (this.competitionResults.length === 0) {
        if (this.myChart) {
            this.myChart.destroy();
            this.myChart = null;
        }
        console.log("No data to render chart.");
        return;
    }

    if (this.myChart) {
        this.myChart.destroy();
    }

    const timeDifferences = this.competitionResults
        .filter(item => !isNaN(item.difference_minutes))
        .map(item => item.difference_minutes);
    const numBins = Math.ceil(Math.sqrt(timeDifferences.length));
    const minTime = Math.min(...timeDifferences);
    const maxTime = Math.max(...timeDifferences);
    const binSize = (maxTime - minTime) / numBins;
    const binCounts = new Array(numBins).fill(0);

    timeDifferences.forEach(time => {
        const binIndex = Math.floor((time - minTime) / binSize);
        binCounts[binIndex]++;
    });

    const binLabels = binCounts.map((_, index) => {
        const binStart = minTime + index * binSize;
        const binEnd = binStart + binSize;
        return `${binStart.toFixed(2)} - ${binEnd.toFixed(2)}`;
    });

    this.myChart = new Chart(chartCtx, {
        type: 'line',
        data: {
            labels: binLabels,
            datasets: [{
                label: 'Adott intervallumokba eső futók darabszáma',
                data: binCounts,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Mennyiség'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time (minutes)'
                    }
                }
            }
        }
    });
}

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
.chart-container {
  width: 100%;
  margin: auto;
}
</style>
