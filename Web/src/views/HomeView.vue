<template>
<div class="container">
<div class="row">
  <div class="col-12 p-6" >

    <h1 class="my-3">Üdvözlöm a RunBase Webes Felületén!</h1>
    <p>
      Ez a weblap a futóversenyek köré épül. Manapság sokan sportolnak mind hobbiból mind versenyszinten, a futás az egyik legnépszerűbb sport, mert nem kell segédeszköz hozzá csak két láb. 
      Jelenleg nincs olyan rendszer, mely eltárolná a futóversenyek eredményeit úgy, hogy elérhető legyen bárki számára.
      Ez a rendszer eltárolná ezeket az adatokat és elérhetővé tenné mindenki számára.
    </p>
    <p>
    A szoftver célja: 
    <ul class="pb-3">
        <li>A felhasználók megnézhessék az adott versenyeken résztvevő futók eredményeit</li>
        <li>Eredmények kiemelése, ha az adott felhasználó részt vett valamelyik versenyen</li>
        <li>Rá jogosult felhasználók módosíthatják és feltölthetik az eredményeket</li>
    </ul>
    </p>
      </div>
    </div>
  </div>

  <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal6">
          Leírás
        </button>



   <div class="modal fade bd-example-modal-lg" id="exampleModal6" tabindex="-1" aria-labelledby="exampleModalLabel6" aria-hidden="true">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title text-danger" id="exampleModalLabel6">Üdvözöljük !</h5>
                

                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <h4 class="text-start">Versenyeken elért eredményeid:</h4>
                
        <div class="table-wrapper-scroll-y my-custom-scrollbar">
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
              </div>
              <!-- <div class="modal-footer">
                <button type="button" class="btn btn-warning" data-bs-dismiss="modal">Close</button>
              </div> -->
            </div>
          </div>
        </div>
</template>

<script>
//import LoginPageVue from './DataPages/LoginPage.vue';
export default {
  components: {
  },
  data() {
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
 ul {
  list-style-type: none;
  padding: 0;
  font-size: 20px;
}
/*
li {
  display: inline-block;
  margin: 0 10px;
} */
a {
  color: #42b983;
}
h1 {
  font-size: 3em;
}
</style>
