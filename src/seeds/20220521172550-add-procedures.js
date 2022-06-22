module.exports = {
  up: async (queryInterface) => {
    const seedsArray = [];

    seedsArray.push({
      userId: 1,
      tramiterId: 2,
      status: 1,
      comments: 'Muy buen servicio',
      address: 'pdte. Errazuriz 1234',
      plate: 'HVGF75',
      price: 20000,
      rating: 4.5,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    seedsArray.push({
      userId: 2,
      tramiterId: 3,
      status: 2,
      comments: null,
      plate: 'BCDF78',
      address: 'pdte. Errazuriz 1984',
      price: 20000,
      rating: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    seedsArray.push({
      userId: 3,
      tramiterId: 4,
      status: 3,
      comments: null,
      plate: 'BCDF78',
      address: 'pdte. Errazuriz 1984',
      price: 20000,
      rating: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    seedsArray.push({
      userId: 4,
      tramiterId: 5,
      status: 2,
      comments: null,
      plate: 'BCDF78',
      address: 'pdte. Errazuriz 1984',
      price: 20000,
      rating: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    seedsArray.push({
      userId: 5,
      tramiterId: 1,
      status: 1,
      comments: null,
      plate: 'BCDF78',
      address: 'pdte. Errazuriz 1984',
      price: 20000,
      rating: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    seedsArray.push({
      userId: 1,
      tramiterId: null,
      status: 0,
      comments: 'Muy buen servicio',
      address: 'pdte. Errazuriz 1234',
      plate: 'HVGF75',
      price: 20000,
      rating: 4.5,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    seedsArray.push({
      userId: 2,
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

    seedsArray.push({
      userId: 3,
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

    seedsArray.push({
      userId: 4,
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

    seedsArray.push({
      userId: 5,
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

    seedsArray.push({
      userId: 1,
      tramiterId: 5,
      status: 3,
      comments: 'Muy buen servicio',
      address: 'pdte. Errazuriz 1234',
      plate: 'HVGF75',
      price: 20000,
      rating: 4.5,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    seedsArray.push({
      userId: 2,
      tramiterId: 1,
      status: 2,
      comments: null,
      plate: 'BCDF78',
      address: 'pdte. Errazuriz 1984',
      price: 20000,
      rating: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    seedsArray.push({
      userId: 3,
      tramiterId: 2,
      status: 1,
      comments: null,
      plate: 'BCDF78',
      address: 'pdte. Errazuriz 1984',
      price: 20000,
      rating: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    seedsArray.push({
      userId: 4,
      tramiterId: 3,
      status: 3,
      comments: null,
      plate: 'BCDF78',
      address: 'pdte. Errazuriz 1984',
      price: 20000,
      rating: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    seedsArray.push({
      userId: 5,
      tramiterId: 4,
      status: 2,
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
