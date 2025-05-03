<template>
  <div class="container">
    <div class="col-12 pb-5">
      <h1>{{ $route.params.nev }}</h1>
    </div>

    <div class="col-12">
      <p>Helyszín: {{ $route.query.helyszin }}</p>
      <p>Időpont: {{ $route.query.datum }}</p>
      <p>Maximális létszám: {{ $route.query.max_letszam }} fő</p>
      <p>{{ $route.query.leiras }}</p>
    </div>

    <div class="col-12 my-4" v-if="user && user.type === 'competitor'">
      <label for="tav">Válassz távot:</label>
      <select v-model="selectedDistance" id="tav" class="form-select">
        <option disabled value="">-- Válassz távot --</option>
        <option
          v-for="distance in filteredDistances"
          :key="distance.versenyId"
          :value="distance.tav"
        >
          {{ distance.tav }} km
        </option>
      </select>

      <button
        class="btn btn-primary mt-3"
        @click="jelentkezes"
        :disabled="!selectedDistance"
      >
        Jelentkezés
      </button>

      <div class="mt-3" v-if="message">
        <p :class="{'text-success': success, 'text-danger': !success}">
          {{ message }}
        </p>
      </div>
    </div>

    <div v-else class="mt-3">
      <p><strong>Csak versenyző típusú felhasználók jelentkezhetnek.</strong></p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";

export default {
  setup() {
    const route = useRoute();
    const selectedDistance = ref("");
    const competitionDistances = ref([]);
    const user = ref(null);
    const message = ref("");
    const success = ref(false);

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
      axios.defaults.headers.common["Authorization"] = `Bearer ${user.value.apiKey}`;
    }

    const versenyId = route.query.id;

    const filteredDistances = computed(() =>
      competitionDistances.value.filter(
        (tav) => String(tav.versenyId) === String(versenyId)
      )
    );

    onMounted(() => {
      axios
        .get(
          "https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/versenytav"
        )
        .then((response) => {
          competitionDistances.value = response.data;
        })
        .catch((error) => console.log(error));
    });

    const jelentkezes = () => {
      if (!selectedDistance.value || !user.value?.competitorId) return;

      const payload = {
        versenyzoId: user.value.competitorId,
        versenyId: parseInt(versenyId),
        tav: parseFloat(selectedDistance.value),
      };

      axios
        .post(
          "https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/versenyindulas/jelentkezes",
          payload
        )
        .then(() => {
          message.value = "Sikeres jelentkezés!";
          success.value = true;
        })
        .catch((error) => {
          console.error(error);
          if (
            error.response &&
            error.response.data &&
            error.response.data.includes("már jelentkezett")
          ) {
            message.value = "Már jelentkeztél erre a távra.";
          } else {
            message.value = "Hiba történt a jelentkezés során.";
          }
          success.value = false;
        });
    };

    return {
      selectedDistance,
      competitionDistances,
      filteredDistances,
      user,
      jelentkezes,
      message,
      success,
    };
  },
};
</script>

<style>
h1 {
  font-size: 3em;
}
</style>
