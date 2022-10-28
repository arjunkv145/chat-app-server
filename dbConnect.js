const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_DB_CONNECTION_STRING)
const db = mongoose.connection;
db.on("error", () => console.log("connection error"));
db.once("open", () => console.log("Database has connected"));