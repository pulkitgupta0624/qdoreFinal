import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../redux/slices/authSlice";

const AddPhone = () => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user; // Make sure this structure is consistent
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      console.error("User data is missing");
      return;
    }

    // Create user data object matching the structure from Google sign-in
    const userData = {
      username: name,
      mobile: phoneNumber,
      email: user.email,
      fbUserId: user._id,
      displayName: user.displayName, // Add displayName if needed
      token: user.token, // Include the token if you need it
    };

    console.log("Submitting user data:", userData);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/users",
        userData
      );
      console.log("User added successfully:", response.data);

      // Dispatch the user info and token to Redux
      dispatch(
        setCredentials({ user: response.data.user, token: response.data.token })
      );

      navigate("/"); // Redirect after dispatch
    } catch (error) {
      console.error(
        "Error adding user:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div>
      <h1>Add Phone Number</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AddPhone;
