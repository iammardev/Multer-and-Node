const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const multer = require("multer");
const fs = require("fs");

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads"); // Save uploaded images to the 'public/uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Use original filename with timestamp
  },
});

const upload = multer({ storage: storage });

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Body parser setup
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/upload", (req, res) => {
  // Get list of files already uploaded
  const imageFiles = getUploadedFiles();
  const imageUrls = imageFiles.map((file) => "/uploads/" + file);
  res.render("upload", { imageUrls: imageUrls });
});

// Handle file upload
app.post("/upload", upload.any(), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  const imageUrls = req.files.map((file) => "/uploads/" + file.filename); // Paths to access the uploaded images
  res.render("upload", { imageUrls: imageUrls });
});

// Handle file removal
app.post("/remove", (req, res) => {
  const { imageUrl } = req.body; // Retrieve imageUrl from req.body

  if (!imageUrl) {
    return res.status(400).send("Image URL is required.");
  }

  const imagePath = path.join(__dirname, "public", imageUrl);

  // Delete the file from the server
  fs.unlink(imagePath, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
      return res.status(500).send("Error deleting file.");
    }
    console.log("File deleted successfully:", imageUrl);
    res.redirect("/upload");
  });
});

// Handle remove all
app.post("/removeAll", (req, res) => {
  const imageFiles = getUploadedFiles();

  imageFiles.forEach((file) => {
    const imagePath = path.join(__dirname, "public", "uploads", file);
    fs.unlinkSync(imagePath); // Synchronously delete each file
  });

  console.log("All files deleted successfully.");
  res.redirect("/upload");
});

// Function to get list of uploaded files
function getUploadedFiles() {
  const directoryPath = path.join(__dirname, "public", "uploads");
  try {
    return fs.readdirSync(directoryPath);
  } catch (err) {
    console.error("Error reading directory:", err);
    return [];
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
