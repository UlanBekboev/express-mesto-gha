const config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/mestodb',
  secretKey: process.env.SECRET_KEY || 'mysecretkey',
};

module.exports = config;
