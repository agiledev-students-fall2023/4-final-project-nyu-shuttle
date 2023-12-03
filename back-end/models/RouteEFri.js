const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Route_E_Fri = new Schema({
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

const RouteEFri = mongoose.model("RouteEFri", Route_E_Fri)

module.exports = RouteEFri