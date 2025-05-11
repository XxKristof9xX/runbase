<template>
  <v-container class="py-5">
    <h1 class="text-h4 mb-6">Kapcsolat</h1>

    <v-row>
      <v-col cols="12" md="6">
        <div class="contact">
          <p><strong>Telefonszám:</strong> +36 12 345 6789</p>
          <p><strong>E-mail:</strong> kapcsolat@runbase.hu</p>
          <p><strong>Székhely:</strong> Szeged</p>
        </div>
      </v-col>

      <v-col cols="12" md="6">
        <div class="map-container">
          <iframe
            width="100%"
            height="300"
            frameborder="0"
            style="border:0"
            allowfullscreen
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2723.0611089042474!2d20.14986361561307!3d46.25301069299761!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x474487538f59be13%3A0xf816b8e979287db9!2sSzeged!5e0!3m2!1shu!2shu!4v1623428854843!5m2!1shu!2shu"
          ></iframe>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {};
</script>

<style scoped>
.contact {
  font-size: 16px;
  line-height: 1.6;
}
.map-container iframe {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
