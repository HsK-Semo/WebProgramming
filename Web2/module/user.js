const mongoose = require('mongoose'); 
const userSchema = mongoose.Schema({  
  id: { 
    type: String,
    maxLength: 50,
    required: true,
    unique: 1, // exists one unique value
  },
  email: {
    type: String,
    required: true,
    maxLength: 100,
  },
  pw: {
    type: String,
    required: true,
    maxLength: 100,
  },
  pwc: {
    type: String,
    required: true,
    maxLength: 100,
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;