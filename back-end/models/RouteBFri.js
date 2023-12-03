const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Route_B_Friday = new Schema({
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

const RouteBFriday = mongoose.model("RouteBFriday", Route_B_Friday)

module.exports = RouteBFriday