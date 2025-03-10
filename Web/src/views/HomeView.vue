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
