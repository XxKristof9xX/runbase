<template>
    <div v-if="isAuthorized" class="container mt-4">
      <h1>Admin Panel</h1>
      <div v-if="isAdmin" class="mt-4">
        <h2>Felhasználók kezelése</h2>
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Név</th>
              <th>Típus</th>
              <th>Műveletek</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.nev }}</td>
              <td>{{ user.tipus }}</td>
              <td>
                <button class="btn btn-warning btn-sm" @click="editUser(user)">Módosítás</button>
                <button class="btn btn-danger btn-sm ms-2" @click="deleteUser(user.id)">Törlés</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <div v-if="isAdminOrOrganizer" class="mt-4">
        <h2>Versenyzők kezelése</h2>
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Név</th>
              <th>TAJ szám</th>
              <th>Műveletek</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="competitor in competitors" :key="competitor.versenyzoId">
              <td>{{ competitor.versenyzoId }}</td>
              <td>{{ competitor.nev }}</td>
              <td>{{ competitor.tajSzam }}</td>
              <td>
                <button class="btn btn-warning btn-sm" @click="editCompetitor(competitor)">Módosítás</button>
                <button class="btn btn-danger btn-sm ms-2" @click="deleteCompetitor(competitor.versenyzoId)">Törlés</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  
    <div v-else class="text-center mt-5">
      <h1>Nincs jogosultságod az oldal megtekintéséhez!</h1>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from "vue";
  import axios from "axios";
  
  export default {
    setup() {
      const userRole = ref(null);
      const users = ref([]);
      const competitors = ref([]);
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
            users.value = users.value.filter((user) => user.id !== id);
          } catch (error) {
            console.error("Hiba a törléskor:", error);
          }
        }
      };
  
      const deleteCompetitor = async (versenyzoId) => {
        if (confirm("Biztosan törölni szeretnéd ezt a versenyzőt?")) {
          try {
            await axios.delete(`https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/versenyzo/${versenyzoId}`);
            competitors.value = competitors.value.filter((competitor) => competitor.versenyzoId !== versenyzoId);
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
        deleteUser, 
        deleteCompetitor 
      };
    },
  };
  </script>
  
  <style scoped>
  .table {
    background-color: white;
    border-radius: 10px;
    overflow: hidden;
  }
  
  .btn {
    cursor: pointer;
  }
  </style>
  