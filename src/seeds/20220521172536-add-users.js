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
      email: 'gachondoj@uc.cl',
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
