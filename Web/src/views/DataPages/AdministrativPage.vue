<template>
  <v-container>
    <div v-if="isAuthorized">
      <h1>Admin Panel</h1>
      <div v-if="isAdmin" class="mt-4">
        <h2>Felhasználók kezelése</h2>
        <v-text-field v-model="searchUsers" label="Keresés..." class="mb-4" clearable></v-text-field>
        <v-data-table :headers="userHeaders" :items="users" :search="searchUsers" items-per-page="5"
          class="elevation-1">
          <template #item="{ item }">
            <tr>
              <td>{{ item.id }}</td>
              <td>{{ item.nev }}</td>
              <td>{{ item.tipus }}</td>
              <td class="d-flex align-center">
                <v-btn v-show="$vuetify.display.mdAndUp" color="warning" size="small" @click="editUser(item)">
                  Módosítás
                </v-btn>
                <v-btn v-show="$vuetify.display.mdAndUp" color="error" size="small" class="ml-2"
                  @click="deleteUser(item.id)">
                  Törlés
                </v-btn>
                <v-btn v-show="$vuetify.display.smAndDown" icon color="warning" @click="editUser(item)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn v-show="$vuetify.display.smAndDown" icon color="error" class="ml-2" @click="deleteUser(item.id)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </td>
            </tr>
          </template>
        </v-data-table>
      </div>
      <div v-if="isAdminOrOrganizer" class="mt-4">
        <h2>Versenyzők kezelése</h2>
        <v-text-field v-model="searchCompetitors" label="Keresés..." class="mb-4" clearable></v-text-field>
        <v-data-table :headers="competitorHeaders" :items="competitors" :search="searchCompetitors" items-per-page="5"
          class="elevation-1">
          <template #item="{ item }">
            <tr>
              <td>{{ item.versenyzoId }}</td>
              <td>{{ item.nev }}</td>
              <td>{{ item.tajSzam }}</td>
              <td class="d-flex align-center">
                <v-btn v-show="$vuetify.display.mdAndUp" color="warning" size="small" @click="editCompetitor(item)">
                  Módosítás
                </v-btn>
                <v-btn v-show="$vuetify.display.mdAndUp" color="error" size="small" class="ml-2"
                  @click="deleteCompetitor(item.versenyzoId)">
                  Törlés
                </v-btn>
                <v-btn v-show="$vuetify.display.smAndDown" icon color="warning" @click="editCompetitor(item)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn v-show="$vuetify.display.smAndDown" icon color="error" class="ml-2"
                  @click="deleteCompetitor(item.versenyzoId)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </td>
            </tr>
          </template>
        </v-data-table>
      </div>
    </div>

    <div v-else class="text-center mt-5">
      <h1>Nincs jogosultságod az oldal megtekintéséhez!</h1>
    </div>

    <v-dialog v-model="showEditUserDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Felhasználó módosítása</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="selectedUser.nev" label="Név"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select v-model="selectedUser.tipus" :items="userTypes" label="Típus"></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="selectedUser.versenyzoId" label="Versenyző ID" type="number"></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeEditUserDialog">Mégse</v-btn>
          <v-btn color="blue darken-1" text @click="saveUser">Mentés</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showEditCompetitorDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Versenyző módosítása</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="selectedCompetitor.nev" label="Név"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="selectedCompetitor.szuletesiEv" label="Születési év"
                  type="number"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select v-model="selectedCompetitor.neme" :items="genderOptions" label="Nem"></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="selectedCompetitor.tajSzam" label="TAJ szám"></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeEditCompetitorDialog">Mégse</v-btn>
          <v-btn color="blue darken-1" text @click="saveCompetitor">Mentés</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

export default {
  setup() {
    const userRole = ref(null);
    const user = ref(null);
    const router = useRouter();
    const users = ref([]);
    const competitors = ref([]);
    const searchUsers = ref("");
    const searchCompetitors = ref("");
    const showEditUserDialog = ref(false);
    const showEditCompetitorDialog = ref(false);
    const selectedUser = ref({});
    const selectedCompetitor = ref({});
    const userTypes = ["user", "competitor", "organizer", "admin"];
    const genderOptions = ["Férfi", "Nő"];

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

    const loadUserData = () => {
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        user.value = {
          apiKey: parsedUser.apiKey,
        };
        userRole.value = parsedUser.tipus;
        isAuthorized.value = ["admin", "organizer"].includes(parsedUser.tipus);
        axios.defaults.headers.common["Authorization"] = `Bearer ${user.value.apiKey}`;
      } else {
        router.push("/login");
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

    const editUser = (user) => {
      selectedUser.value = { ...user };
      showEditUserDialog.value = true;
    };

    const saveUser = async () => {
      try {
        await axios.put(`https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/felhasznalok/${selectedUser.value.id}`, selectedUser.value);
        fetchUsers();
        closeEditUserDialog();
      } catch (error) {
        console.error("Hiba a felhasználó mentésekor:", error);
      }
    };


    const closeEditUserDialog = () => {
      showEditUserDialog.value = false;
    };

    const editCompetitor = (competitor) => {
      selectedCompetitor.value = { ...competitor };
      showEditCompetitorDialog.value = true;
    };

    const saveCompetitor = async () => {
      try {
        await axios.put(`https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/versenyzo/${selectedCompetitor.value.versenyzoId}`, selectedCompetitor.value);
        fetchCompetitors();
        closeEditCompetitorDialog();
      } catch (error) {
        console.error("Hiba a versenyző mentésekor:", error);
      }
    };

    const closeEditCompetitorDialog = () => {
      showEditCompetitorDialog.value = false;
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
      loadUserData();
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
      showEditUserDialog,
      showEditCompetitorDialog,
      selectedUser,
      selectedCompetitor,
      userTypes,
      genderOptions,
      editUser,
      saveUser,
      closeEditUserDialog,
      editCompetitor,
      saveCompetitor,
      closeEditCompetitorDialog,
      deleteUser,
      deleteCompetitor,
    };
  },
};
</script>