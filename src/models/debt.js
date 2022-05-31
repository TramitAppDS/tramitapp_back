const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class debt extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.procedure = this.belongsTo(models.procedure);
    }
  }
  debt.init({
    procedureId: DataTypes.INTEGER,
    date: DataTypes.DATEONLY,
    price: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'debt',
  });
  return debt;
};
