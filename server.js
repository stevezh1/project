const express = require("express");
const mysql = require('mysql');
const path = require('path');
const cors = require('cors'); // Importing CORS middleware
const db = require('./db-connections');

const app = express();
const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 5500,
  path: '/front-page.html',
  method: 'GET',
};

// Middleware 
app.use(express.json()); // Middleware 
app.use(cors()); // Adding CORS middleware
app.use(express.static(path.join(__dirname, 'public')));

// Route to get all products
app.get('/products', async (req, res) => {
    try {
        const [products, fields] = await db.promise().query("SELECT * FROM product");
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Define routes for HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to add a new product
app.post('/products', async (req, res) => {
    const { name, description, price, category, picture } = req.body;
    try {
        const [categoryRow] = await db.promise().query("SELECT id FROM category WHERE name = ?", [category]);
        
        if (categoryRow && categoryRow.length > 0) {
            const categoryId = categoryRow[0].id;

            const result = await db.promise().query("INSERT INTO product (name, description, price, category_id, picture) VALUES (?, ?, ?, ?, ?)", [name, description, price, categoryId, picture]);
            res.status(201).json({ message: 'Product added successfully' });
        } else {
            console.error("Category not found");
            res.status(404).json({ error: 'Category not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add product' });
    }
});

// Route to update product by ID
app.put('/products/:id', async (req, res) => {
    const productId = req.params.id;
    const { name, description, price, category, picture } = req.body;
    try {
        const [categoryRow] = await db.promise().query("SELECT id FROM category WHERE name = ?", [category]);
        
        if (categoryRow && categoryRow.length > 0) {
            const categoryId = categoryRow[0].id;

            const result = await db.promise().query("UPDATE product SET name = ?, description = ?, price = ?, category_id = ?, picture = ? WHERE id = ?", [name, description, price, categoryId, picture, productId]);
            res.status(200).json({ message: 'Product updated successfully' });
        } else {
            console.error("Category not found");
            res.status(404).json({ error: 'Category not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Route to delete product by ID
app.delete('/products/:id', async (req, res) => {
    const productId = req.params.id;
    try {
        const result = await db.promise().query("DELETE FROM product WHERE id = ?", [productId]);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// Wrap the HTTP request in a try-catch block to handle connection errors
try {
    const req = http.request(options, (response) => {
      console.log(`statusCode: ${response.statusCode}`);
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        console.log(data);
      });
    });
    
    req.on('error', (error) => {
      console.error(error);
    });
    
    req.end();
} catch (error) {
    console.error('Error connecting to server:', error.message);
}

// Starting the server and listening for incoming requests
const port = 8080;
const host = '127.0.0.1';
app.listen(port, host, () => {
    console.log(`Web server running @ http://${host}:${port}/`);
});
