<template>
  <v-container>
    <h1 class="my-4 text-center">API URL Beállítás</h1>
    <div v-if="isAdmin">
      <p><strong>Jelenlegi API URL:</strong> {{ currentApi }}</p>

      <v-text-field
        v-model="apiUrl"
        label="Új API URL"
        placeholder="https://example.com/api"
        clearable
      />
      <v-btn color="primary" @click="saveApiUrl">Mentés</v-btn>
      <v-alert v-if="saved" type="success" class="mt-3">Mentve!</v-alert>
    </div>
    <div v-else class="text-center mt-5">
      <h2>Nincs jogosultság az oldal megtekintéséhez.</h2>
    </div>
  </v-container>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { setApiBaseURL, getApiBaseURL } from "@/services/api";

export default {
  setup() {
    const router = useRouter();
    const apiUrl = ref("");
    const currentApi = ref("");
    const saved = ref(false);
    const userRole = ref(null);

    const isAdmin = computed(() => userRole.value === "admin");

    onMounted(() => {
      const storedUser = sessionStorage.getItem("user");
      if (!storedUser) {
        router.push("/login");
        return;
      }
      const parsed = JSON.parse(storedUser);
      userRole.value = parsed.tipus;

      apiUrl.value = localStorage.getItem("apiBaseURL") || "";
      currentApi.value = getApiBaseURL();
    });

    const saveApiUrl = () => {
      setApiBaseURL(apiUrl.value);
      currentApi.value = apiUrl.value;
      saved.value = true;
      setTimeout(() => (saved.value = false), 2000);
    };

    return {
      apiUrl,
      saveApiUrl,
      saved,
      isAdmin,
      currentApi,
    };
  },
};
</script>
