<template>
    <h1 class="my-3">Regisztráció</h1>
    <div class="container">
      <div class="row">
        <form @submit.prevent="register">
          <div class="form-outline mb-4">
            <input type="text" id="username" class="form-control" v-model="form.username" required />
            <label class="form-label" for="username">Felhasználónév (min. 6 karakter)</label>
          </div>
  
          <div class="form-outline mb-4">
            <input type="password" id="password" class="form-control" v-model="form.password" required />
            <label class="form-label" for="password">Jelszó (min. 8 karakter)</label>
          </div>
  
          <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
          <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
  
          <button type="submit" class="btn btn-primary btn-block mb-4">Regisztráció</button>
          <router-link to="/login" class="btn btn-secondary">Vissza a bejelentkezéshez</router-link>
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
        },
        errorMessage: "",
        successMessage: "",
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
            {
              headers: { "Content-Type": "application/json" },
            }
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
  
  <style>
  h1 {
    font-size: 3em;
  }
  </style>
  