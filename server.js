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

app.post("/api/summarize", upload.single("video"), async (req, res) => {
  try {
    const videoPath = req.file.path;
    const audioPath = `audio/${Date.now()}.wav`;

    /* 1️⃣ VIDEO → AUDIO */
    ffmpeg(videoPath)
      .output(audioPath)
      .on("end", () => {
        console.log("Audio extracted");

        /* 2️⃣ DUMMY TRANSCRIPTION */
        const transcript =
          "This video explains the basics of artificial intelligence and machine learning.";

        /* 3️⃣ DUMMY SUMMARY */
        const summary =
          "The video introduces AI and ML concepts and explains their importance.";

        res.json({
          message: "Video processed successfully",
          transcript,
          summary
        });
      })
      .on("error", (err) => {
        console.error(err);
        res.status(500).json({ error: "Audio extraction failed" });
      })
      .run();

  } catch (error) {
    res.status(500).json({ error: "Processing failed" });
  }
});

/* ---------------- SERVER ---------------- */

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
