import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  auth,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
} from "../../backend/controllers/firebaseController.js";
import { parsePhoneNumber, isValidNumber } from "libphonenumber-js";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../redux/slices/authSlice";
import "./auth.css";
import Navbar from "../components/Navbar/Navbar.jsx";
import Footer from "../components/Footer/Footer.jsx";

const Auth = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmResult, setConfirmResult] = useState(null);
  const [countryCode, setCountryCode] = useState("us");
  const recaptchaVerifierRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentAuthState = useSelector((state) => state.auth);

  useEffect(() => {
    console.log("Component mounted. Initializing reCAPTCHA...");
    initializeRecaptcha();

    return () => {
      if (recaptchaVerifierRef.current) {
        console.log("Component unmounting. Cleaning up reCAPTCHA...");
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  const initializeRecaptcha = () => {
    console.log("Initializing RecaptchaVerifier...");
    if (!recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
            callback: (response) => {
              console.log("reCAPTCHA solved successfully. Response:", response);
            },
            "expired-callback": () => {
              console.log("reCAPTCHA expired. Reinitializing...");
              initializeRecaptcha();
            },
          }
        );
        console.log("RecaptchaVerifier initialized successfully.");
      } catch (error) {
        console.error("Error initializing RecaptchaVerifier:", error);
      }
    } else {
      console.log("RecaptchaVerifier already initialized.");
    }
  };

  useEffect(() => {
    if (phoneNumber) {
      console.log("Parsing phone number:", phoneNumber);
      try {
        const phoneNumberParsed = parsePhoneNumber(phoneNumber, "IN");
        const newCountryCode =
          phoneNumberParsed?.country?.toLowerCase() || "us";
        console.log("Parsed country code:", newCountryCode);
        setCountryCode(newCountryCode);
      } catch (error) {
        console.error("Error parsing phone number:", error);
        setCountryCode("us");
      }
    }
  }, [phoneNumber]);

  const formatPhoneNumber = (number) => {
    console.log("Formatting phone number:", number);
    try {
      if (number.length < 10) {
        console.log("Phone number too short");
        return null;
      }
      const phoneNumberParsed = parsePhoneNumber(number, "IN");
      const validNumber = isValidNumber(phoneNumberParsed.number);
      console.log(
        "Formatted phone number:",
        validNumber ? phoneNumberParsed.number : "Invalid number"
      );
      return validNumber ? phoneNumberParsed.number : null;
    } catch (error) {
      console.error("Error formatting phone number:", error);
      return null;
    }
  };

  const handlePhoneChange = (e) => {
    console.log("Phone number input changed:", e.target.value);
    setPhoneNumber(e.target.value);
  };
  // Updated requestOTP function
  const requestOTP = async () => {
    console.log("Requesting OTP for phone number:", phoneNumber);

    try {
      const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
      if (!formattedPhoneNumber) {
        console.error("Invalid phone number");
        // Show an error message to the user
        return;
      }

      console.log(
        "Formatted phone number ready for OTP:",
        formattedPhoneNumber
      );

      // Check if the phone number exists in the database
      const response = await axios.get(
        `http://localhost:3000/api/users/phone/${encodeURIComponent(
          formattedPhoneNumber
        )}`
      );

      const phoneExists = response.data.exists;

      if (phoneExists) {
        console.log("Phone number exists in database. Dispatching user data.");
        const userData = response.data.user; // Assuming the user data is returned in response.data.user
        console.log("User Data:", userData);
        // Dispatch the user data to Redux
        dispatch(setCredentials(userData));

        // Navigate to the home page
        navigate("/");
      } else {
        console.log("Phone number not found, proceeding with OTP request...");

        // Initialize reCAPTCHA if not already done
        if (!recaptchaVerifierRef.current) {
          console.error("reCAPTCHA not initialized");
          await initializeRecaptcha();
          if (!recaptchaVerifierRef.current) {
            throw new Error("Failed to initialize reCAPTCHA");
          }
        }

        const appVerifier = recaptchaVerifierRef.current;
        console.log("Starting signInWithPhoneNumber...");
        const confirmationResult = await signInWithPhoneNumber(
          auth,
          formattedPhoneNumber,
          appVerifier
        );
        setConfirmResult(confirmationResult);
        console.log(
          "OTP sent successfully, confirmationResult:",
          confirmationResult
        );

        // Redirect to the complete profile page to create a new account
        navigate("/completeProfile", {
          state: { phone: formattedPhoneNumber }, // Optionally pass phone number to the next page
        });
      }
    } catch (error) {
      console.error("Error during OTP request:", error);
      if (recaptchaVerifierRef.current) {
        console.log("Clearing and reinitializing reCAPTCHA due to error.");
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
      await initializeRecaptcha();
      // Show an error message to the user
    }
  };

  // Updated verifyOTP function
  const verifyOTP = async () => {
    console.log("Verifying OTP:", verificationCode);

    if (!confirmResult) {
      console.error("No confirmResult available");
      return;
    }

    try {
      const result = await confirmResult.confirm(verificationCode);
      console.log("Phone number verified successfully. Result:", result);

      const userInfo = {
        displayName: null,
        phone: result.user.phoneNumber,
        fbUserId: result.user.uid, // Changed from _id to fbUserId for clarity
      };

      // New user, proceed to CompleteProfile
      dispatch(setCredentials(userInfo));
      navigate("/completeProfile", {
        state: { phone: userInfo.phone, fbUserId: userInfo.fbUserId },
      });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      // Show an error message to the user
    }
  };
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log("Google Sign-In successful. Result:", result.user);

      const { uid, displayName, email } = result.user;

      if (!uid || !email) {
        console.error("User ID or email is missing.");
        return;
      }

      // Get the access token using getIdToken
      const accessToken = await result.user.getIdToken();

      // Check if the user exists in your database
      try {
        const response = await axios.get(
          `http://localhost:3000/api/users/email/${encodeURIComponent(email)}`
        );

        if (response.data && response.data.user) {
          // User exists, dispatch credentials with token and navigate to home
          dispatch(
            setCredentials({
              ...response.data.user,
              token: accessToken, // Include the access token here
            })
          );
          navigate("/");
        } else {
          // User doesn't exist, redirect to add phone number
          console.log("User does not exist, redirecting to addPhone...");
          const userInfo = {
            _id: uid,
            displayName: displayName || "User",
            email: email,
            token: accessToken,
          };

          navigate("/addPhone", { state: { user: userInfo } });
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // User doesn't exist, redirect to add phone number
          console.log(
            "User not found in the database, redirecting to addPhone..."
          );
          const userInfo = {
            _id: uid,
            displayName: displayName || "User",
            email: email,
            token: accessToken,
          };
          navigate("/addPhone", { state: { user: userInfo } });
        } else {
          console.error("Error checking user in database:", error);
          // Handle other errors appropriately
        }
      }
    } catch (error) {
      console.error("Error during Google Sign-In:", error.message);
      // Show an error message to the user
    }
  };

  return (
    <>
      <Navbar />
      <div className="signup-container">
        <h1 className="title">Login with OTP</h1>
        <p className="subtitle">Enter your log in details</p>
        <div className="input-container">
          <div className="country-flag">
            <img
              src={`https://flagcdn.com/w20/${countryCode}.png`}
              alt="Country flag"
              onError={(e) => {
                console.log(
                  "Error loading flag image, falling back to US flag"
                );
                e.target.onerror = null;
                e.target.src = `https://flagcdn.com/w20/us.png`;
              }}
              style={{ width: "30px", height: "20px" }}
            />
          </div>
          <input
            className="phone-input"
            type="text"
            placeholder="Phone number"
            value={phoneNumber}
            onChange={handlePhoneChange}
          />
        </div>
        <button className="request-otp-button" onClick={requestOTP}>
          Request OTP
        </button>
        {confirmResult && (
          <div>
            <input
              type="text"
              placeholder="Enter OTP"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <button onClick={verifyOTP}>Verify OTP</button>
          </div>
        )}
        <div className="divider">Or Login Using</div>
        <div className="login-options">
          <button className="google-login" onClick={handleGoogleSignIn}>
            <i className="fab fa-google"></i> Sign in with Google
          </button>
        </div>
        <div id="recaptcha-container"></div>
      </div>
      <Footer />
    </>
  );
};

export default Auth;
