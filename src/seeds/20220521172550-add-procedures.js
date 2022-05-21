module.exports = {
  up: async (queryInterface) => {
    const seedsArray = [];

    seedsArray.push({
      userId: 2,
      tramiterId: 1,
      status: 2,
      type: 3,
      comments: 'Muy buen servicio',
      price: 20000,
      rating: 4.5,
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
