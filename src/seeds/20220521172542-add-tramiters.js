const bcrypt = require('bcrypt');

const PASSWORD_SALT_ROUNDS = 10;

module.exports = {
  up: async (queryInterface) => {
    const seedsArray = [];

    seedsArray.push({
      firstName: 'Matías',
      lastName: 'Mackenna',
      phone: '+56987877886',
      approved: true,
      email: 'matiasmackennad@uc.cl',
      password: await bcrypt.hash('Hola123', PASSWORD_SALT_ROUNDS),
      city: 'Santiago',
      commune: 'Lo Barnechea',
      rating: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    seedsArray.push({
      firstName: 'Guillermo',
      lastName: 'Achondo',
      phone: '+56992333382',
      approved: false,
      email: 'guillermo.achondo@uc.cl',
      city: 'Santiago',
      commune: 'Vitacura',
      rating: 5,
      password: await bcrypt.hash('Hola123', PASSWORD_SALT_ROUNDS),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    seedsArray.push({
      firstName: 'Rodrigo',
      lastName: 'Bloomfield',
      phone: '+56991571692',
      approved: true,
      email: 'rbloomfield@uc.cl',
      city: 'Santiago',
      commune: 'Vitacura',
      rating: 5,
      password: await bcrypt.hash('Hola123', PASSWORD_SALT_ROUNDS),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    seedsArray.push({
      firstName: 'Santiago',
      lastName: 'Errazuriz',
      phone: '+56992829103',
      approved: true,
      email: 'seerrazuriz@uc.cl',
      city: 'Santiago',
      commune: 'Lo Barnechea',
      rating: 5,
      password: await bcrypt.hash('Hola123', PASSWORD_SALT_ROUNDS),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    seedsArray.push({
      firstName: 'Sebastian',
      lastName: 'Perez',
      phone: '+56999171725',
      approved: false,
      email: 'sperezmasri@uc.cl',
      city: 'Santiago',
      commune: 'Las Condes',
      rating: 5,
      password: await bcrypt.hash('Hola123', PASSWORD_SALT_ROUNDS),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return queryInterface.bulkInsert('tramiters', seedsArray);
  },

  down: async () => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
