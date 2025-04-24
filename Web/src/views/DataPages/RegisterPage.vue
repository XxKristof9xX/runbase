<template>
  <v-container class="fill-height d-flex justify-center align-center">
    <v-card class="pa-10" width="100%" max-width="700" elevation="10">
      <v-card-title class="text-h5 text-md-h3 text-sm-h4 text-center font-weight-bold">
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

          <v-checkbox
            v-model="form.includeAthleteData"
            label="Saját versenyzői adatok megadása"
            class="mb-5"
          ></v-checkbox>

          <div v-if="form.includeAthleteData">
            <v-text-field
              v-model="form.athlete.nev"
              label="Név"
              outlined
              dense
              class="mb-4"
              required
            ></v-text-field>

            <v-text-field
              v-model="form.athlete.szuletesiEv"
              label="Születési év"
              type="number"
              outlined
              dense
              class="mb-4"
              required
            ></v-text-field>

            <v-select
              v-model="form.athlete.neme"
              :items="['Férfi', 'Nő']"
              label="Neme"
              outlined
              dense
              class="mb-4"
              required
            ></v-select>

            <v-text-field
              v-model="form.athlete.tajSzam"
              label="TAJ szám"
              outlined
              dense
              class="mb-4"
              required
            ></v-text-field>
          </div>

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
        includeAthleteData: false,
        athlete: {
          nev: "",
          szuletesiEv: "",
          neme: "",
          tajSzam: "",
        },
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

  let versenyzoTajSzam = null;
  if (this.form.includeAthleteData) {
    try {
      const versenyzoResponse = await axios.post(
        "https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/versenyzo/hozzaad",
        {
          nev: this.form.athlete.nev,
          szuletesiEv: this.form.athlete.szuletesiEv,
          neme: this.form.athlete.neme === "Férfi" ? "ferfi" : "no",
          tajSzam: this.form.athlete.tajSzam,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      versenyzoTajSzam = versenyzoResponse.data.tajSzam;
    } catch (error) {
      this.errorMessage = error.response?.data || "Hiba történt a versenyző regisztrálásakor!";
      return;
    }
  }
  let felhasznaloId = null;
  try {
    const response = await axios.post(
      "https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/felhasznalok",
      {
        nev: this.form.username,
        jelszo: this.form.password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    felhasznaloId = response.data.id;

    if (response.status === 200 || response.status === 201) {
      if (this.form.includeAthleteData && versenyzoTajSzam && felhasznaloId) {
        await axios.put(
          "https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/versenyzo/addVersenyzo",
          {
            tajSzam: versenyzoTajSzam,
            felhasznaloId: felhasznaloId,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      this.successMessage = "Sikeres regisztráció! Most bejelentkezhetsz.";
      setTimeout(() => this.$router.push("/login"), 2000);
    } else {
      this.errorMessage = "Hiba történt a regisztráció során!";
    }
  } catch (error) {
    if (error.response?.status === 409) {
      this.errorMessage = "Ez a felhasználónév már foglalt!";
    } else {
      this.errorMessage = error.response?.data || "Hiba történt a regisztráció során!";
    }
  }
},
  },
};
</script>
