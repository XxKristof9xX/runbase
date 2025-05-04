<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg">
      <div class="container-fluid">
        <router-link to="/" class="navbar-brand">
          <img src="../Images/RunBase_full_logo.png" alt="RunBase Logo" />
        </router-link>
        <button
          type="button"
          class="navbar-toggler"
          data-bs-toggle="collapse"
          data-bs-target="#navbarCollapse"
          aria-controls="navbarCollapse"
          aria-expanded="false"
          aria-label="Toggle navigation"
          @click="toggleMenu"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarCollapse" ref="navbarCollapse">
          <div class="navbar-nav">
            <router-link to="/" class="nav-item nav-link" @click="closeMenu">Főoldal</router-link>
            <router-link to="/versenyek" class="nav-item nav-link" @click="closeMenu">Versenyek</router-link>
            <router-link to="/eredmenyek" class="nav-item nav-link" @click="closeMenu">Eredmények</router-link>
            <router-link to="/forum" class="nav-item nav-link" @click="closeMenu">Fórum</router-link>
            <router-link to="/kapcsolat" class="nav-item nav-link" @click="closeMenu">Kapcsolat</router-link>
          </div>
          <div class="navbar-nav ms-auto" v-if="isAdminOrOrganizer">
            <router-link to="/adminPage" class="nav-item nav-link" @click="closeMenu">Admin Panel</router-link>
            <router-link to="/competitionModify" class="nav-item nav-link" @click="closeMenu">Verseny Módosítás</router-link>
            <router-link to="/versenyFeltoltes" class="nav-item nav-link" @click="closeMenu">Verseny Feltöltése</router-link>
          </div>
          <div class="navbar-nav ms-auto">
            <template v-if="isLoggedIn">
              <router-link to="/profil" class="nav-item nav-link" @click="closeMenu">Profil</router-link>
              <button class="btn btn-danger nav-item nav-link" @click="logout">Kijelentkezés</button>
            </template>
            <router-link v-else to="/login" class="nav-item nav-link" @click="closeMenu">Bejelentkezés</router-link>
          </div>
        </div>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import { Collapse } from "bootstrap";

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
        userRole.value = parsedUser.tipus;
      } else {
        isLoggedIn.value = false;
        userRole.value = null;
      }
    };

    const updateLoginStatus = () => {
      checkLoginStatus();
    };

    const toggleMenu = () => {
      const menu = document.getElementById("navbarCollapse");
      if (menu) {
        const bsCollapse = Collapse.getInstance(menu) || new Collapse(menu, { toggle: false });
        bsCollapse.toggle();
      }
    };

    const closeMenu = () => {
      const menu = document.getElementById("navbarCollapse");
      if (menu && menu.classList.contains("show")) {
        const bsCollapse = Collapse.getInstance(menu) || new Collapse(menu, { toggle: false });
        bsCollapse.hide();
      }
    };

    onMounted(() => {
      checkLoginStatus();
      document.addEventListener("click", (event) => {
        const menu = document.getElementById("navbarCollapse");
        if (menu && menu.classList.contains("show") && !menu.contains(event.target)) {
          const bsCollapse = Collapse.getInstance(menu) || new Collapse(menu, { toggle: false });
          bsCollapse.hide();
        }
      });
    });

    window.addEventListener("loginStatusChanged", updateLoginStatus);

    const logout = () => {
      sessionStorage.removeItem("user");
      checkLoginStatus();
      window.dispatchEvent(new Event("loginStatusChanged"));
      router.push("/");
      closeMenu();
    };

    const isAdminOrOrganizer = computed(() => {
      return userRole.value === "admin" || userRole.value === "organizer";
    });

    return {
      isLoggedIn,
      isAdminOrOrganizer,
      logout,
      closeMenu,
      toggleMenu,
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
  background-color: #ffffff;
}

.navbar {
  background-color: #20283F;
  padding: 10px 0;
}

.navbar-nav {
  display: flex;
  align-items: center;
}

.navbar-brand img {
  width: 7em;
  margin-bottom: 5px;
}

.navbar a {
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

.nav-item.nav-link {
  padding: 10px 15px;
  border-radius: 5px;
}

.btn-danger {
  margin-left: 10px;
  color: white !important;
}

@media (max-width: 991px) {
  .navbar-toggler {
    border: none !important;
  }

  .navbar-toggler-icon {
    filter: invert(100%);
  }

  .navbar-nav {
    width: 100%;
    text-align: center;
  }
  
  .nav-item {
    margin-bottom: 10px;
  }
}
</style>
