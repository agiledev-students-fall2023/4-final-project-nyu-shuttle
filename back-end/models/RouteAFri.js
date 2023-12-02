const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Route_A_Friday = new Schema({
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

const RouteAFriday = mongoose.model("RouteAFriday", Route_A_Friday)

module.exports = RouteAFriday