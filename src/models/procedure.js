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
    // 0 = waiting, 1 = in progress, 2 = done, 3 = paid.
    status: DataTypes.INTEGER,
    // 0 = technical revision, 1 = circulation paper.
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
