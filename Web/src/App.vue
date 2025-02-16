<template>
  <!-- Navigáció -->
  <nav class="navbar navbar-expand-lg">
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand"><img src="../Images/RunBase_full_logo.png" alt=""></router-link>
      <button type="button" class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
        <span class="navbar-toggler-icon" onclick="navbarMenu()">
          <div id="myLinks" class="navbar-nav">
            <router-link to="/" class="nav-item nav-link active">Főoldal</router-link>
            <router-link to="/competition" class="nav-item nav-link">Versenyek</router-link>
            <router-link to="/result" class="nav-item nav-link">Eredmények</router-link>
            <router-link to="/contact" class="nav-item nav-link">Kapcsolat</router-link>
          </div>
        </span>
      </button>
      <div class="collapse navbar-collapse" id="navbarCollapse">
        <div class="navbar-nav">
          <router-link to="/" class="nav-item nav-link active">Főoldal</router-link>
          <router-link to="/versenyek" class="nav-item nav-link">Versenyek</router-link>
          <router-link to="/eredmenyek" class="nav-item nav-link">Eredmények</router-link>
          <router-link to="/kapcsolat" class="nav-item nav-link">Kapcsolat</router-link>
        </div>
        <div class="navbar-nav ms-auto">
          <button id="login" @click="toggleLogin">
            <router-link v-if="!isLoggedIn" to="/login" class="nav-item nav-link">Bejelentkezés</router-link>
            <router-link v-else @click="logout" class="nav-item nav-link">Kijelentkezés</router-link>
          </button>
        </div>
      </div>
    </div>
  </nav>
  <router-view/>
</template>

<script>
export default {
  data() {
    return {
      isLoggedIn: false, // Felhasználói állapot
    };
  },
  methods: {
    toggleLogin() {
      this.isLoggedIn = !this.isLoggedIn;
    },
    logout() {
      this.isLoggedIn = false;
      localStorage.removeItem("user");
      this.$router.push("/login");
    },
  },
  created() {
    const user = localStorage.getItem("user");
    if (user) {
      this.isLoggedIn = true;
    }
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
  
  body{
    background-color: #ADD8E6;
  }
  nav {
    /* padding: 30px; */
    background-color: #20283F;
    justify-content: flex-start;
  }
  .navbar {
    /* padding: 30px; */
    /* color: #20283F; */
  }
  
  nav a {
    color: rgb(10, 139, 190) !important;
    text-decoration: none; /* Aláhúzás eltávolítása */
    transition: color 0.3s; /* Színátmenet animáció */
  }
  
  nav a.router-link-exact-active {
    color: white !important;
    font-weight: bold; /* (opcionális) Vastagabb betű */
  }
  
  nav a:hover {
    color: #00bfff; /* Hover szín */
  }
  
  img{
    /* height: 6%; */
    width: 7em;
    /* margin: 0 auto; */
    margin-bottom: 13px;
    float: left;
  }
  .navbar ul li {
    float: left;
  }
  
  #login{
    border: 2px solid white;
    border-radius: 5px;
    background-color: #6F8FAF;
  }
  </style>