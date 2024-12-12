var express = require('express');
var cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
var app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(cors());
app.use(express.json());

// MongoDB URL from environment variables (optional for better security)
const url = process.env.MONGODB_URI;

// MongoDB connection function
async function connectToDatabase() {
  try {
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect(); // Connect to MongoDB
    console.log('Connected to MongoDB successfully');

  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
  }
}

// Call the function to connect to the database
connectToDatabase();

// API route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
