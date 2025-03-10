<template>
  <v-container>
    <div v-if="isAuthorized">
      <h1>Admin Panel</h1>
      
      <div v-if="isAdmin" class="mt-4">
        <h2>Felhasználók kezelése</h2>
        <v-text-field v-model="searchUsers" label="Keresés..." class="mb-4" clearable></v-text-field>
        <v-data-table
          :headers="userHeaders"
          :items="users"
          :search="searchUsers"
          items-per-page="5"
          class="elevation-1"
        >
          <template #item="{ item }">
            <tr>
              <td>{{ item.id }}</td>
              <td>{{ item.nev }}</td>
              <td>{{ item.tipus }}</td>
              <td>
                <v-btn color="warning" size="small" @click="editUser(item)">Módosítás</v-btn>
                <v-btn color="error" size="small" class="ml-2" @click="deleteUser(item.id)">Törlés</v-btn>
              </td>
            </tr>
          </template>
        </v-data-table>
      </div>

      <div v-if="isAdminOrOrganizer" class="mt-4">
        <h2>Versenyzők kezelése</h2>
        <v-text-field v-model="searchCompetitors" label="Keresés..." class="mb-4" clearable></v-text-field>
        <v-data-table
          :headers="competitorHeaders"
          :items="competitors"
          :search="searchCompetitors"
          items-per-page="5"
          class="elevation-1"
        >
          <template #item="{ item }">
            <tr>
              <td>{{ item.versenyzoId }}</td>
              <td>{{ item.nev }}</td>
              <td>{{ item.tajSzam }}</td>
              <td>
                <v-btn color="warning" size="small" @click="editCompetitor(item)">Módosítás</v-btn>
                <v-btn color="error" size="small" class="ml-2" @click="deleteCompetitor(item.versenyzoId)">Törlés</v-btn>
              </td>
            </tr>
          </template>
        </v-data-table>
      </div>
    </div>
    
    <div v-else class="text-center mt-5">
      <h1>Nincs jogosultságod az oldal megtekintéséhez!</h1>
    </div>
  </v-container>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import axios from "axios";

export default {
  setup() {
    const userRole = ref(null);
    const users = ref([]);
    const competitors = ref([]);
    const searchUsers = ref("");
    const searchCompetitors = ref("");

    const userHeaders = [
      { text: "ID", value: "id" },
      { text: "Név", value: "nev" },
      { text: "Típus", value: "tipus" },
      { text: "Műveletek", value: "actions", sortable: false }
    ];

    const competitorHeaders = [
      { text: "ID", value: "versenyzoId" },
      { text: "Név", value: "nev" },
      { text: "TAJ szám", value: "tajSzam" },
      { text: "Műveletek", value: "actions", sortable: false }
    ];

    const checkUserRole = () => {
      const user = sessionStorage.getItem("user");
      if (user) {
        const parsedUser = JSON.parse(user);
        userRole.value = parsedUser.tipus;
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get("https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/felhasznalok/");
        users.value = response.data;
      } catch (error) {
        console.error("Hiba a felhasználók betöltésekor:", error);
      }
    };

    const fetchCompetitors = async () => {
      try {
        const response = await axios.get("https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/versenyzo/");
        competitors.value = response.data;
      } catch (error) {
        console.error("Hiba a versenyzők betöltésekor:", error);
      }
    };

    const deleteUser = async (id) => {
      if (confirm("Biztosan törölni szeretnéd ezt a felhasználót?")) {
        try {
          await axios.delete(`https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/felhasznalok/${id}`);
          users.value = users.value.filter(user => user.id !== id);
        } catch (error) {
          console.error("Hiba a törléskor:", error);
        }
      }
    };

    const deleteCompetitor = async (versenyzoId) => {
      if (confirm("Biztosan törölni szeretnéd ezt a versenyzőt?")) {
        try {
          await axios.delete(`https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/versenyzo/${versenyzoId}`);
          competitors.value = competitors.value.filter(competitor => competitor.versenyzoId !== versenyzoId);
        } catch (error) {
          console.error("Hiba a törléskor:", error);
        }
      }
    };

    onMounted(() => {
      checkUserRole();
      fetchUsers();
      fetchCompetitors();
    });

    const isAdmin = computed(() => userRole.value === "admin");
    const isAdminOrOrganizer = computed(() => userRole.value === "admin" || userRole.value === "organizer");
    const isAuthorized = computed(() => isAdminOrOrganizer.value);

    return {
      isAdmin,
      isAdminOrOrganizer,
      isAuthorized,
      users,
      competitors,
      searchUsers,
      searchCompetitors,
      userHeaders,
      competitorHeaders,
      deleteUser,
      deleteCompetitor,
    };
  },
};
</script>
