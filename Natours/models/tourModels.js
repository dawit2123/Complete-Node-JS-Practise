const mongoose = require('mongoose');
const slugify = require('slugify');
//creating a tourSchema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour should have a name'],
      unique: true,
      maxlength: [40, 'A tour name should have max length of 40 characters'],
      minlength: [10, 'A tour name should have min length of 10 characters'],
      trim: true
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour should have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A Tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A Tour must have a difficulty'],
      enum: {
        values: ['difficult', 'medium', 'easy'],
        message: 'Difficulty should have only easy, medium, difficult fields.'
      }
    },
    price: {
      type: Number,
      required: [true, 'A tour should have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        //Works only for the documents created for the first time and it willn't work for the update
        validator: function(value) {
          return value <= this.price;
        },
        message: 'A tour price discount should be less than a price.'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, 'A rating should have a maximum value of 5'],
      min: [1, 'A rating should have a minimum value of 1'],
      set: el => {
        return Math.round(el * 100) / 100;
      }
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A Tour must have a description.']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A Tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: 0
    },
    secretTour: {
      type: Boolean,
      default: false
    },
    startDates: [Date],
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
      }
    ],

    /**In order to populate the data, you should use the type
     * property to be of mongoose.Schema.ObjectId and ref
     *
     */
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

//adding indexes
tourSchema.index({ price: 1 });
//adding a compound index with price and ratingsAverage
tourSchema.index({ price: 1, ratingsAverage: 1 });
// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.virtual('durationWeek').get(function() {
  return this.duration / 7;
});

//query middleware
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

// A query middlewar to populate the of child refenced guides data
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v --passwordChangedAt'
  });
  next();
});
// adding a review virtual to populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
