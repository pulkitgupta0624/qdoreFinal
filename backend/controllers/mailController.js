import nodemailer from "nodemailer";
import asyncHandler from "../middlewares/asyncHandler.js";

const sendEmail = asyncHandler(async (req, res) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.elasticemail.com",
    port: 2525,
    secure: false,
    auth: {
      user: "shuklag868@gmail.com",
      pass: "1CA83014003A4A95C939C993EB055371E783",
    },
  });
  const { to, subject, text, html } = req.body;

  try {
    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"gaurav shukla" <shuklag868@gmail.com>',
      to: to,
      subject: subject,
      text: text,
      html: html,
    });

    console.log("Message sent: %s", info.messageId);
    res.status(200).json({ messageId: info.messageId });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

export default sendEmail;
