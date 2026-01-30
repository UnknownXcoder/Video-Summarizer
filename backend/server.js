const express = require("express");
const cors = require("cors");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const path = require("path");

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
app.use(cors());
app.use(express.json());

/* ---------------- FILE UPLOAD CONFIG ---------------- */

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

/* ---------------- MAIN API ---------------- */

app.post("/api/summarize", upload.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No video uploaded" });
  }

  const videoPath = req.file.path;
  const audioPath = `audio/${Date.now()}.wav`;

  ffmpeg(videoPath)
    .output(audioPath)
    .on("start", (cmd) => {
      console.log("FFmpeg started:", cmd);
    })
    .on("end", () => {
      console.log("Audio extracted successfully");

      res.json({
        message: "Video processed successfully",
        transcript: "Dummy transcript for now",
        summary: "Dummy summary for now"
      });
    })
    .on("error", (err) => {
      console.error("FFmpeg ERROR:", err.message);
      res.status(500).json({ error: "FFmpeg failed" });
    })
    .run();
});



/* ---------------- SERVER ---------------- */

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
