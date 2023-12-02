const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Route_G_Fri = new Schema({
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

const RouteGFri = mongoose.model("RouteGFri", Route_G_Fri)

module.exports = RouteGFri