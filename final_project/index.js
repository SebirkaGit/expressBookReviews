const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users').authenticated;
const genl_routes = require('./router/general').general;

const app = express();
const PORT = 5000;

app.use(express.json());
app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

// Authentication middleware
app.use("/customer/auth/*", function auth(req, res, next) {
  if (req.session.authorization) {
    const token = req.session.authorization.accessToken;

    jwt.verify(token, "access", (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "User not authenticated" });
      } else {
        req.user = decoded; // Assuming decoded contains the username or user data
        next();
      }
    });
  } else {
    return res.status(403).json({ message: "User not logged in" });
  }
});

// Mount authenticated routes under /customer
app.use("/customer", customer_routes);

// Mount general routes under /
app.use("/", genl_routes);

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
