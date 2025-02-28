<template>
  <h1 class="my-3">Bejelentkezés</h1>
  <div class="container">
    <div class="row">
      <form @submit.prevent="login">
        <!-- Username input -->
        <div class="form-outline mb-4">
          <input
            type="text"
            id="username"
            class="form-control"
            v-model="form.username"
            required
          />
          <label class="form-label" for="username">Felhasználónév</label>
        </div>

        <!-- Password input -->
        <div class="form-outline mb-4">
          <input
            type="password"
            id="password"
            class="form-control"
            v-model="form.password"
            required
          />
          <label class="form-label" for="password">Jelszó</label>
        </div>

        <!-- Remember me checkbox -->
        <div class="form-check mb-4">
          <input
            class="form-check-input"
            type="checkbox"
            id="rememberMe"
            v-model="form.remember"
          />
          <label class="form-check-label" for="rememberMe">
            Emlékezzen rám
          </label>
        </div>

        <!-- Submit button -->
        <button type="submit" class="btn btn-primary btn-block mb-4">
          Bejelentkezés
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      loginDatas: [], // Az API-tól érkező felhasználói adatok
      form: {
        username: "", // Felhasználónév
        password: "", // Jelszó
        remember: false, // "Emlékezzen rám" opció
      },
    };
  },

  created() {
    // Felhasználói adatok betöltése az API-ból
    axios
      .get("/api/felhasznalok/login")
      .then((response) => {
        this.loginDatas = response.data;
      })
      .catch((error) => console.error("API hiba:", error));
  },

  methods: {
    login() {
      // Felhasználó ellenőrzése
      const user = this.loginDatas.find(
        (user) =>
          user.felhasznalonev === this.form.username &&
          user.jelszo === this.form.password
      );

      if (user) {
        // Sikeres bejelentkezés
        window.alert("Sikeres bejelentkezés!");
        this.$router.push("/"); // Átirányítás a főoldalra

        // Opcionális: Bejelentkezési adatok tárolása (ha a "Remember me" be van jelölve)
        if (this.form.remember) {
          localStorage.setItem("user", JSON.stringify(user));
        }

        // Bejelentkezési állapot frissítése
        this.$root.$emit("loginStatusChanged", true);
      } else {
        // Sikertelen bejelentkezés
        window.alert("Helytelen felhasználónév vagy jelszó!");
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
