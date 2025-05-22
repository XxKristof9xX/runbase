<template>
  <v-app>
    <div id="app">
      <nav class="navbar navbar-expand-xl">
        <div class="container-fluid">
          <router-link to="/" class="navbar-brand">
            <img src="../Images/RunBase_full_logo.png" alt="RunBase Logo" />
          </router-link>
          <button type="button" class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navbarCollapse"
            aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation" @click="toggleMenu">
            <span class="navbar-toggler-icon"></span>
          </button>

          <div class="collapse navbar-collapse" id="navbarCollapse" ref="navbarCollapse">
            <div class="navbar-nav">
              <v-btn text class="mx-1" @click="navigateTo('/')">Főoldal</v-btn>
              <v-btn text class="mx-1" @click="navigateTo('/versenyek')">Versenyek</v-btn>
              <v-btn text class="mx-1" @click="navigateTo('/eredmenyek')">Eredmények</v-btn>
              <v-btn text class="mx-1" @click="navigateTo('/forum')">Fórum</v-btn>
              <v-btn text class="mx-1" @click="navigateTo('/kapcsolat')">Kapcsolat</v-btn>
            </div>

            <div class="navbar-nav ms-auto" v-if="isAdminOrOrganizer">
              <v-menu offset-y>
                <template #activator="{ props }">
                  <v-btn color="primary" v-bind="props" class="mx-2" dark>
                    Admin menü
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="navigateTo('/adminPage')">
                    <v-list-item-title>Admin Panel</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="navigateTo('/competitionModify')">
                    <v-list-item-title>Verseny Módosítás</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="navigateTo('/versenyFeltoltes')">
                    <v-list-item-title>Verseny Feltöltése</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="navigateTo('/qrgeneralas')">
                    <v-list-item-title>QR Generálás</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>

            <div class="navbar-nav ms-auto">
              <template v-if="isLoggedIn">
                <v-btn text class="mx-1" @click="navigateTo('/profil')">Profil</v-btn>
                <v-btn color="error" class="mx-1 logout-btn" @click="logout">Kijelentkezés</v-btn>
              </template>
              <template v-else>
                <v-btn text class="mx-1" @click="navigateTo('/login')">Bejelentkezés</v-btn>
              </template>
            </div>
          </div>
        </div>
      </nav>

      <router-view />
    </div>
  </v-app>
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

    const navigateTo = (path) => {
      router.push(path);
      closeMenu();
    };

    return {
      isLoggedIn,
      isAdminOrOrganizer,
      logout,
      closeMenu,
      toggleMenu,
      navigateTo
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

.navbar-nav .v-btn {
  background-color: #20283F !important;
  color: white !important;
  border: 2px solid white;
  border-radius: 10px;
}


.navbar-nav .logout-btn {
  background-color: #d32f2f !important;
  color: white !important;
  border: 2px solid white;
  border-radius: 10px;
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

h1 {
  margin-bottom: 50px !important;
}

@media (max-width: 1200px) {
  .navbar-toggler {
    border: none !important;
  }

  .navbar-toggler-icon {
    filter: invert(100%);
  }

  .navbar-nav {
    width: 100%;
    text-align: center;
    flex-direction: column;
  }

  .navbar-nav .v-btn {
    display: block;
    width: 100%;
    margin: 5px 0;
    justify-content: center;
  }
}
</style>
