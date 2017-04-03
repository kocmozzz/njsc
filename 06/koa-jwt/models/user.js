const mongoose = require('../db/mongoose');
const crypto = require('crypto');
const config = require('config');

const userSchema = new mongoose.Schema({
  email: {
    type:       String,
    required:   'Укажите email',
    unique:     'Такой email уже существует',
    validate: [{
      validator: function checkEmail(value) {
        return /^[-.\w]+@([\w-]+\.)+[\w-]{2,12}$/.test(value);
      },
      msg: 'Укажите, пожалуйста, корректный email.'
    }],
    lowercase:  true,
    trim:       true
  },
  displayName: {
    type:       String,
    required:   'Укажите displayName',
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

userSchema.virtual('password')
.set(function (password) {
  password = password.toString();

  if (password !== undefined) {
    if (password.length < 4) {
      this.invalidate('password', 'Пароль должен быть минимум 4 символа.');
    }
  }

  this._plainPassword = password;

  if (password) {
    this.salt = crypto.randomBytes(config.crypto.hash.length).toString('base64');
    this.passwordHash = crypto.pbkdf2Sync(password, this.salt, config.crypto.hash.iterations, config.crypto.hash.length, 'sha1');
  } else {
    this.salt = undefined;
    this.passwordHash = undefined;
  }
})

.get(function () { return this._plainPassword });

userSchema.methods.checkPassword = function (password) {
  if (!password) return false;
  if (!this.passwordHash) return false;

  // здесь нельзя использовать строгое сравнение, надо приводить к строке
  return crypto.pbkdf2Sync(password, this.salt, config.crypto.hash.iterations, config.crypto.hash.length, 'sha1') == this.passwordHash;
};

// для этого есть отдельный плагин
userSchema.statics.publicFields = ['email', 'displayName'];

module.exports = mongoose.model('User', userSchema);
