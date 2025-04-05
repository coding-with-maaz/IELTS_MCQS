const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  profile: {
    testType: {
      type: String,
      enum: ['IELTS', 'PTE'],
      required: [true, 'Test type is required'],
      default: 'IELTS'
    },
    phoneNumber: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    },
    targetBand: {
      type: Number,
      min: 0,
      max: 9
    },
    nativeLanguage: {
      type: String,
      trim: true
    },
    bio: {
      type: String,
      trim: true
    },
    avatar: {
      url: {
        type: String,
        default: 'https://ui-avatars.com/api/?background=random'
      },
      publicId: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate for submitted tests based on test type
UserSchema.virtual('submittedListeningTests', {
  ref: 'SubmittedListeningTest',
  localField: '_id',
  foreignField: 'user'
});

UserSchema.virtual('submittedReadingTests', {
  ref: 'SubmittedReadingTest',
  localField: '_id',
  foreignField: 'user'
});

UserSchema.virtual('submittedWritingTests', {
  ref: 'SubmittedWritingTest',
  localField: '_id',
  foreignField: 'user'
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    console.log('Password not modified, skipping hashing');
    return next();
  }

  try {
    console.log('Hashing password for user:', this.email);
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hashed successfully, hash length:', this.password.length);
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('Comparing passwords for user');
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password comparison result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw error;
  }
};

module.exports = mongoose.model('User', UserSchema);