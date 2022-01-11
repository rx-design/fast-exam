const path = require('path');

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        '~': path.resolve(__dirname, 'functions/src/'),
      },
    },
  },
  devServer: {
    host: 'localhost',
    port: 8080,
    public: 'localhost:8080',
  },
  pwa: {
    name: 'Fast Exam',
  },
};
