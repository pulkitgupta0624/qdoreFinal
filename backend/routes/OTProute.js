import express from "express";
import { check, validationResult } from "express-validator";
import dotenv from "dotenv";
import twilio from "twilio";

// Load environment variables
dotenv.config();

const router = express.Router();

// Twilio credentials from environment variables
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_SERVICE_SID = process.env.TWILIO_SERVICE_SID;

// Initialize Twilio client
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Route to send OTP
router.post(
  "/send-otp",
  [
    check("phoneNumber")
      .isMobilePhone("any")
      .withMessage("Invalid phone number."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { phoneNumber } = req.body;

    try {
      console.log("Sending OTP to:", phoneNumber);

      const verification = await client.verify.v2
        .services(process.env.TWILIO_SERVICE_SID)
        .verifications.create({
          to: phoneNumber,
          channel: "sms",
        });

      console.log("Twilio Verification Response:", verification);

      if (verification.status === "pending") {
        res
          .status(200)
          .json({
            success: true,
            message: "OTP sent successfully.",
            sid: verification.sid,
          });
      } else {
        throw new Error(
          `Failed to send OTP: Twilio verification status is ${verification.status}`
        );
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Server error.",
          error: error.message,
        });
    }
  }
);

// Route to verify OTP
router.post(
  "/verify-otp",
  [
    check("phoneNumber")
      .isMobilePhone("any")
      .withMessage("Invalid phone number."),
    check("otp")
      .isLength({ min: 6, max: 6 })
      .withMessage("Invalid OTP format."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { phoneNumber, otp } = req.body;

    try {
      // Verify OTP using Twilio Verify Service
      const verificationCheck = await client.verify.v2
        .services(TWILIO_SERVICE_SID)
        .verificationChecks.create({ to: phoneNumber, code: otp });

      if (verificationCheck.status === "approved") {
        res
          .status(200)
          .json({ success: true, message: "OTP verified successfully." });
      } else {
        res.status(400).json({ success: false, message: "Invalid OTP." });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error.message);
      res.status(500).json({ success: false, message: "Server error." });
    }
  }
);

export default router;
