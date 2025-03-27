<template>
  <v-container class="fill-height d-flex justify-center align-center">
    <v-card class="pa-10" width="100%" max-width="700" elevation="10">
      <v-card-title class="text-h3 text-md-h3 text-center font-weight-bold">
        Bejelentkezés
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="login">
          <v-text-field
            v-model="form.username"
            label="Felhasználónév"
            outlined
            dense
            class="mb-5"
            required
          ></v-text-field>

          <v-text-field
            v-model="form.password"
            label="Jelszó"
            type="password"
            outlined
            dense
            class="mb-5"
            required
          ></v-text-field>
          <v-alert v-if="errorMessage" type="error" dense class="mb-5">
            {{ errorMessage }}
          </v-alert>

          <v-btn type="submit" color="primary" block class="mb-5" height="55">
            Bejelentkezés
          </v-btn>

          <v-btn to="/registration" color="secondary" block height="55">
            Regisztráció
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
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

        if (response.data?.apiKey && response.data?.user) {
          window.alert("Sikeres bejelentkezés!");

          const userData = {
            id: response.data.user.id,
            nev: response.data.user.nev,
            tipus: response.data.user.tipus,
            versenyzoId: response.data.user.versenyzoId,
            apiKey: response.data.apiKey,
          };

          sessionStorage.setItem("user", JSON.stringify(userData));
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
