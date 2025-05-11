<template>
  <h1 class="my-3">Eredmények</h1>
  <div class="container">
    <div class="row">
      <div class="col-6">
        <v-autocomplete v-model="selectedCompetition" :items="competitions.map(c => c.nev)"
          label="Válasszon egy versenyt!" outlined dense clearable @update:modelValue="onCompetitionChange" />
      </div>

      <div class="col-6">
        <v-autocomplete v-model="selectedDistance" :items="selectedCompetitionDistances.map(d => `${d.tav} km`)"
          label="Válasszon egy távot!" outlined dense clearable @update:modelValue="competitionResult" />
      </div>

      <div class="table-wrapper-scroll-y my-custom-scrollbar mt-2">
        <table class="table mt-3">
          <thead>
            <tr>
              <th>
                <input type="button" @click="sortedByDistanceId()" class="btn btn-light" value="Távok" />
              </th>
              <th>
                <input type="button" class="btn btn-light" value="Indulási Idő" />
              </th>
              <th>
                <input type="button" class="btn btn-light" value="Érkezési Idő" />
              </th>
              <th>
                <input type="button" @click="sortedByStartNumber()" class="btn btn-light" value="Rajtszám" />
              </th>
              <th>
                <input type="button" @click="sortedByRunTime()" class="btn btn-light" value="Eltelt idő" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in competitionResults" :key="r.Id">
              <td>{{ r.tav }} km</td>
              <td>{{ r.indulas }}</td>
              <td>{{ r.erkezes }}</td>
              <td>{{ r.rajtszam }}</td>
              <td>{{ Math.round(r.difference_minutes * 100) / 100 }} perc</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <br>
    <div v-if="showChart" class="chart-container" style="position: relative; height:20vh; width:80vw">
  <canvas id="myChart"></canvas>
</div>
<div v-else class="text-center mt-4 text-muted">
  Nincs adat vagy nincs kiválasztva táv.
</div>
  </div>
</template>


<script>
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { Chart, registerables } from 'chart.js';
import { nextTick } from 'vue';
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
        isAuthorized.value = ["admin", "organizer", "user", "competitor"].includes(parsedUser.tipus);
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
      showChart: false,
      ascDesc: 0,
      myChart: null,
      selectedCompetition: null,
      selectedDistance: null,
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
              else {
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
    onCompetitionChange() {
      this.selectedDistance = null;
      this.showChart = false;
      const selectedComp = this.competitions.find(c => c.nev === this.selectedCompetition);
      if (!selectedComp) return;

      this.selectedCompetitionDistances = this.competitionDistances.filter(d => d.versenyId === selectedComp.versenyId);
      this.competitionResult();
    },

    competitionResult() {
  this.competitionResults = [];
  const selectedComp = this.competitions.find(c => c.nev === this.selectedCompetition);
  if (!selectedComp || !this.selectedDistance) {
    this.showChart = false;
    return;
  }

  const selectedDistanceValue = parseFloat(this.selectedDistance);

  this.competitionResults = this.results.filter(result => {
    return result.versenyId === selectedComp.versenyId && result.tav === selectedDistanceValue;
  });

  this.showChart = true;
  nextTick(() => {
    this.renderChart();
  });
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
        const binIndex = Math.min(Math.floor((time - minTime) / binSize), numBins - 1);
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
                text: 'Futott idő (perc)'
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
  font-size: 3em;
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

.post-select {
  height: 30px !important;
}

.chart-container {
  width: 100%;
  max-width: 1000px;
  margin: auto;
  height: 400px;
}
</style>
