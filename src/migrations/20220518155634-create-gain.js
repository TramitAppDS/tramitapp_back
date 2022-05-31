module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('gains', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      procedureId: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'procedures',
          key: 'id',
        },
        allowNull: false,
      },
      date: {
        type: Sequelize.DATEONLY,
      },
      price: {
        type: Sequelize.INTEGER,
      },
      status: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('gains');
  },
};
