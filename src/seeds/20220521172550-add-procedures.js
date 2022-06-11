module.exports = {
  up: async (queryInterface) => {
    const seedsArray = [];

    seedsArray.push({
      userId: 1,
      tramiterId: 1,
      status: 2,
      comments: 'Muy buen servicio',
      address: 'pdte. Errazuriz 1234',
      plate: 'HVGF75',
      price: 20000,
      rating: 4.5,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    seedsArray.push({
      userId: 1,
      tramiterId: null,
      status: 0,
      comments: null,
      plate: 'BCDF78',
      address: 'pdte. Errazuriz 1984',
      price: 20000,
      rating: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return queryInterface.bulkInsert('procedures', seedsArray);
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
