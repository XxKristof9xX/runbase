<template>
  <div id="app">
    <!-- Navigációs sáv -->
    <nav class="navbar navbar-expand-lg">
      <div class="container-fluid">
        <router-link to="/" class="navbar-brand">
          <img src="../Images/RunBase_full_logo.png" alt="RunBase Logo" />
        </router-link>
        <button type="button" class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarCollapse">
          <div class="navbar-nav">
            <router-link to="/" class="nav-item nav-link">Főoldal</router-link>
            <router-link to="/versenyek" class="nav-item nav-link">Versenyek</router-link>
            <router-link to="/eredmenyek" class="nav-item nav-link">Eredmények</router-link>
            <router-link to="/kapcsolat" class="nav-item nav-link">Kapcsolat</router-link>
          </div>

          <!-- Admin panel csak adminoknak és szervezőknek -->
          <div class="navbar-nav ms-auto" v-if="isAdminOrOrganizer">
            <router-link to="/adminPage" class="nav-item nav-link">Admin Panel</router-link>
          </div>

          <div class="navbar-nav ms-auto">
            <template v-if="isLoggedIn">
              <router-link to="/profil" class="nav-item nav-link">Profil</router-link>
              <button class="btn btn-danger nav-item nav-link" @click="logout">Kijelentkezés</button>
            </template>
            <router-link v-else to="/login" class="nav-item nav-link">Bejelentkezés</router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Tartalom -->
    <router-view />
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";

export default {
  setup() {
    const router = useRouter();
    const isLoggedIn = ref(false);
    const userRole = ref(null);

    const checkLoginStatus = () => {
      const user = sessionStorage.getItem("user");
      if (user) {
        const parsedUser = JSON.parse(user);
        isLoggedIn.value = true;
        userRole.value = parsedUser.tipus; // Olvassa közvetlenül a sessionStorage-ból
      } else {
        isLoggedIn.value = false;
        userRole.value = null;
      }
    };

    const updateLoginStatus = () => {
      checkLoginStatus();
    };

    window.addEventListener("loginStatusChanged", updateLoginStatus);
    onMounted(checkLoginStatus);

    const logout = () => {
      sessionStorage.removeItem("user");
      checkLoginStatus();
      window.dispatchEvent(new Event("loginStatusChanged"));
      router.push("/");
    };

    // Admin vagy szervező jogosultság ellenőrzése
    const isAdminOrOrganizer = computed(() => {
      return userRole.value === "admin" || userRole.value === "organizer";
    });

    return { 
      isLoggedIn, 
      isAdminOrOrganizer, 
      logout 
    };
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

body {
  background-color: #ADD8E6;
}

nav {
  background-color: #20283F;
}

.navbar-nav {
  display: flex;
  align-items: center;
}

nav a {
  color: rgb(10, 139, 190) !important;
  text-decoration: none;
  transition: color 0.3s;
}

nav a.router-link-exact-active {
  color: white !important;
  font-weight: bold;
}

nav a:hover {
  color: #00bfff;
}

img {
  width: 7em;
  margin-bottom: 13px;
  float: left;
}

#login {
  border: 2px solid white;
  border-radius: 5px;
  background-color: #6F8FAF;
}

.nav-item.nav-link {
  padding: 10px 15px;
  border-radius: 5px;
}

.btn-danger {
  margin-left: 10px;
}
</style>
