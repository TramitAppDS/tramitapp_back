const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class gain extends Model {
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
  gain.init({
    procedureId: DataTypes.INTEGER,
    date: DataTypes.DATEONLY,
    price: DataTypes.INTEGER,
    // 0 = not paid, 1 = paid.
    status: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'gain',
  });
  return gain;
};
