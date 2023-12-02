const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Route_G_Wknd = new Schema({
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

const RouteGWknd = mongoose.model("RouteGWknd", Route_G_Wknd)

module.exports = RouteGWknd