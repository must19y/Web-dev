// this is a mongoose schema as mongodb isnt a db that can be interrac
//ted with so we need objs to interact with it so hence mongoosemodel

import mongoose from "mongoose";

// Define what a Tweet looks like (the "schema")
const tweetSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,      // Tweet must have text
    trim: true,          // Remove spaces from start & end
    maxlength: 280,      // Twitter-like limit
  },
  image: {
    type: String,        // Optional image URL
  },
  likes: {
    type: Number,
    default: 0,          // Start with 0 likes
  },
  retweets: {
    type: Number,
    default: 0,          // Start with 0 retweets
  },
  createdAt: {
    type: Date,
    default: Date.now,   // Auto-generate timestamp
  },
});

// Create a "model" — an object we can use to interact with the DB
export const Tweet = mongoose.model("Tweet", tweetSchema);
