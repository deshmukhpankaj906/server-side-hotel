const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const { initializeApp } = require('firebase-admin/app');

const port = 27017;

const app = express();
app.use(cors());
app.use(bodyParser.json());

const admin = require("firebase-admin"); 
const serviceAccount = require("./royal-maratha-hotel-906-7ea04-firebase-adminsdk-c1hbh-57238f8ab7.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const { MongoClient } = require("mongodb");
const uri = process.env.SITE ;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const bookings = client.db("royal-maratha-hotel").collection("RoomBookings");

  app.post("/addBooking", (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking).then((result) => {
      res.send(result.insertedId > 0);
    });
  });
  app.get("/booking", (req, res) => {
    const bearer = req.headers.authorization;
    // console.log bearer;
    if (bearer && bearer.startsWith("Bearer ")) {
      idToken = bearer.split(" ")[1];
      console.log({ idToken });
      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          //now double verification email.
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
          console.log(tokenEmail, queryEmail);
          if (tokenEmail == queryEmail) {
            bookings.find({ email: queryEmail }).toArray((err, documents) => {
              res.status(200).send(documents);
            });
          }
        })
        .catch((error) => {
          res.status(401).send("unauthorized access");
        });
    } else {
      res.status(401).send("unauthorized access"); 
    }
  });
});


app.listen(process.env.PORT ||port);
