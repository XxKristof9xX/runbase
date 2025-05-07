<template>
  <div class="container mt-4">
    <v-card class="pa-4 mb-4 custom-card">
      <h2 class="mt-5 text-center">Verseny eredmény feltöltése</h2>
      <div v-if="isAuthorized">
        <div class="row g-3">
          <div class="col-sm-12 col-md-6">
            <select id="postCompetitionId" class="form-select" @change="postFillUpCompetitionsDistances" required>
              <option value="" selected disabled hidden>Válasszon egy versenyt!</option>
              <option v-for="a in competitions" :key="a.versenyId" :value="a.versenyId">
                {{ a.nev }}
              </option>
            </select>
          </div>

          <div class="col-sm-12 col-md-6">
            <select id="postDistanceId" class="form-select" required>
              <option value="" selected disabled hidden>Válasszon egy távot!</option>
              <option v-for="a in postCompetitionDistances" :key="a" :value="a">
                {{ a }}
              </option>
            </select>
          </div>

          <div class="col-sm-12 col-md-6 col-lg-4">
            <input type="text" id="postCompetitorId" class="form-control" placeholder="Versenyző ID" required />
          </div>

          <div class="col-sm-12 col-md-6 col-lg-4">
            <input id="postStart" type="time" step="2" class="form-control" placeholder="Indulási idő" required />
          </div>

          <div class="col-sm-12 col-md-6 col-lg-4">
            <input id="postFinish" type="time" step="2" class="form-control" placeholder="Érkezési idő" required />
          </div>

          <div class="col-sm-12 col-md-6">
            <input type="text" id="postStartNumber" class="form-control" placeholder="Rajtszám" required />
          </div>
        </div>

        <div class="d-flex justify-content-center mt-4">
          <button @click="post" class="btn btn-success">Adatok feltöltése!</button>
        </div>
      </div>

      <div v-else class="text-center mt-3">
        <p class="text-danger">Nincs jogosultságod az oldal megtekintéséhez.</p>
      </div>
    </v-card>
  </div>

  <v-container class="d-flex justify-center">
    <v-card class="pa-4 custom-card">
      <h2 class="text-center">Verseny szerkesztése</h2>

      <v-row>
        <v-col cols="12">
          <v-select v-model="selectedRaceId" :items="competitions" item-title="nev" item-value="versenyId"
            label="Válassz versenyt" @update:modelValue="loadRace"></v-select>
        </v-col>
      </v-row>

      <v-form v-if="selectedRace" @submit.prevent="saveRace">
        <v-text-field v-model="selectedRace.nev" label="Név" required></v-text-field>
        <v-text-field v-model="selectedRace.helyszin" label="Helyszín" required></v-text-field>
        <v-text-field v-model="selectedRace.datum" label="Dátum" type="date" required></v-text-field>
        <v-textarea v-model="selectedRace.leiras" label="Leírás"></v-textarea>
        <v-text-field v-model.number="selectedRace.maxLetszam" label="Max létszám" type="number"
          required></v-text-field>

        <v-file-input label="Kép feltöltése" @change="uploadImage"></v-file-input>

        <div class="d-flex justify-center mt-3">
          <v-btn type="submit" color="primary">Mentés</v-btn>
          <v-btn color="error" @click="deleteRace" class="ml-2">Törlés</v-btn>
        </div>

        <v-divider class="my-4"></v-divider>
        <h3 class="text-center">Távok kezelése</h3>

        <v-row>
          <v-col cols="12" md="8">
            <v-text-field v-model="newDistance" label="Új táv (pl. 10km)" required></v-text-field>
          </v-col>
          <v-col cols="12" md="4" class="d-flex align-center">
            <v-btn color="success" @click="addDistance">Hozzáadás</v-btn>
          </v-col>
        </v-row>

        <v-table v-if="raceDistances.length" class="mt-3">
          <thead>
            <tr>
              <th>Táv</th>
              <th>Művelet</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(d, index) in raceDistances" :key="index">
              <td>{{ d.tav }}</td>
              <td>
                <v-btn color="error" size="small" @click="deleteDistance(d.versenyId, d.tav)">Törlés</v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const competitions = ref([]);
const postCompetitionDistances = ref([]);
const competitionDistances = ref([]);
const selectedRaceId = ref(null);
const selectedRace = ref(null);
const selectedFile = ref(null);
const isAuthorized = ref(false);
const newDistance = ref("");
const raceDistances = ref([]);
const apiUrl = "https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net";
const router = useRouter();

const loadUserData = () => {
  const storedUser = sessionStorage.getItem("user");
  if (!storedUser) {
    router.push("/login");
    return;
  }

  const parsedUser = JSON.parse(storedUser);

  if (!["admin", "organizer"].includes(parsedUser.tipus)) {
    alert("Nincs jogosultságod az oldal megtekintéséhez.");
    router.push("/");
    return;
  }

  isAuthorized.value = true;
  axios.defaults.headers.common["Authorization"] = `Bearer ${parsedUser.apiKey}`;
};

const loadCompetitions = async () => {
  const res = await axios.get(`${apiUrl}/api/versenyek`);
  competitions.value = res.data;
};

const loadDistances = async () => {
  const res = await axios.get(`${apiUrl}/api/versenytav`);
  competitionDistances.value = res.data;
};

const postFillUpCompetitionsDistances = async (e) => {
  const selectedId = parseInt(e.target.value);
  const res = await axios.get(`${apiUrl}/api/versenytav/${selectedId}`);
  postCompetitionDistances.value = res.data.map(d => d.tav);
};

const post = async () => {
  const payload = {
    versenyzoId: document.getElementById("postCompetitorId").value,
    versenyId: document.getElementById("postCompetitionId").value,
    tav: document.getElementById("postDistanceId").value,
    indulas: document.getElementById("postStart").value,
    erkezes: document.getElementById("postFinish").value,
    rajtszam: document.getElementById("postStartNumber").value,
  };

  if (Object.values(payload).some(v => !v)) {
    alert("Nincs minden mező kitöltve!");
    return;
  }

  await axios.post(`${apiUrl}/api/versenyindulas`, payload);
  alert("Sikeres feltöltés!");
};

const loadRaceDistances = async () => {
  if (!selectedRaceId.value) return;
  const res = await axios.get(`${apiUrl}/api/versenytav/${selectedRaceId.value}`);
  raceDistances.value = res.data;
};

const addDistance = async () => {
  if (!newDistance.value || !selectedRaceId.value) {
    alert("Kérlek, add meg a távot!");
    return;
  }
  await axios.post(`${apiUrl}/api/versenytav`, { versenyId: selectedRaceId.value, tav: newDistance.value });
  newDistance.value = "";
  await loadRaceDistances();
};

const deleteDistance = async (versenyId, tav) => {
  if (!confirm("Biztosan törlöd ezt a távot?")) return;
  await axios.delete(`${apiUrl}/api/versenytav/${versenyId}/${tav}`);
  await loadRaceDistances();
};

const loadRace = () => {
  selectedRace.value = competitions.value.find(r => r.versenyId === selectedRaceId.value);
  loadRaceDistances();
};

const saveRace = async () => {
  const formData = new FormData();
  formData.append("nev", selectedRace.value.nev);
  formData.append("helyszin", selectedRace.value.helyszin);
  formData.append("datum", selectedRace.value.datum);
  formData.append("leiras", selectedRace.value.leiras);
  formData.append("maxLetszam", selectedRace.value.maxLetszam);
  if (selectedFile.value) {
    formData.append("kep", selectedFile.value, `${selectedRace.value.versenyId}.jpg`);
  }
  await axios.put(`${apiUrl}/api/versenyek/${selectedRace.value.versenyId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  alert("Verseny adatai frissítve.");
};

const uploadImage = (event) => {
  const file = event.target.files[0];
  if (file && file.size > 3 * 1024 * 1024) {
    alert("A fájl mérete nem lehet nagyobb, mint 3MB!");
    return;
  }
  selectedFile.value = file;
};

const deleteRace = async () => {
  if (!confirm("Biztosan törölni szeretnéd ezt a versenyt?")) return;
  await axios.delete(`${apiUrl}/api/versenyek/${selectedRace.value.versenyId}`);
  selectedRace.value = null;
  selectedRaceId.value = null;
  await loadCompetitions();
  alert("Verseny törölve.");
};

onMounted(() => {
  loadUserData();
  loadCompetitions();
  loadDistances();
});
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: auto;
}

.v-container {
  display: flex;
  justify-content: center;
}

.custom-card {
  width: 100%;
  max-width: 900px;
}
</style>
