module.exports = {
  up: async (queryInterface) => {
    const seedsArray = [];

    seedsArray.push({
      procedureId: 2,
      date: new Date(),
      price: 20000,
      status: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    seedsArray.push({
      procedureId: 3,
      date: new Date(),
      price: 20000,
      status: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    seedsArray.push({
      procedureId: 4,
      date: new Date(),
      price: 20000,
      status: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    seedsArray.push({
      procedureId: 11,
      date: new Date(),
      price: 20000,
      status: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    seedsArray.push({
      procedureId: 11,
      date: new Date(),
      price: 20000,
      status: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    seedsArray.push({
      procedureId: 12,
      date: new Date(),
      price: 20000,
      status: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    seedsArray.push({
      procedureId: 14,
      date: new Date(),
      price: 20000,
      status: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    seedsArray.push({
      procedureId: 15,
      date: new Date(),
      price: 20000,
      status: 0,
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
