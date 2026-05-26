require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.json());

app.use('/api/categories', require('./routes/categoryroutes'));
app.use('/api/products',   require('./routes/productroutes'));
app.use('/api/orders',     require('./routes/orderroutes'));
app.use('/api/order-items', require('./routes/orderdetailroutes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
