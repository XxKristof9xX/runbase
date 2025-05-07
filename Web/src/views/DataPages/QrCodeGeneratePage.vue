<template>
    <h1 class="my-3">Eredmények</h1>
    <div class="container">
      <div class="row">
        <div class="col-6">
          <v-autocomplete
            v-model="selectedCompetition"
            :items="competitions.map(c => c.nev)"
            label="Válasszon egy versenyt!"
            outlined
            dense
            clearable
            @update:modelValue="onCompetitionChange"
          />
        </div>
  
        <div class="col-6">
          <v-autocomplete
            v-model="selectedDistance"
            :items="selectedCompetitionDistances.map(d => `${d.tav} km`)"
            label="Válasszon egy távot!"
            outlined
            dense
            clearable
            @update:modelValue="competitionResult"
          />
        </div>
  
        <div class="table-wrapper-scroll-y my-custom-scrollbar mt-2">
          <table class="table mt-3">
            <thead>
              <tr>
                <th><input type="button" @click="sortedByCompetitionId()" class="btn btn-light" value="Verseny Azonosító" /></th>
                <th><input type="button" @click="sortedByDistanceId()" class="btn btn-light" value="Távok" /></th>
                <th><input type="button" @click="sortedByNameId()" class="btn btn-light" value="Versenyző Azonosító" /></th>
                <th><input type="button" class="btn btn-light" value="Indulási Idő" /></th>
                <th><input type="button" class="btn btn-light" value="Érkezési Idő" /></th>
                <th><input type="button" @click="sortedByStartNumber()" class="btn btn-light" value="Rajtszám" /></th>
                <th><input type="button" @click="sortedByRunTime()" class="btn btn-light" value="Eltelt idő" /></th>
                <th>QR-kód</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="result in competitionResults" :key="result.versenyzoId">
                <td>{{ result.versenyId }}</td>
                <td>{{ result.tav }} km</td>
                <td>{{ result.versenyzoId }}</td>
                <td>{{ result.indulas }}</td>
                <td>{{ result.erkezes }}</td>
                <td>{{ result.rajtszam }}</td>
                <td>{{ isNaN(result.difference_minutes) ? '-' : result.difference_minutes.toFixed(2) }} perc</td>
                <td>
                  <button class="btn btn-sm btn-outline-primary" @click="generateQRCode(result)">QR letöltés</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <br />
    </div>
  </template>
  
  <script>
  import { ref } from "vue";
  import axios from "axios";
  import { useRouter } from "vue-router";
  import { Chart, registerables } from 'chart.js';
  import QRCode from "qrcode";
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
        competitionDistances: [],
        selectedCompetitionDistances: [],
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
                result.difference_minutes = NaN;
              } else {
                const startTime = new Date(`${alapDatum}T${indulasTime}`);
                const endTime = new Date(`${alapDatum}T${erkezesTime}`);
                result.difference_minutes = isNaN(startTime) || isNaN(endTime)
                  ? NaN
                  : (endTime - startTime) / (1000 * 60);
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
  
    methods: {
      onCompetitionChange() {
        this.selectedDistance = null;
        const selectedComp = this.competitions.find(c => c.nev === this.selectedCompetition);
        if (!selectedComp) return;
        this.selectedCompetitionDistances = this.competitionDistances.filter(d => d.versenyId === selectedComp.versenyId);
        this.competitionResult();
      },
  
      competitionResult() {
        this.competitionResults = [];
        const selectedComp = this.competitions.find(c => c.nev === this.selectedCompetition);
        if (!selectedComp) return;
  
        const selectedDistanceId = this.selectedDistance
          ? parseInt(this.selectedDistance)
          : null;
  
        this.competitionResults = this.results.filter(result => {
          const isSameCompetition = result.versenyId === selectedComp.versenyId;
          const isSameDistance = selectedDistanceId ? result.tav === selectedDistanceId : true;
          return isSameCompetition && isSameDistance;
        });
      },
  
      sortedByCompetitionId() {
        this.competitionResults.sort((a, b) => this.ascDesc % 2 === 0 ? a.versenyId - b.versenyId : b.versenyId - a.versenyId);
        this.ascDesc++;
      },
  
      sortedByDistanceId() {
        this.competitionResults.sort((a, b) => this.ascDesc % 2 === 0 ? a.tav - b.tav : b.tav - a.tav);
        this.ascDesc++;
      },
  
      sortedByNameId() {
        this.competitionResults.sort((a, b) => this.ascDesc % 2 === 0 ? a.versenyzoId - b.versenyzoId : b.versenyzoId - a.versenyzoId);
        this.ascDesc++;
      },
  
      sortedByStartNumber() {
        this.competitionResults.sort((a, b) => this.ascDesc % 2 === 0 ? a.rajtszam - b.rajtszam : b.rajtszam - a.rajtszam);
        this.ascDesc++;
      },
  
      sortedByRunTime() {
        this.competitionResults.sort((a, b) => this.ascDesc % 2 === 0 ? a.difference_minutes - b.difference_minutes : b.difference_minutes - a.difference_minutes);
        this.ascDesc++;
      },
  
      generateQRCode(result) {
        const text = `versenyId:${result.versenyId};tav:${result.tav};rajtszam:${result.rajtszam}`;
        QRCode.toDataURL(text)
          .then((url) => {
            const link = document.createElement("a");
            link.href = url;
            link.download = `qr_${result.rajtszam}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          })
          .catch((err) => {
            console.error("QR-kód generálási hiba:", err);
          });
      },
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
    margin: auto;
  }
  </style>