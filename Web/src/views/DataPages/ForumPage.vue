<template>
  <h1 class="my-3">Fórum</h1>

  <v-container class="forum-container">
    <v-list-item v-for="post in posts" :key="post.id" class="mb-4">
      <v-card class="forum-post">
        <v-btn v-if="user && (user.type === 'admin' || user.type === 'organizer')" icon color="red"
          class="delete-button" @click="deletePost(post.id)">
          <v-icon size="20">mdi-close</v-icon>
        </v-btn>

        <div class="post-header">
          <div class="username">{{ post.felhasznaloNev || 'Ismeretlen felhasználó' }}</div>
        </div>
        <div class="post-content">
          <div class="post-image-wrapper" v-if="post.kep">
            <v-img :src="getImage(post.kep)" height="300" width="auto" class="post-image" contain></v-img>
          </div>
          <div class="post-text">
            <div class="post-body">{{ post.tartalom }}</div>
            <div class="timestamp">{{ formatDate(post.datum) }}</div>
          </div>
        </div>
      </v-card>
    </v-list-item>

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
import api from '@/services/api';

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
      api.defaults.headers.common["Authorization"] = `Bearer ${user.value.apiKey}`;
    }

    const fetchPosts = async () => {
      try {
        const response = await api.get("/forum");
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
        await api.post("/forum", formData, {
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

    const deletePost = async (id) => {
      if (!confirm("Biztosan törlöd ezt a bejegyzést?")) return;
      try {
        await api.delete(`/forum/${id}`);
        fetchPosts();
      } catch (error) {
        console.error("Hiba a törlés során:", error);
      }
    };


    onMounted(fetchPosts);

    return {
      posts,
      newPost,
      handleFileUpload,
      submitPost,
      formatDate,
      user,
      deletePost
    };
  },
  methods: {
    getImage(base64Data) {
      return `data:image/jpeg;base64,${base64Data}`;
    }
  }
};
</script>

<style scoped>
.forum-container {
  border: 5px solid #000;
  padding: 16px;
  border-radius: 8px;
  background-color: #e6e6e6;
}

.forum-post {
  background-color: #ffffff;
  border-left: 4px solid #1976d2;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  text-align: left;
  position: relative;
}


.post-header {
  font-weight: bold;
  margin-bottom: 8px;
}

.post-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: flex-start;
}

.delete-button {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

@media (min-width: 768px) {
  .post-content {
    flex-direction: row;
  }
}

.post-image-wrapper {
  flex-shrink: 0;
  max-width: 300px;
}

.post-image {
  width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 4px;
}

.post-text {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.post-body {
  white-space: pre-line;
}

.timestamp {
  font-size: 0.8rem;
  color: #777;
  text-align: right;
  margin-top: auto;
  align-self: flex-end;
}

.v-container {
  margin-bottom: 100px;
}
</style>
