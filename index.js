var express = require("express");
// const jwt=require(jsonwebtoken)
var cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const jsonwebtoken = require('jsonwebtoken');

var app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(cors(
  {
    origin: "http://localhost:5173"
  }
));
app.use(express.json());

// token verification
const verifyJwt = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.send({ message: "no token" })
  }
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_KEY_TOKEN, (err, decoded) => {
    if (err) {
      return res.send({ message: "invalid token" });
    }
    req.decoded = decoded;
    next()
  })
}

// verify seller
const verifySeller = async (req, res, next) => {
  const email = req.decoded.email;
  const query = { email: email };
  const user = await usersCollection.findOne(query);
  if (user?.role !== "Seller") {
    return res.send({ message: "forbidden  access" });
  }
  next()
}

// MongoDB URL 
const url = process.env.MONGODB_URI;

// MongoDB connection function

const client = new MongoClient(url, {
  useNewUrlParser: true, useUnifiedTopology: true, serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// declaration collection

const usersCollection = client.db("gadgetShop").collection("users");
const productCollection = client.db("gadgetShop").collection("products")

async function connectToDatabase() {
  try {

    await client.connect();
    console.log('Connected to MongoDB successfully');

    // get user

    app.get("/users/:email", async (req, res) => {
      const query = { email: req.params.email };

      const user = await usersCollection.findOne(query);
      if (!user) {
        return res.send({ message: "no user found" })
      }
      return res.send(user);
    })

    // insert user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const email = { email: user.email };
      const existingUser = await usersCollection.findOne(email);
      if (existingUser) {
        return res.send({ message: "this email user is already exist" })
      }
      const result = await usersCollection.insertOne(user);
      res.send(result)
    })

    // add products
    app.post("/add-products", async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.send(result);
    });

    // get products



  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
  }
}

// Call the function to connect to the database
connectToDatabase();

// jwt

app.post("/authentication", async (req, res) => {
  const userEmail = req.body;
  const token = jsonwebtoken.sign(userEmail, process.env.ACCESS_KEY_TOKEN, {
    expiresIn: "10d"
  });
  res.send({ token })
})

// API route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
