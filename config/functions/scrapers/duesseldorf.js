const axios = require('axios');

module.exports = async () => {
  const prefix = 'duesseldorf_';
  const { data } = await axios.get('https://vtmanager.duesseldorf.de/geoserverwfs?request=getfeature&service=wfs&version=1.1.0&typename=Parkhaeuser&outputFormat=application/json&srsname=epsg:4326');

  // Generate assignments from original data
  const assignments = data.features.map((origItem) => {
    return prefix + origItem.properties.pid;
  });

  function isNumber(n) {
    return !isNaN(parseFloat(n)) && !isNaN(n - 0);
  }

  // Get all available objects in one call
  const existingItems = await strapi.query('facilities').find({ assignment: assignments });

  await Promise.all(
    data.features.map(async (origItem) => {
      // const existingItem = existingItems[i];
      const matchingExistingItem = existingItems.find((existingItem) => existingItem.assignment === prefix + origItem.properties.pid);
      const freeSpots = isNumber(origItem.properties.kurzparkermax) && isNumber(origItem.properties.kurzparkerbelegt) ? Number(origItem.properties.kurzparkermax) - Number(origItem.properties.kurzparkerbelegt) : null;

      if (matchingExistingItem) {
        // Check if count of free spots has changed
        if (matchingExistingItem.spots.free === freeSpots) {
          console.log('Not Updating ' + matchingExistingItem.name, '(Düsseldorf)');
          console.log('---');
          return;
        }
        // Update
        try {
          await strapi.query('facilities').update(
            { id: matchingExistingItem.id },
            {
              name: origItem.properties.bezeichnung,
              spots: {
                free: freeSpots,
                freeText: freeSpots ? (freeSpots > 0 ? 'frei' : 'besetzt') : null,
                capacity: origItem.properties.kurzparkerbelegt,
              },
              address: {
                city: 'Düsseldorf',
              },
              location: {
                lat: origItem.geometry.coordinates[1],
                lng: origItem.geometry.coordinates[0],
              },
              state: origItem.properties.status === '1' ? 'Offen' : 'Geschlossen',
              updated_at: origItem.properties.daysecto_belegung,
            }
          );
          console.log('Update:', origItem.properties.bezeichnung, '(Düsseldorf)');
          console.log('Free Spots:', matchingExistingItem.spots.free + ' -> ' + freeSpots);
          console.log('---');
        } catch (e) {
          console.log('ERROR! Could not update:', origItem.properties.bezeichnung, '(Düsseldorf)');
          console.log(e);
          console.log('---');
        }
      } else {
        // Create
        try {
          await strapi.query('facilities').create({
            name: origItem.properties.bezeichnung,
            spots: {
              free: freeSpots,
              freeText: freeSpots ? (freeSpots > 0 ? 'frei' : 'besetzt') : null,
              capacity: origItem.properties.kurzparkerbelegt,
            },
            address: {
              city: 'Düsseldorf',
            },
            location: {
              lat: origItem.geometry.coordinates[1],
              lng: origItem.geometry.coordinates[0],
            },
            state: origItem.properties.status === 1 ? 'Offen' : origItem.properties.status === 0 ? 'Geschlossen' : null,
            updated_at: origItem.properties.daysecto_belegung,
            assignment: prefix + origItem.properties.pid,
          });
          console.log('Create:', origItem.properties.bezeichnung, '(Düsseldorf)');
        } catch (e) {
          console.log('ERROR! Could not update:', origItem.properties.bezeichnung, '(Düsseldorf)');
          console.log(e.sql);
          console.log('---');
        }
      }
    })
  );
};
