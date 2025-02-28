<template>
  <h1 class="my-3">Eredmények</h1>
  <div class="container">
    <div class="row">
      <div class="col-6">
        <select
          class="form-select"
          @change="fillup($event), competitionResult()"
          id="selectedCompetition"
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
          id="selectedDistance"
          @change="competitionResult()"
        >
          <option value="" selected disabled hidden>
            Válasszon egy távot!
          </option>
          <option
            v-for="a in selectedCompetitionDistances"
            :key="a.tavID"
            v-bind:value="a.tavID"
          >
            {{ a }} km
          </option>
        </select>
      </div>

      <div class="table-wrapper-scroll-y my-custom-scrollbar mt-2">
        <table class="table mt-3">
          <tr>
            <th>
              <input
                type="button"
                @click="sortedByCompetitionID()"
                class="btn btn-light"
                value="VersenyID"
              />
            </th>
            <th>
              <input
                type="button"
                @click="sortedByDistanceID()"
                class="btn btn-light"
                value="TávID"
              />
            </th>
            <th>
              <input
                type="button"
                @click="sortedByNameID()"
                class="btn btn-light"
                value="NévID"
              />
            </th>
            <th>
              <input
                type="button"
                @click="sortedByStart()"
                class="btn btn-light"
                value="Indulási idő"
              />
            </th>
            <th>
              <input
                type="button"
                @click="sortedByFinish()"
                class="btn btn-light"
                value="Érkezési idő"
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
<h2 class="mt-5">Verseny adatok feltöltése</h2>
      <div >
        <select
          name=""
          id="postCompetitionID"
          class="col-2 post-select"
          @change="postFillUpCompetitionsDistances($event)"
          required
        >
        <option value="" selected disabled hidden>
            Válasszon egy versenyt!
        </option>
          <option
            v-for="a in competitions"
            :key="a.nev"
            v-bind:value="a.versenyID"
          >
            {{ a.versenyID }}
          </option>
        </select>
        <select name="" id="postDistanceID" class="col-2 post-select" required>
          <option value="" selected disabled hidden>
            Válasszon egy távot!
        </option>
          <option
            v-for="a in postCompetitionDistances"
            :key="a.nev"
            v-bind:value="a.nev"
          >
            {{ a }}
          </option>
        </select>
        <input type="text" id="postCompetitorID" class="col-2" required />
        <input type="text" id="postStart" class="col-2" required />
        <input type="text" id="postFinish" class="col-2" required />
        <input type="text" id="postStartNumber" class="col-2" required />    
      </div>

      <div class="mt-4">
      <input type="submit" @click="post()" value="Adatok feltöltése!" class="col-3" />
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      results: [],
      competitionResults: [],
      competitions: [],
      distances: [],
      sortedResults: [],
      competitionDistances: [],
      competitionDistanceIDs: [],
      selectedCompetitionDistances: [],
      postCompetitionDistances: [],
      ascDesc: 0,
    };
  },

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

    axios
      .get("https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/tavok")
      .then((response) => {
        console.log(this.distances.data);
        this.distances = response.data;
      })
      .catch((error) => console.log(error));
  },
  methods: {
    fillup(event) {
      document.getElementById("selectedDistance").selectedIndex = 0;
      (this.competitionDistanceIDs = []),
        (this.selectedCompetitionDistances = []),
        this.competitionDistances.forEach((element) => {
          if (element.versenyID == event.target.selectedIndex) {
            this.competitionDistanceIDs.push(element.tavID);
          }
        });
      this.competitionDistanceIDs.forEach((element) => {
        this.distances.forEach((item) => {
          if (element == item.tavID) {
            this.selectedCompetitionDistances.push(item.tav);
          }
        });
      });
    },
    competitionResult() {
      this.competitionResults = [];
      var selectedDistanceID;

      if (document.getElementById("selectedDistance").selectedIndex == 0) {
        this.results.forEach((element) => {
          if (
            element.versenyID ==
            document.getElementById("selectedCompetition").selectedIndex
          ) {
            this.competitionResults.push(element);
          }
        });
      } else {
        this.distances.forEach((element) => {
          if (
            element.tav ==
            document.getElementById("selectedDistance").value.match(/(\d+)/)[0]
          ) {
            selectedDistanceID = element.tavID;
          }
        });

        this.results.forEach((element) => {
          if (
            element.versenyID ==
              document.getElementById("selectedCompetition").selectedIndex &&
            element.tav == selectedDistanceID
          ) {
            this.competitionResults.push(element);
          }
        });
      }
    },
    sortedByCompetitionID() {
      if (this.ascDesc % 2 == 0) {
        this.competitionResults.sort((a, b) => a.versenyID - b.versenyID);
      } else {
        this.competitionResults.sort((a, b) => b.versenyID - a.versenyID);
      }
      this.ascDesc += 1;
    },

    sortedByDistanceID() {
      if (this.ascDesc % 2 == 0) {
        this.competitionResults.sort((a, b) => a.tav - b.tav);
      } else {
        this.competitionResults.sort((a, b) => b.tav - a.tav);
      }
      this.ascDesc += 1;
    },

    sortedByNameID() {
      if (this.ascDesc % 2 == 0) {
        this.competitionResults.sort((a, b) => a.versenyzoID - b.versenyzoID);
      } else {
        this.competitionResults.sort((a, b) => b.versenyzoID - a.versenyzoID);
      }
      this.ascDesc += 1;
    },

    sortedByStart() {
      if (this.ascDesc % 2 == 0) {
        this.competitionResults.sort(
          (a, b) =>
            new Date(a.indulas.getTime()) - new Date(b.indulas.getTime())
        );
      } else {
        this.competitionResults.sort((a, b) => b.indulas.date - a.indulas.date);
      }
      this.ascDesc += 1;
    },

    sortedByFinish() {
      if (this.ascDesc % 2 == 0) {
        this.competitionResults.sort((a, b) => a.erkezes - b.erkezes);
      } else {
        this.competitionResults.sort((a, b) => b.erkezes - a.erkezes);
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
    postFillUpCompetitionsDistances(event) {
      this.postCompetitionDistances = [];
      this.competitionDistances.forEach((element) => {
        if (element.versenyID == event.target.value) {
          this.postCompetitionDistances.push(element.tavID);
        }
      });
    },
    post() {
      if (
        document.getElementById("postCompetitionID").value.length != 0 &&
        document.getElementById("postDistanceID").value.length != 0 &&
        document.getElementById("postCompetitorID").value.length != 0 &&
        document.getElementById("postStart").value.length != 0 &&
        document.getElementById("postFinish").value.length != 0 &&
        document.getElementById("postStartNumber").value.length != 0
      ) {
        const article = {
          versenyzoID: document.getElementById("postCompetitorID").value,
          versenyID: document.getElementById("postCompetitionID").value,
          tav: document.getElementById("postDistanceID").value,
          indulas: document.getElementById("postStart").value,
          erkezes: document.getElementById("postStart").value,
          rajtszam: document.getElementById("postStartNumber").value,
        };
        console.log(article);

        axios
          .post("https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/versenyindulas", article)
          .then((response) => (this.articleId = response.data.id));
        window.alert("Sikeres feltöltés!");
      }
      else{
        window.alert("Nincs minden mező kitöltve!")
      }
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