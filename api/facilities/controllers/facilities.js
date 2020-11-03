"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async find(ctx) {
    if (ctx.query.lat && ctx.query.lng) {
      const sql = `SELECT facilities.id, (
      3959 * acos (
              cos (radians(${ctx.query.lat}))
              * cos(radians(components_facilities_locations.lat))
              * cos(radians(components_facilities_locations.lng) - radians(${
                ctx.query.lng
              }))
              + sin (radians(${ctx.query.lat}))
              * sin(radians(components_facilities_locations.lat))
          )
      ) AS distance
      FROM facilities
      INNER JOIN facilities_components
      ON facilities_components.facility_id = facilities.id
      AND facilities_components.component_type = 'components_facilities_locations'
      INNER JOIN components_facilities_locations
      ON components_facilities_locations.id = facilities_components.component_id
      HAVING distance <= 50
      ORDER BY distance
      LIMIT 0, ${ctx.query.limit ? ctx.query.limit : "20"}`;

      const result = await strapi.connections.default.raw(sql);
      const parsedResult = JSON.parse(JSON.stringify(result[0]));

      const ids = parsedResult.map((item) => {
        return item.id;
      });

      const response = await strapi
        .query("facilities")
        .find({ id: ids });
      return response;
    } else {
      return await strapi.query("facilities").find(ctx.query);
    }
  },
};
