import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const CompleteProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { phone, fbUserId } = location.state || {};
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); // Assuming you'll get this from your previous flow

  // Log the received values
  useEffect(() => {
    console.log("Received values:", { phone, fbUserId });
  }, [phone, fbUserId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Log values before submission
    console.log("Submitting values:", { username, phone, email, fbUserId });

    if (!username || !phone || !email || !fbUserId) {
      console.error("Required fields are missing.");
      return;
    }

    const userData = { username, mobile: phone, email, fbUserId };

    try {
      await axios.post("http://localhost:3000/api/users", userData);
      console.log("User profile created successfully.");
      navigate("/"); // Redirect after successful submission
    } catch (error) {
      console.error("Error saving user profile:", error);
      // Show an error message to the user
    }
  };

  return (
    <div>
      <h1>Complete Your Profile</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input type="text" value={phone} readOnly />
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default CompleteProfile;
