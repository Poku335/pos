const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productroutes');
const categoryRoutes = require('./routes/categoryroutes');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use('/api/products', productRoutes); // api product
app.use('/api/categories', categoryRoutes); //api category


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
