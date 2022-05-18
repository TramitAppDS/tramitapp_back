const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class procedure extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.user = this.belongsTo(models.user);
      this.tramiter = this.belongsTo(models.tramiter);
      this.gain = this.hasOne(models.gain);
      this.debt = this.hasOne(models.debt);
    }
  }
  procedure.init({
    userId: DataTypes.INTEGER,
    tramiterId: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    type: DataTypes.INTEGER,
    comments: DataTypes.STRING,
    price: DataTypes.INTEGER,
    rating: DataTypes.FLOAT,
  }, {
    sequelize,
    modelName: 'procedure',
  });
  return procedure;
};
