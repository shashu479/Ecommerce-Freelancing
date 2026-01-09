const mongoose = require('mongoose');
const dotenv = require('dotenv');
const products = require('./data/products');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Coupon = require('./models/Coupon');
const connectDB = require('./config/db');
const bcrypt = require('bcryptjs');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await Order.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();
        await Coupon.deleteMany();

        // Create Users
        const salt = await bcrypt.genSalt(10);
        const hash = async (pwd) => await bcrypt.hash(pwd, salt);

        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@example.com', // Already lower but good to be explicit
            password: await hash('admin123'),
            isAdmin: true
        });
        console.log(`Created Admin: ${adminUser.email}`);

        const normalUser = await User.create({
            name: 'John Doe',
            email: 'user@example.com',
            password: await hash('user123'),
            isAdmin: false
        });
        console.log(`Created User: ${normalUser.email}`);

        // Create Coupons
        await Coupon.create([
            {
                code: 'WELCOME10',
                discountType: 'percentage',
                discountValue: 10,
                isActive: true,
                assignedTo: null, // General
                description: '10% off for everyone'
            },
            {
                code: 'SAVE500',
                discountType: 'fixed',
                discountValue: 500,
                isActive: true,
                assignedTo: null,
                description: 'Flat ₹500 off'
            },
            {
                code: 'USERONLY',
                discountType: 'percentage',
                discountValue: 20,
                isActive: true,
                assignedTo: normalUser._id, // Specific to normal user
                description: '20% off for John Doe'
            }
        ]);
        console.log('Coupons Imported!');

        console.log('Users Imported!');

        // Create Products
        const sampleProducts = products.map(product => {
            return { ...product };
        });

        await Product.insertMany(sampleProducts);

        console.log('Products Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Order.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();
        await Coupon.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
