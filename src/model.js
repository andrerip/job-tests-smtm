const Sequelize = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite3'
});

class Product extends Sequelize.Model { }
Product.init(
  {
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    price: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false
    },
    inventory: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    sku: {
      type: Sequelize.STRING,
      allowNull: true
    },
    mainImageUrl: {
      type: Sequelize.TEXT,
      allowNull: true
    }
  }, { sequelize, modelName: 'product' }
);

class Category extends Sequelize.Model { }
Category.init(
  {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    }
  }, { sequelize, modelName: 'category' }
);

class Tag extends Sequelize.Model { }
Tag.init(
  {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, { sequelize, modelName: 'tag' }
);

Product.belongsToMany(Category, { through: 'ProductCategory' });
Category.belongsToMany(Product, { through: 'ProductCategory' });

Product.belongsToMany(Tag, { through: 'ProductTag' });
Tag.belongsToMany(Product, { through: 'ProductTag' });

module.exports = {
  sequelize,
  Product,
  Category,
  Tag
};
