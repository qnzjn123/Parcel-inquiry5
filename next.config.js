/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    MONGODB_URI: 'mongodb://localhost:27017/delivery-tracking',
  },
};

module.exports = nextConfig; 