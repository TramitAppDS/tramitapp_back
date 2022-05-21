const {
  Model,
} = require('sequelize');
const bcrypt = require('bcrypt');

const PASSWORD_SALT_ROUNDS = 10;

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

    async checkPassword(password) {
      return bcrypt.compare(password, this.password);
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

  tramiter.beforeSave(async (instance) => {
    if (instance.changed('password')) {
      const hash = await bcrypt.hash(instance.password, PASSWORD_SALT_ROUNDS);
      instance.set('password', hash);
    }
  });

  return tramiter;
};
