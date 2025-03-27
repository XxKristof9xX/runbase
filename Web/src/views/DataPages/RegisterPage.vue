<template>
  <v-container class="fill-height d-flex justify-center align-center">
    <v-card class="pa-10" width="100%" max-width="700" elevation="10">
      <v-card-title class="text-h3 text-md-h3 text-center font-weight-bold">
        Regisztráció
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="register">
          <v-text-field
            v-model="form.username"
            label="Felhasználónév (min. 6 karakter)"
            outlined
            dense
            class="mb-5"
            required
          ></v-text-field>

          <v-text-field
            v-model="form.password"
            label="Jelszó (min. 8 karakter)"
            type="password"
            outlined
            dense
            class="mb-5"
            required
          ></v-text-field>

          <v-alert v-if="errorMessage" type="error" dense class="mb-5">
            {{ errorMessage }}
          </v-alert>

          <v-alert v-if="successMessage" type="success" dense class="mb-5">
            {{ successMessage }}
          </v-alert>

          <v-btn type="submit" color="primary" block class="mb-5" height="55">
            Regisztráció
          </v-btn>

          <v-btn to="/login" color="secondary" block height="55">
            Vissza a bejelentkezéshez
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
      },
      errorMessage: "",
      successMessage: "",
      rules: {
        minLength: (length) => (value) =>
          value.length >= length || `Legalább ${length} karakter szükséges!`,
      },
    };
  },
  methods: {
    async register() {
      this.errorMessage = "";
      this.successMessage = "";

      if (this.form.username.length < 6) {
        this.errorMessage = "A felhasználónévnek legalább 6 karakter hosszúnak kell lennie!";
        return;
      }
      if (this.form.password.length < 8) {
        this.errorMessage = "A jelszónak legalább 8 karakter hosszúnak kell lennie!";
        return;
      }

      try {
        const response = await axios.post(
          "https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/felhasznalok/",
          {
            nev: this.form.username,
            jelszo: this.form.password,
          },
          { headers: { "Content-Type": "application/json" } }
        );

        if (response.status === 201 || response.status === 200) {
          this.successMessage = "Sikeres regisztráció! Most bejelentkezhetsz.";
          setTimeout(() => this.$router.push("/login"), 2000);
        } else {
          this.errorMessage = "Hiba történt a regisztráció során!";
        }
      } catch (error) {
        if (error.response?.status === 409) {
          this.errorMessage = "Ez a felhasználónév már foglalt! Kérlek, válassz másikat.";
        } else {
          this.errorMessage = error.response?.data || "Hiba történt a regisztráció során!";
        }
      }
    },
  },
};
</script>
