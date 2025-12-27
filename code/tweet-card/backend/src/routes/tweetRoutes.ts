// now this here is what the frontend communicates with this is the 
//exxxpress server which gives the route and updates thedb or provides

import express from "express";
import {Tweet} from "../models/Tweet.js";

/*const router= express.Router();

router.get("/",async(req,res)=>{
    try
    {
    const tweets= await Tweet.find().sort({createdAt:-1});
    return res.status(200).json({tweets});
    }catch(err){
        return res.status(400).json({"message":"error fetching tweets"});
    }
});

router.post("/",async(req,res)=>{
    const { text, image } = req.body;

}) */

// src/routes/tweetRoutes.ts
// model we created earlier

const router = express.Router();

/**
 * GET /api/tweets
 * - Query params:
 *   - page (1-based, default 1)
 *   - limit (items per page, default 10)
 * - Behavior:
 *   - returns tweets sorted by createdAt desc (newest first)
 *   - supports simple pagination
 */
router.get("/", async (req, res) => {
  try {
    // Parse query params with safe defaults
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10)); // cap limit at 100

    // Calculate how many docs to skip
    const skip = (page - 1) * limit;

    // Fetch tweets from DB, newest first, with pagination
    const tweets = await Tweet.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    // Optionally, also send total count for UI pagination
    const total = await Tweet.countDocuments();

    res.json({ page, limit, total, tweets });
  } catch (err) {
    console.error("GET /api/tweets error:", err);
    res.status(500).json({ message: "Error fetching tweets" });
  }
});

/**
 * GET /api/tweets/:id
 * - Get a single tweet by its Mongo ObjectId
 */
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const tweet = await Tweet.findById(id).lean().exec();
    if (!tweet) return res.status(404).json({ message: "Tweet not found" });
    res.json(tweet);
  } catch (err) {
    console.error("GET /api/tweets/:id error:", err);
    res.status(400).json({ message: "Invalid tweet id" });
  }
});

/**
 * POST /api/tweets
 * - Create a new tweet (text required; image optional)
 * - We rely on the model's schema for validation (maxlength, required)
 */
router.post("/", async (req, res) => {
  try {
    const { text, image } = req.body;
    // Defensive check (model also enforces required/maxlength)
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ message: "Text is required" });
    }

    const newTweet = new Tweet({
      text: text.trim(),
      image: image ? String(image).trim() : undefined,
    });

    const saved = await newTweet.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("POST /api/tweets error:", err);
    res.status(400).json({ message: "Error creating tweet" });
  }
});

/**
 * PATCH /api/tweets/:id/like
 * - Atomically increment likes by 1
 * - Returns the updated tweet
 */
router.patch("/:id/like", async (req, res) => {
  try {
    const id = req.params.id;
    // $inc performs an atomic increment in MongoDB
    const updated = await Tweet.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true } // return the updated doc
    ).lean().exec();

    if (!updated) return res.status(404).json({ message: "Tweet not found" });
    res.json(updated);
  } catch (err) {
    console.error("PATCH /api/tweets/:id/like error:", err);
    res.status(400).json({ message: "Invalid tweet id" });
  }
});

/**
 * PATCH /api/tweets/:id/retweet
 * - Atomically increment retweets by 1
 */
router.patch("/:id/retweet", async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await Tweet.findByIdAndUpdate(
      id,
      { $inc: { retweets: 1 } },
      { new: true }
    ).lean().exec();

    if (!updated) return res.status(404).json({ message: "Tweet not found" });
    res.json(updated);
  } catch (err) {
    console.error("PATCH /api/tweets/:id/retweet error:", err);
    res.status(400).json({ message: "Invalid tweet id" });
  }
});

/**
 * DELETE /api/tweets/:id
 * - Remove a tweet by id
 */
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Tweet.findByIdAndDelete(id).lean().exec();
    if (!deleted) return res.status(404).json({ message: "Tweet not found" });
    res.json({ message: "Tweet deleted", id: deleted._id });
  } catch (err) {
    console.error("DELETE /api/tweets/:id error:", err);
    res.status(400).json({ message: "Invalid tweet id" });
  }
});

export default router;
