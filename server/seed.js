const mongoose = require('mongoose');
const Restaurant = require('./models/Restaurant.js');
const MenuItem = require('./models/MenuItem.js');
const User = require('./models/User.js');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/food');

const run = async () => {
  await Restaurant.deleteMany();
  await MenuItem.deleteMany();
  await User.deleteMany();

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'admin'
  });

  const owner = await User.create({
    name: 'Restaurant Owner',
    email: 'owner@example.com',
    password: hashedPassword,
    role: 'owner'
  });

  const user = await User.create({
    name: 'Regular User',
    email: 'user@example.com',
    password: hashedPassword,
    role: 'user'
  });

  // Create restaurants (one approved, one pending)
  const approvedRestaurant = await Restaurant.create({
    name: 'Spicy Hub',
    address: '123 Main St, Chennai',
    cuisine: 'Indian',
    description: 'Authentic Indian cuisine with traditional flavors and modern twists. Family-owned restaurant serving delicious meals for over 20 years.',
    phone: '9876543210',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    location: {
      type: 'Point',
      coordinates: [80.2707, 13.0827]
    },
    owner: owner._id,
    isApproved: true,
    isOpen: true,
    rating: 4.5,
    deliveryTime: '25-35 mins',
    deliveryFee: 30,
    hoursOfOperation: '11:00 AM - 11:00 PM',
    priceRange: '$$',
    services: ['WiFi', 'Parking', 'Home Delivery', 'Dine-in'],
    menuHighlights: ['Butter Chicken', 'Paneer Tikka', 'Biryani', 'Naan']
  });

  const pendingRestaurant = await Restaurant.create({
    name: 'Bella Italia',
    address: '456 Oak Ave, Chennai',
    cuisine: 'Italian',
    description: 'Authentic Italian cuisine with wood-fired pizzas and fresh pasta. Imported ingredients and traditional recipes from Italy.',
    phone: '9123456789',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
    location: {
      type: 'Point',
      coordinates: [80.2707, 13.0827]
    },
    owner: owner._id,
    isApproved: false,
    isOpen: true,
    rating: 0,
    deliveryTime: '30-45 mins',
    deliveryFee: 50,
    hoursOfOperation: '12:00 PM - 10:00 PM',
    priceRange: '$$$',
    services: ['WiFi', 'Outdoor Seating', 'Home Delivery'],
    menuHighlights: ['Margherita Pizza', 'Pasta Carbonara', 'Tiramisu', 'Risotto']
  });

  // Create menu items for approved restaurant
  await MenuItem.create([
    {
      name: 'Butter Chicken',
      price: 280,
      category: 'main',
      restaurant: approvedRestaurant._id,
      isAvailable: true,
      description: 'Creamy and rich butter chicken with aromatic spices',
      nutritionalInfo: {
        calories: 450,
        protein: 35,
        carbs: 20,
        fat: 28,
        fiber: 3
      },
      customizationOptions: [
        {
          name: 'Spice Level',
          type: 'select',
          options: ['Mild', 'Medium', 'Hot', 'Extra Hot'],
          price: 0
        },
        {
          name: 'Extra Cheese',
          type: 'boolean',
          price: 30
        },
        {
          name: 'Extra Gravy',
          type: 'boolean',
          price: 20
        }
      ],
      allergens: ['dairy'],
      isVegetarian: false,
      preparationTime: 20
    },
    {
      name: 'Paneer Tikka',
      price: 220,
      category: 'appetizer',
      restaurant: approvedRestaurant._id,
      isAvailable: true,
      description: 'Marinated paneer cubes grilled to perfection',
      nutritionalInfo: {
        calories: 320,
        protein: 25,
        carbs: 15,
        fat: 22,
        fiber: 2
      },
      customizationOptions: [
        {
          name: 'Spice Level',
          type: 'select',
          options: ['Mild', 'Medium', 'Hot'],
          price: 0
        }
      ],
      allergens: ['dairy'],
      isVegetarian: true,
      preparationTime: 15
    },
    {
      name: 'Chicken Biryani',
      price: 250,
      category: 'main',
      restaurant: approvedRestaurant._id,
      isAvailable: true,
      description: 'Fragrant basmati rice with tender chicken and spices',
      nutritionalInfo: {
        calories: 520,
        protein: 32,
        carbs: 65,
        fat: 18,
        fiber: 4
      },
      customizationOptions: [
        {
          name: 'Extra Chicken',
          type: 'boolean',
          price: 80
        },
        {
          name: 'Extra Rice',
          type: 'boolean',
          price: 40
        }
      ],
      allergens: [],
      isVegetarian: false,
      preparationTime: 25
    },
    {
      name: 'Garlic Naan',
      price: 60,
      category: 'side',
      restaurant: approvedRestaurant._id,
      isAvailable: true,
      description: 'Freshly baked naan bread with garlic and butter',
      nutritionalInfo: {
        calories: 180,
        protein: 5,
        carbs: 30,
        fat: 6,
        fiber: 1
      },
      customizationOptions: [
        {
          name: 'Butter',
          type: 'boolean',
          price: 10
        }
      ],
      allergens: ['gluten', 'dairy'],
      isVegetarian: true,
      preparationTime: 10
    }
  ]);

  // Create menu items for pending restaurant
  await MenuItem.create([
    {
      name: 'Margherita Pizza',
      price: 320,
      category: 'main',
      restaurant: pendingRestaurant._id,
      isAvailable: true,
      description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
      nutritionalInfo: {
        calories: 280,
        protein: 12,
        carbs: 35,
        fat: 10,
        fiber: 2
      },
      customizationOptions: [
        {
          name: 'Extra Cheese',
          type: 'boolean',
          price: 50
        },
        {
          name: 'Extra Toppings',
          type: 'select',
          options: ['Mushrooms', 'Olives', 'Pepperoni', 'Bell Peppers'],
          price: 40
        }
      ],
      allergens: ['gluten', 'dairy'],
      isVegetarian: true,
      preparationTime: 20
    },
    {
      name: 'Pasta Carbonara',
      price: 280,
      category: 'main',
      restaurant: pendingRestaurant._id,
      isAvailable: true,
      description: 'Creamy pasta with pancetta, eggs, and parmesan cheese',
      nutritionalInfo: {
        calories: 420,
        protein: 18,
        carbs: 45,
        fat: 20,
        fiber: 3
      },
      customizationOptions: [
        {
          name: 'Extra Bacon',
          type: 'boolean',
          price: 60
        },
        {
          name: 'Cheese Type',
          type: 'select',
          options: ['Parmesan', 'Pecorino', 'Mixed'],
          price: 0
        }
      ],
      allergens: ['gluten', 'dairy', 'eggs'],
      isVegetarian: false,
      preparationTime: 18
    },
    {
      name: 'Tiramisu',
      price: 150,
      category: 'dessert',
      restaurant: pendingRestaurant._id,
      isAvailable: true,
      description: 'Classic Italian dessert with coffee-soaked ladyfingers',
      nutritionalInfo: {
        calories: 240,
        protein: 4,
        carbs: 25,
        fat: 15,
        fiber: 1
      },
      customizationOptions: [],
      allergens: ['gluten', 'dairy', 'eggs'],
      isVegetarian: true,
      preparationTime: 5
    }
  ]);

  console.log("Seed data inserted successfully");
  console.log("Admin login: admin@example.com / password123");
  console.log("Owner login: owner@example.com / password123");
  console.log("User login: user@example.com / password123");
  process.exit();
};

run();
