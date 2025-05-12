// Migration configuration settings
const migrationConfig = {
  // Default WordPress configuration
  wordpress: {
    url: '<WORDPRESS_URL>',
    authEndpoint: '/wp-json/jwt-auth/v1/token',
    apiEndpoint: '/wp-json/wp/v2',
    credentials: {
      username: '<WP-USERNAME>',
      password: '<WP-PASSWORD>'
    }
  },
  
  // Default Builder.io configuration
  builder: {
    apiKey: '<BUILDER_WRITE_API_KEY>',
    model: 'page',
    apiEndpoint: 'https://builder.io/api/v1'
  },
  
  // Server configuration
  server: {
    port: 3001,
    baseUrl: 'http://localhost:3001/api'
  }
};

export default migrationConfig; 