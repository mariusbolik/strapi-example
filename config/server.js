module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', 'QmdBRuG7zK3P93b8AaJH2oUs9fYnxH9RD3DEzgHqyAJmMjitSt7JTMbaPYBh7b6u/SHroCuSuBi0EGT8Ff2X8g=='),
    },
  },
  cron: {
    enabled: true
  }
});