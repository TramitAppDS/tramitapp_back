const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class tramiter extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.procedures = this.hasMany(models.procedure);
    }
  }
  tramiter.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    phone: DataTypes.STRING,
    approved: DataTypes.BOOLEAN,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    city: DataTypes.STRING,
    commune: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'tramiter',
  });
  return tramiter;
};
