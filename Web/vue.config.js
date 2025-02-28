const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
});

module.exports = {
  devServer: {
    proxy: {
      "/api": {
        target: "https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net",
        changeOrigin: true,
      },
    },
  },
};


