const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDatabase } = require('../config/database');
const User = require('../modules/users/user.model');
const Town = require('../modules/towns/town.model');
const Business = require('../modules/businesses/business.model');
const Product = require('../modules/products/product.model');

async function seed() {
  await connectDatabase();
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Town.deleteMany({}),
    Business.deleteMany({}),
    Product.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  const hash = await bcrypt.hash('password', 10);

  // Towns
  const towns = await Town.insertMany([{ town_name: 'Haroonabad' }]);
  console.log(`Created ${towns.length} town(s)`);

  // Admin user
  await User.create({ name: 'System Admin', phone_no: '11111111111', password: hash, role: 'admin', town_id: towns[0]._id });
  console.log('Created admin user');

  // Businesses
  const businesses = await Business.insertMany([
    { name: 'Desire', type: 'fast_food', opening_time: '10:00:00', closing_time: '23:00:00', image: 'https://placehold.co/100x100?text=Desire' },
    { name: 'Burger King', type: 'fast_food', opening_time: '10:00:00', closing_time: '23:00:00', image: 'https://placehold.co/100x100?text=Burger+king' },
    { name: 'National Pharmacy', type: 'health', opening_time: '10:00:00', closing_time: '23:00:00', image: 'https://lh3.googleusercontent.com/p/AF1QipNDKvH1Z-wuvp_wEy-OrQpXe-aT4a1xTzmcIfJw=s1360-w1360-h1020' },
  ]);
  console.log(`Created ${businesses.length} businesses`);

  // Restaurant admins
  const adminUsers = [];
  for (const business of businesses) {
    const user = await User.create({
      name: `Restaurant Admin ${business.name}`,
      phone_no: `${business._id.toString().slice(-1)}2222222222`,
      password: hash,
      role: 'restaurant_admin',
      business_id: business._id,
      town_id: towns[0]._id,
    });
    adminUsers.push(user);
  }
  console.log(`Created ${adminUsers.length} restaurant admins`);

  // Products
  const productsData = {
    [businesses[0]._id.toString()]: [
      { title: 'Margherita Pizza', description: 'Classic Italian pizza', type: 'pizza', price: 1000, image: 'https://placehold.co/100x100?text=Classic Italian pizza' },
      { title: 'Pepperoni Pizza small', description: 'Spicy pepperoni pizza', type: 'pizza', price: 1400, image: 'https://placehold.co/100x100?text=Spicy pepperoni pizza' },
      { title: 'Pepperoni Pizza medium', description: 'Spicy pepperoni pizza', type: 'pizza', price: 1400, image: 'https://placehold.co/100x100?text=Spicy pepperoni pizza' },
      { title: 'Pepperoni Pizza large', description: 'Spicy pepperoni pizza', type: 'pizza', price: 1400, image: 'https://placehold.co/100x100?text=Spicy pepperoni pizza' },
      { title: 'Pepperoni Pizza extra large', description: 'Spicy pepperoni pizza', type: 'pizza', price: 1400, image: 'https://placehold.co/100x100?text=Spicy pepperoni pizza' },
      { title: 'Lazania Pizza small', description: 'Spicy Lazania Pizza', type: 'pizza', price: 1400, image: 'https://placehold.co/100x100?text=Spicy Lazania Pizza' },
      { title: 'Lazania Pizza medium', description: 'Spicy Lazania Pizza', type: 'pizza', price: 1400, image: 'https://placehold.co/100x100?text=Spicy Lazania Pizza' },
      { title: 'Lazania Pizza large', description: 'Spicy Lazania Pizza', type: 'pizza', price: 1400, image: 'https://placehold.co/100x100?text=Spicy Lazania Pizza' },
      { title: 'Lazania Pizza extra large', description: 'Spicy Lazania Pizza', type: 'pizza', price: 1400, image: 'https://placehold.co/100x100?text=Spicy Lazania Pizza' },
      { title: 'New York Style Crust Filled Pizza small', description: 'Spicy New York Style Crust Filled Pizza', type: 'pizza', price: 1400, image: 'https://placehold.co/100x100?text=Spicy New York Style Crust Filled Pizza' },
      { title: 'New York Style Crust Filled Pizza medium', description: 'Spicy New York Style Crust Filled Pizza', type: 'pizza', price: 1400, image: 'https://placehold.co/100x100?text=Spicy New York Style Crust Filled Pizza' },
      { title: 'New York Style Crust Filled Pizza large', description: 'Spicy New York Style Crust Filled Pizza', type: 'pizza', price: 1400, image: 'https://placehold.co/100x100?text=Spicy New York Style Crust Filled Pizza' },
      { title: 'New York Style Crust Filled Pizza extra large', description: 'Spicy New York Style Crust Filled Pizza', type: 'pizza', price: 1400, image: 'https://placehold.co/100x100?text=Spicy New York Style Crust Filled Pizza' },
    ],
    [businesses[1]._id.toString()]: [
      { title: 'Classic Burger', description: 'Juicy beef burger', type: 'burger', price: 350, image: 'https://placehold.co/100x100?text=Juicy beef burger' },
      { title: 'Chicken Burger', description: 'Grilled chicken burger', type: 'burger', price: 350, image: 'https://placehold.co/100x100?text=Grilled chicken burger' },
    ],
    [businesses[2]._id.toString()]: [
      { title: 'Prescription', description: 'Upload your doctors prescription', type: 'prescription', price: 0, image: 'https://cdn-icons-png.flaticon.com/512/898/898671.png' },
      { title: 'Panadol', description: 'Pain killer tablet', type: 'medicine', price: 500, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtCFBhGlUNA4Y8Wy8ZatSK7aYzHMrBhFycAQ&s' },
    ],
  };

  let productCount = 0;
  for (const [businessId, prods] of Object.entries(productsData)) {
    const withBusiness = prods.map(p => ({ ...p, business_id: businessId }));
    await Product.insertMany(withBusiness);
    productCount += prods.length;
  }
  console.log(`Created ${productCount} products`);

  // End users
  const endUsers = [];
  for (let i = 1; i <= 5; i++) {
    const user = await User.create({
      name: `Customer ${i}`,
      phone_no: `${i}3333333333`,
      password: hash,
      role: 'end_user',
      town_id: towns[0]._id,
    });
    endUsers.push(user);
  }
  console.log(`Created ${endUsers.length} end users`);

  console.log('\nSeeding complete!');
  console.log('Admin phone: 11111111111 / password');
  console.log('End user phone: 13333333333 / password');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
