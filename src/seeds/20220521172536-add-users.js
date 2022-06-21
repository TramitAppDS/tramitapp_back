const bcrypt = require('bcrypt');

const PASSWORD_SALT_ROUNDS = 10;

module.exports = {
  up: async (queryInterface) => {
    const seedsArray = [];

    seedsArray.push({
      firstName: 'Matías',
      lastName: 'Mackenna',
      phone: '+56987877886',
      admin: true,
      email: 'matiasmackennad@uc.cl',
      password: await bcrypt.hash('Hola123', PASSWORD_SALT_ROUNDS),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    seedsArray.push({
      firstName: 'Guillermo',
      lastName: 'Achondo',
      phone: '+56992333382',
      admin: false,
      email: 'guillermo.achondo@uc.cl',
      password: await bcrypt.hash('Hola123', PASSWORD_SALT_ROUNDS),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    seedsArray.push({
      firstName: 'Rodrigo',
      lastName: 'Bloomfield',
      phone: '+56991571692',
      admin: false,
      email: 'rbloomfield@uc.cl',
      password: await bcrypt.hash('Hola123', PASSWORD_SALT_ROUNDS),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    seedsArray.push({
      firstName: 'Santiago',
      lastName: 'Errazuriz',
      phone: '+56992829103',
      admin: false,
      email: 'seerrazuriz@uc.cl',
      password: await bcrypt.hash('Hola123', PASSWORD_SALT_ROUNDS),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    seedsArray.push({
      firstName: 'Sebastian',
      lastName: 'Perez',
      phone: '+56999171725',
      admin: false,
      email: 'sperezmasri@uc.cl',
      password: await bcrypt.hash('Hola123', PASSWORD_SALT_ROUNDS),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return queryInterface.bulkInsert('users', seedsArray);
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
