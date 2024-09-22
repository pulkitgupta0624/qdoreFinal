import express from "express";
import { Router } from "express";
import axios from "axios";

// Route to send OTP
router.post("/send-otp", async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    // Use a free OTP API
    const response = await axios.post("https://api.otpprovider.com/send", {
      phoneNumber,
      // Add any other required parameters
    });

    if (response.data.success) {
      res
        .status(200)
        .json({ success: true, message: "OTP sent successfully." });
    } else {
      res.status(400).json({ success: false, message: "Failed to send OTP." });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// Route to verify OTP
router.post("/verify-otp", async (req, res) => {
  const { phoneNumber, otp } = req.body;

  try {
    // Use a free OTP API for verification
    const response = await axios.post("https://api.otpprovider.com/verify", {
      phoneNumber,
      otp,
      // Add any other required parameters
    });

    if (response.data.success) {
      res
        .status(200)
        .json({ success: true, message: "OTP verified successfully." });
    } else {
      res.status(400).json({ success: false, message: "Invalid OTP." });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
