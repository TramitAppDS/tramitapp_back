module.exports = {
  up: async (queryInterface) => {
    const seedsArray = [];

    seedsArray.push({
      procedureId: 1,
      date: new Date(),
      price: 18000,
      status: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return queryInterface.bulkInsert('debts', seedsArray);
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
