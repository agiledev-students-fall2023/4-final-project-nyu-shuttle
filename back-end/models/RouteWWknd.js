const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Route_W_Wknd = new Schema({
  stop_name: {
    type: String,
    unique: false,
    required: true,
  },
  times: {
    type: [String],
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
}, { 
    unique: false, 
})

const RouteWWknd = mongoose.model("RouteWWknd", Route_W_Wknd)

module.exports = RouteWWknd