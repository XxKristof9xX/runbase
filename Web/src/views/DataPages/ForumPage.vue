<template>
  <v-container>
    <v-list>
      <v-list-item v-for="post in posts" :key="post.id" class="mb-4">
        <v-card class="pa-4">
          <v-card-title>{{ post.felhasznaloNev || 'Ismeretlen felhasználó' }}</v-card-title>
          <v-card-subtitle>{{ formatDate(post.datum) }}</v-card-subtitle>
          <v-img v-if="post.kep" :src="getImage(post.kep)" height="200px" contain class="mb-2"></v-img>
          <v-card-text>{{ post.tartalom }}</v-card-text>
        </v-card>
      </v-list-item>
    </v-list>

    <v-divider class="my-4"></v-divider>

    <v-card class="pa-4 mb-4" v-if="user">
      <v-textarea v-model="newPost.tartalom" label="Írd meg a bejegyzésed..." outlined></v-textarea>
      <v-file-input label="Kép feltöltése" accept="image/*" @change="handleFileUpload"></v-file-input>
      <v-btn color="primary" @click="submitPost" :disabled="!newPost.tartalom && !newPost.kep">Küldés</v-btn>
    </v-card>
    <p v-else class="text-center">Bejelentkezés szükséges a hozzászóláshoz.</p>
  </v-container>
</template>

<script>
import { ref, onMounted } from "vue";
import axios from "axios";

export default {
  setup() {
    const posts = ref([]);
    const newPost = ref({ tartalom: "", kep: null });
    const file = ref(null);
    const user = ref(null);
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      user.value = {
        id: parsedUser.id,
        username: parsedUser.nev,
        type: parsedUser.tipus,
        competitorId: parsedUser.versenyzoId,
        apiKey: parsedUser.apiKey,
      };
      axios.defaults.headers.common["Authorization"] = `Bearer ${user.value.apiKey}`;
    }

    const fetchPosts = async () => {
      try {
        const response = await axios.get("https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/forum");
        posts.value = response.data;
      } catch (error) {
        console.error("Hiba a bejegyzések lekérésekor:", error);
      }
    };

    const handleFileUpload = (event) => {
      file.value = event.target.files[0];
    };

    const submitPost = async () => {
      if (!user.value) {
        alert("Csak bejelentkezett felhasználók posztolhatnak!");
        return;
      }
      if (!newPost.value.tartalom) {
        console.error("Hiba: A tartalom nem lehet üres!");
        return;
      }
      
      const formData = new FormData();
      formData.append("felhasznaloId", user.value.id);
      formData.append("tartalom", newPost.value.tartalom);
      if (file.value) {
        formData.append("kep", file.value);
      }

      try {
        await axios.post("https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api/forum", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        newPost.value = { tartalom: "", kep: null };
        file.value = null;
        fetchPosts();
      } catch (error) {
        console.error("Hiba a bejegyzés küldésekor:", error);
      }
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString("hu-HU", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    onMounted(fetchPosts);

    return { posts, newPost, handleFileUpload, submitPost, formatDate, user };
  },
  methods: {
    getImage(base64Data) {
      return `data:image/jpeg;base64,${base64Data}`;
    }
  }
};
</script>
