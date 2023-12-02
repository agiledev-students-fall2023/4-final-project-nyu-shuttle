const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Route_A_Wknd = new Schema({
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

const RouteAWknd = mongoose.model("RouteAWknd", Route_A_Wknd)

module.exports = RouteAWknd