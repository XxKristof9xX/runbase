<template>
  <v-container class="fill-height d-flex justify-center align-center">
    <v-card class="pa-10" width="100%" max-width="700" elevation="10">
      <v-card-title class="text-h5 text-md-h3 text-sm-h4 text-center font-weight-bold">
        Regisztráció
      </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" @submit.prevent="register">
          <v-text-field v-model="form.username" :rules="usernameRules" label="Felhasználónév (min. 6 karakter)" outlined
            dense class="mb-5" required></v-text-field>

          <v-text-field v-model="form.password" :rules="passwordRules" label="Jelszó (min. 8 karakter)" type="password"
            outlined dense class="mb-5" required></v-text-field>

          <v-checkbox v-model="form.includeAthleteData" label="Saját versenyzői adatok megadása"
            class="mb-5"></v-checkbox>

          <div v-if="form.includeAthleteData">
            <v-text-field v-model="form.athlete.nev" :rules="nameRules" label="Név" outlined dense class="mb-4"
              required></v-text-field>

            <v-text-field v-model="form.athlete.szuletesiEv" :rules="birthYearRules" label="Születési év" type="number"
              outlined dense class="mb-4" required></v-text-field>

            <v-select v-model="form.athlete.neme" :items="['Férfi', 'Nő']" :rules="genderRules" label="Neme" outlined
              dense class="mb-4" required></v-select>

            <v-text-field v-model="form.athlete.tajSzam" :rules="tajRules" label="TAJ szám" outlined dense class="mb-4"
              required></v-text-field>
          </div>

          <v-alert v-if="errorMessage" type="error" dense class="mb-5">
            {{ errorMessage }}
          </v-alert>

          <v-alert v-if="successMessage" type="success" dense class="mb-5">
            {{ successMessage }}
          </v-alert>

          <v-btn :disabled="!valid || loading" type="submit" color="primary" block class="mb-5" height="55">
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
import api from '@/services/api';

export default {
  data() {
    return {
      valid: false,
      loading: false,
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
      usernameRules: [
        v => !!v || "Felhasználónév megadása kötelező",
        v => (v && v.length >= 6) || "Minimum 6 karakter hosszú legyen",
      ],
      passwordRules: [
        v => !!v || "Jelszó megadása kötelező",
        v => (v && v.length >= 8) || "Minimum 8 karakter hosszú legyen",
      ],
      nameRules: [
        v => !!v || "Név megadása kötelező",
      ],
      birthYearRules: [
        v => !!v || "Születési év megadása kötelező",
        v => (v && Number(v) > 1900 && Number(v) <= new Date().getFullYear()) || "Érvényes évszámot adj meg",
      ],
      genderRules: [
        v => !!v || "Nem megadása kötelező",
      ],
      tajRules: [
        v => !!v || "TAJ szám megadása kötelező",
        v => (v && /^\d{9}$/.test(v)) || "A TAJ szám 9 számjegyű legyen",
      ],
    };
  },
  watch: {
    "form.includeAthleteData"(val) {
      if (!val) {
        this.form.athlete = {
          nev: "",
          szuletesiEv: "",
          neme: "",
          tajSzam: "",
        };
        this.$nextTick(() => {
          this.$refs.form && this.$refs.form.validate();
        });
      }
    }
  },
  methods: {
    async register() {
      this.errorMessage = "";
      this.successMessage = "";
      const isValid = await this.$refs.form.validate();
      if (!isValid) {
        this.errorMessage = "Kérlek, töltsd ki az összes kötelező mezőt helyesen!";
        return;
      }

      this.loading = true;
      let versenyzoTajSzam = null;
      if (this.form.includeAthleteData) {
        try {
          const versenyzoResponse = await api.post(
            "/versenyzo/hozzaad",
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
          this.loading = false;
          this.errorMessage = error.response?.data || "Hiba történt a versenyző regisztrálásakor!";
          return;
        }
      }

      let felhasznaloId = null;
      try {
        const response = await api.post(
          "/felhasznalok",
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
            await api.put(
              "/versenyzo/addVersenyzo",
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
          this.loading = false;
          setTimeout(() => this.$router.push("/login"), 2000);
        } else {
          this.loading = false;
          this.errorMessage = "Hiba történt a regisztráció során!";
        }
      } catch (error) {
        this.loading = false;
        if (error.response?.status === 409) {
          this.errorMessage = "Ez a felhasználónév már foglalt!";
        } else {
          this.errorMessage = error.response?.data || "Hiba történt a regisztráció során!";
        }
      }
    }
  }
};
</script>
