const mongoose = require('../db/mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type:       String,
    required:   'Укажите email', // true for default message
    unique:     'Такой email уже существует',
    validate: [{
      validator: function checkEmail(value) {
        return /^[-.\w]+@([\w-]+\.)+[\w-]{2,12}$/.test(value);
      },
      msg: 'Укажите, пожалуйста, корректный email.'
    }],
    lowercase:  true, // to compare with another email
    trim:       true
  },
  displayName: {
    type:       String,
    required:   'Укажите displayName',
    trim: true
  }
}, {
  timestamps: true
});

// для этого есть отдельный плагин
userSchema.statics.publicFields = ['email', 'displayName'];

module.exports = mongoose.model('User', userSchema);
