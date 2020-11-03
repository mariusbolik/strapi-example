module.exports = (strapi) => {
  return {
    initialize() {
      strapi.app.use(async (ctx, next) => {
        const url = ctx.url;
        if (url.includes("v2")) {
          ctx.status = 301;
          ctx.redirect("https://legacy-api.liveparking.eu" + url);
        }
        await next();
      });
    },
  };
};
