const { sequelize, Product, Category, Tag } = require('../src/model');

/* WARNING THIS WILL DROP THE CURRENT DATABASE */
seed();

async function seed() {
    // create tables
    await sequelize.sync({ force: true });

    //insert Categories
    const cat1 = await Category.create({
        name: 'Electronics',
        description: 'Electronic products'
    });
    const cat2 = await Category.create({
        name: 'Books',
        description: 'Books'
    });
    const cat3 = await Category.create({
        name: 'Clothing',
        description: 'Clothing'
    });
    const cat4 = await Category.create({
        name: 'Home',
        description: 'Home products'
    });

    // insert Tags
    const tag1 = await Tag.create({
        name: 'New'
    });
    const tag2 = await Tag.create({
        name: 'Popular'
    });
    const tag3 = await Tag.create({
        name: 'Sale'
    });
    const tag4 = await Tag.create({
        name: 'Cottom'
    });

    // insert Products
    const prod1 = await Product.create({
        title: 'Dell Laptop',
        description: '15" Dell Laptop with 16GB RAM and 1TB SSD',
        price: 999.99,
        inventory: 100,
        sku: 'PROD55914B',
        mainImageUrl: 'https://via.placeholder.com/55914B'
    });
    await prod1.addCategory(cat1);
    await prod1.addCategory(cat4);
    await prod1.addTag(tag1);

    const prod2 = await Product.create({
        title: 'Homo Sapiens - Yuval Harari',
        description: 'A Brief History of Humankind',
        price: 10.99,
        inventory: 5,
        sku: 'PROD88411Z',
        mainImageUrl: 'https://via.placeholder.com/88411Z'
    });
    await prod2.addCategory(cat2);
    await prod2.addTag(tag2);

    const prod3 = await Product.create({
        title: 'Blue t-shirt',
        description: 'Medium size in cottom',
        price: 1.99,
        inventory: 50,
        sku: 'PROD15427X',
        mainImageUrl: 'https://via.placeholder.com/15427X'
    });
    await prod3.addCategory(cat3);
    await prod3.addTag(tag4);
    await prod3.addTag(tag2);

    console.log('Database seeded');
}