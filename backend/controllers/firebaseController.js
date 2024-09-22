import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbC3FlM7an5flrxWAg8KSevf91ceGHFWo",
  authDomain: "qdecor-cffd2.firebaseapp.com",
  projectId: "qdecor-cffd2",
  storageBucket: "qdecor-cffd2.appspot.com",
  messagingSenderId: "200246680389",
  appId: "1:200246680389:web:f3d7b727d3c777790b7c2c",
  measurementId: "G-H2DCL89HXV",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

export {
  auth,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  GoogleAuthProvider,
  signInWithPopup,
};
