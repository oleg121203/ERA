export default {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  apiVersion: process.env.API_VERSION || 'v1',
  jwtSecret: process.env.JWT_SECRET
};
