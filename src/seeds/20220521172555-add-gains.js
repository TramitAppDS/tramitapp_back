module.exports = {
  up: async (queryInterface) => {
    const seedsArray = [];

    seedsArray.push({
      procedureId: 1,
      date: new Date(),
      price: 20000,
      status: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return queryInterface.bulkInsert('gains', seedsArray);
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