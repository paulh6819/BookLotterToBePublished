import express from "express";
import multer from "multer";
import OpenAI from "openai";

const router = express.Router();
const upload = multer();

router.post("/detectSingleBook", upload.any(), (req, res) => {
  console.log("Single Book Detected, you are in the end point", req.body);
  res.json({ message: "Single Book Detected" });
});

export default router;
