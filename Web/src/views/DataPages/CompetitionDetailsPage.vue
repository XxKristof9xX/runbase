<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold">{{ $route.params.nev }}</h1>
      </v-col>

      <v-col cols="12" md="6" class="mx-auto mb-4">
        <v-card class="pa-4">
          <v-card-text>
            <div><strong>Helyszín:</strong> {{ $route.query.helyszin }}</div>
            <div><strong>Időpont:</strong> {{ $route.query.datum }}</div>
            <div><strong>Maximális létszám:</strong> {{ $route.query.max_letszam }} fő</div>
            <div class="mt-2 text-left">{{ $route.query.leiras }}</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4" v-if="user && user.type === 'competitor'">
        <v-select v-model="selectedDistance" :items="filteredDistances"
          :item-title="item => item && item.tav ? item.tav + ' km' : ''" item-value="tav" label="Válassz távot"
          return-object :menu-props="{ maxHeight: 300 }" placeholder="-- Válassz távot --"></v-select>


        <v-btn class="mt-4" color="primary" @click="jelentkezes" :disabled="!selectedDistance || isPastEvent">
          Jelentkezés
        </v-btn>

        <v-alert type="error" class="mt-3" v-if="isPastEvent">
          Ez a verseny már lezajlott, nem lehet jelentkezni.
        </v-alert>

        <v-alert v-if="message" :type="success ? 'success' : 'error'" class="mt-3">
          {{ message }}
        </v-alert>
      </v-col>

      <v-col cols="12" v-else>
        <v-alert type="warning" class="mb-4">
          <strong>Csak regisztrált versenyző jelentkezhet!</strong><br />
          Ha szeretne versenyzői adatokat megadni, látogasson el a profil oldalra.
        </v-alert>
        <v-btn color="secondary" @click="$router.push('/profil')">
          Profil
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import api from '@/services/api';
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
      api.defaults.headers.common["Authorization"] = `Bearer ${user.value.apiKey}`;
    }

    const versenyId = route.query.id;

    const filteredDistances = computed(() =>
      competitionDistances.value.filter(
        (tav) => String(tav.versenyId) === String(versenyId)
      )
    );

    const isPastEvent = computed(() => {
      const today = new Date().toISOString().split("T")[0];
      const versenyDatum = route.query.datum;
      return versenyDatum < today;
    });

    onMounted(() => {
      api
        .get(
          "versenytav"
        )
        .then((response) => {
          competitionDistances.value = response.data;
        })
        .catch((error) => console.log(error));
    });

    const jelentkezes = () => {
      if (!selectedDistance.value || !user.value?.competitorId) return;

      if (isPastEvent.value) {
        message.value = "A verseny már lezajlott, nem lehet jelentkezni.";
        success.value = false;
        return;
      }

      const payload = {
        versenyzoId: user.value.competitorId,
        versenyId: parseInt(versenyId),
        tav: parseFloat(selectedDistance.value.tav),
      };

      api
        .post(
          "versenyindulas/jelentkezes",
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
          } else if (
            error.response &&
            error.response.data &&
            error.response.data.includes("már lezajlott")
          ) {
            message.value = "A verseny már lezajlott, nem lehet jelentkezni.";
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
      isPastEvent,
    };
  },
};
</script>

<style>
h1 {
  font-size: 3em;
}
</style>
