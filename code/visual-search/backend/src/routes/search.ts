// this is the router which uses route.getor post and inside it a hand
//-ler that is asynce(req,res) and before this middleware must be 
//placed before the async handler in express route.

// src/routes/search.ts
import express  from "express";
import multer from "multer";
import { forwardToFastAPI } from "../services/Fastapi.js";


const router = express.Router();

// Use memory storage so uploaded files are kept in RAM (no disk writes).
// This is good for small-to-medium images and keeps code simple.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB

/**
 * POST /api/search
 * Accepts a multipart/form-data request with field "image" (file).
 * Optional query param or body field "k" controls number of neighbours.
 */
router.post(
  "/search",
  // multer middleware expects the field name 'image' from the frontend form
  upload.single("image"),
  async (req, res) => {
    try {
      // validate file presence
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded. Use form field name 'image'." });
      }

      // parse k from query param or default to 5
      const kParam = req.query.k ?? (req.body && req.body.k) ?? "5";
      const k = Math.max(1, Math.min(100, parseInt(String(kParam), 10) || 5)); // clamp 1..100

      // forward the file buffer to FastAPI
      const fastApiResponse = await forwardToFastAPI(req.file.buffer, req.file.originalname, req.file.mimetype, k);

      // Optionally: log into DB here (search metrics), omitted for brevity

      // Return FastAPI response directly to client
      return res.json({ success: true, data: fastApiResponse });
    } catch (err: any) {
      console.error("Error in /api/search:", err?.message ?? err);
      const status = err?.response?.status || 500;
      const errorPayload = err?.response?.data ?? { message: err?.message ?? "Internal server error" };
      return res.status(status).json({ success: false, error: errorPayload });
    }
  }
);

export default router;
