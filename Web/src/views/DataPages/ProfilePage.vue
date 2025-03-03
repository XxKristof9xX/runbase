<template>
    <div class="container mt-4">
      <h1>Profil</h1>
      <div v-if="user">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Felhasználónév: <strong>{{ user.username }}</strong></h5>
            <p class="card-text"><strong>Felhasználó típus:</strong> {{ user.type }}</p>
            <p class="card-text"><strong>Versenyző azonosító:</strong> {{ user.competitorId }}</p>
          </div>
        </div>
        <button class="btn btn-danger mt-3" @click="logout">Kijelentkezés</button>
      </div>
      <div v-else>
        <p>Nincs bejelentkezett felhasználó.</p>
        <router-link to="/login" class="btn btn-primary">Bejelentkezés</router-link>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from "vue";
  import { useRouter } from "vue-router";
  
  export default {
    setup() {
      const router = useRouter();
      const user = ref(null);
  
      // Felhasználói adatok betöltése a sessionStorage-ból
      const loadUserData = () => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
    const parsedUser = JSON.parse(storedUser);

    user.value = {
      id: parsedUser.id, 
      username: parsedUser.nev,
      type: parsedUser.tipus,
      competitorId: parsedUser.versenyzoId,
    };
  } else {
    router.push("/login"); 
  }
};
  
      // Kijelentkezés
      const logout = () => {
        sessionStorage.removeItem("user");
        window.dispatchEvent(new Event("loginStatusChanged"));
        router.push("/");
      };
  
      onMounted(loadUserData);
  
      return { user, logout };
    },
  };
  </script>
  
  <style scoped>
  .card {
    max-width: 400px;
    margin: auto;
  }
  </style>
  