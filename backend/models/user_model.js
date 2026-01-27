const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique:true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  noOfRelative: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('User', UserSchema)

