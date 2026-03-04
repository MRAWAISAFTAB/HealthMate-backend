router.post(
  "/upload",
  isAuthenticated,
  upload.single("report"),  // make sure this matches formData.append('report', file)
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "File missing!" });

      // Convert file to base64
      const base64File = req.file.buffer.toString("base64");

      // Save to MongoDB or process with AI
      const report = await Report.create({
        userId: req.user.id,          // from JWT
        reportName: req.file.originalname,
        fileData: base64File,
        fileType: req.file.mimetype,
      });

      res.status(201).json({ message: "Uploaded!", data: report });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Upload failed", error: error.message });
    }
  }
);