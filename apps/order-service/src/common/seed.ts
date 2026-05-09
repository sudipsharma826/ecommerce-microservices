import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderServiceModule } from '../order-service.module';
import { Product } from './schema/product.schema';

const seedProducts = [
  {
    name: 'Wireless Headphones',
    description: 'Noise-cancelling over-ear headphones with long battery life.',
    price: 129.99,
    discountPrice: 99.99,
    category: 'Electronics',
    brand: 'SoundMax',
    stock: 25,
    image: 'https://example.com/images/wireless-headphones.png',
    tags: ['audio', 'wireless', 'headphones'],
    rating: 4.8,
    numReviews: 214,
    isFeatured: true,
  },
  {
    name: 'Running Shoes',
    description: 'Lightweight running shoes designed for daily training.',
    price: 89.5,
    discountPrice: 74.99,
    category: 'Footwear',
    brand: 'RunPro',
    stock: 40,
    image: 'https://example.com/images/running-shoes.png',
    tags: ['fitness', 'sports', 'running'],
    rating: 4.6,
    numReviews: 180,
  },
  {
    name: 'Coffee Maker',
    description: '12-cup drip coffee maker with programmable timer.',
    price: 59.99,
    category: 'Home Appliances',
    brand: 'BrewMaster',
    stock: 15,
    image: 'https://example.com/images/coffee-maker.png',
    tags: ['kitchen', 'coffee', 'appliance'],
    rating: 4.4,
    numReviews: 96,
  },
  {
    name: 'Laptop Backpack',
    description: 'Water-resistant backpack with padded laptop compartment.',
    price: 49.0,
    category: 'Accessories',
    brand: 'UrbanTrail',
    stock: 30,
    image: 'https://example.com/images/laptop-backpack.png',
    tags: ['bag', 'travel', 'work'],
    rating: 4.7,
    numReviews: 143,
  },
  {
    name: 'Smart Watch',
    description: 'Fitness-tracking smartwatch with heart-rate monitoring.',
    price: 159.99,
    discountPrice: 139.99,
    category: 'Electronics',
    brand: 'PulseOne',
    stock: 18,
    image: 'https://example.com/images/smart-watch.png',
    tags: ['wearable', 'fitness', 'smartwatch'],
    rating: 4.5,
    numReviews: 121,
    isFeatured: true,
  },
];

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(OrderServiceModule, { // background worker context without HTTP server , to add the products to the OrderServieModule where the product schema is registered
    logger: false,
  });
  const productModel = app.get<Model<Product>>(getModelToken(Product.name)); // Get the Mongoose model for Product

  await productModel.deleteMany({}); // clears collection before inserting new data
  await productModel.insertMany(seedProducts); // Insert the seed products into the database

  await app.close(); // Close the application context after seeding is complete
  process.stdout.write(`Seeded ${seedProducts.length} products.\n`); // Log the number of products seeded
}

bootstrap().catch((error: unknown) => { // Catch and log any errors that occur during the seeding process
  console.error('Product seed failed:', error);
  process.exit(1);
});

// To execute the seed.ts
// npx ts-node apps/order-service/src/common/seed.ts