<template>
    <h1 class="my-3 text-center">Verseny feltöltés</h1>
    <div class="container mt-4">
        <div v-if="isAuthorized">
            <v-card class="pa-4 custom-card">
                <h2 class="text-center">Új verseny létrehozása</h2>

                <v-form @submit.prevent="createRace" ref="raceForm">
                    <v-text-field v-model="newRace.nev" label="Verseny neve" required></v-text-field>
                    <v-text-field v-model="newRace.helyszin" label="Helyszín" required></v-text-field>
                    <v-text-field v-model="newRace.datum" label="Dátum" type="date" required></v-text-field>
                    <v-textarea v-model="newRace.leiras" label="Leírás"></v-textarea>
                    <v-text-field v-model.number="newRace.maxLetszam" label="Max létszám" type="number"
                        required></v-text-field>

                    <v-file-input v-model="selectedFile" label="Kép (opcionális)" accept="image/*" show-size counter
                        :rules="[fileSizeRule]"></v-file-input>

                    <v-text-field v-for="(tav, index) in tavok" :key="index" v-model="tav.tav"
                        :label="`Táv #${index + 1}`" class="mb-2" required></v-text-field>
                    <v-btn color="primary" @click="addTav">+ Új táv</v-btn>

                    <div class="d-flex justify-center mt-3">
                        <v-btn type="submit" color="success">Létrehozás</v-btn>
                    </div>

                </v-form>
            </v-card>
        </div>

        <div v-else class="text-center mt-5">
            <v-alert type="error" title="Hozzáférés megtagadva">
                Nincs jogosultságod az oldal megtekintéséhez.
            </v-alert>
        </div>
    </div>
</template>


<script>
import api from '@/services/api';
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

export default {
    setup() {
        const router = useRouter();
        const newRace = ref({
            nev: "",
            helyszin: "",
            datum: "",
            leiras: "",
            maxLetszam: null,
        });
        const selectedFile = ref(null);
        const user = ref(null);
        const isAuthorized = ref(false);
        const tavok = ref([{ tav: "" }]);
        const addTav = () => {
            tavok.value.push({ tav: "" });
        };

        const fileSizeRule = (value) => {
            return !value || value.size <= 3 * 1024 * 1024 || "Maximum fájlméret: 3MB";
        };




        const createRace = async () => {
            const formData = new FormData();
            for (const [key, value] of Object.entries(newRace.value)) {
                formData.append(key, value);
            }
            if (selectedFile.value) {
                formData.append("kep", selectedFile.value);
            }

            try {
                const raceResponse = await api.post(
                    "/versenyek",
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );

                const newRaceId = raceResponse.data.id || raceResponse.data.versenyId;
                for (const t of tavok.value) {
                    await api.post("/Versenytav",
                        {
                            versenyId: newRaceId,
                            tav: t.tav,
                        }
                    );
                }

                alert("Verseny és távok sikeresen létrehozva!");
                router.push("/");
            } catch (error) {
                console.error("Hiba a létrehozás során:", error);
                alert("Hiba történt a verseny vagy a távok létrehozásakor.");
            }
        };


        onMounted(() => {
            const storedUser = sessionStorage.getItem("user");
            if (!storedUser) {
                router.push("/login");
                return;
            }

            const parsedUser = JSON.parse(storedUser);
            user.value = parsedUser;
            isAuthorized.value = ["admin", "organizer"].includes(parsedUser.tipus);
            if (!isAuthorized.value) {
                alert("Nincs jogosultságod az oldal megtekintéséhez.");
                router.push("/");
                return;
            }

            api.defaults.headers.common["Authorization"] = `Bearer ${parsedUser.apiKey}`;
        });

        return {
            newRace,
            selectedFile,
            createRace,
            fileSizeRule,
            isAuthorized,
            tavok,
            addTav,
        };
    },
};
</script>

<style scoped>
.custom-card {
    width: 100%;
    max-width: 900px;
    margin: auto;
}
</style>