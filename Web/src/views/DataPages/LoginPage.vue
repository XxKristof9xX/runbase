<template>
  <h1 class="my-3">Bejelentkezés</h1>
  <div class="container">
    <div class="row">
      <form @submit.prevent="login">
        <div class="form-outline mb-4">
          <input type="text" id="username" class="form-control" v-model="form.username" required />
          <label class="form-label" for="username">Felhasználónév</label>
        </div>

        <div class="form-outline mb-4">
          <input type="password" id="password" class="form-control" v-model="form.password" required />
          <label class="form-label" for="password">Jelszó</label>
        </div>

        <div class="form-check mb-4">
          <input class="form-check-input" type="checkbox" id="rememberMe" v-model="form.remember" />
          <label class="form-check-label" for="rememberMe">Emlékezzen rám</label>
        </div>

        <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

        <button type="submit" class="btn btn-primary btn-block mb-4">Bejelentkezés</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      form: {
        username: "",
        password: "",
        remember: false,
      },
      errorMessage: "",
    };
  },
  methods: {
  async login() {
    try {
      const response = await axios.post(
        "https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/felhasznalok/login",
        {
          Nev: this.form.username,
          Jelszo: this.form.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (typeof response.data === "string" && response.data.includes("Sikeres")) {
        window.alert("Sikeres bejelentkezés!");

        // Felhasználó mentése és esemény küldése
        sessionStorage.setItem("user", this.form.username);
        window.dispatchEvent(new Event("loginStatusChanged")); 
        
        this.$router.push("/");
      } else {
        this.errorMessage = "Helytelen felhasználónév vagy jelszó!";
      }
    } catch (error) {
      this.errorMessage = error.response?.data || "Hiba történt a bejelentkezés során!";
    }
  },
},
};
</script>

<style>
h1 {
  font-size: 3em;
}
</style>
