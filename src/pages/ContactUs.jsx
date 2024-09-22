import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar/Navbar";
import AOS from "aos";
import "aos/dist/aos.css";
import Footer from "../components/Footer/Footer";
import "../pages/contact.css";
import { FaArrowUp, FaWhatsapp } from "react-icons/fa";

const ContactUs = () => {
  const [orderPopup, setOrderPopup] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleOrderPopup = () => {
    setOrderPopup(!orderPopup);
  };

  useEffect(() => {
    AOS.init({
      offset: 100,
      duration: 800,
      easing: "ease-in-out",
      delay: 100,
    });
    AOS.refresh();

    // Show the form after a scroll event
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 300) { // Adjust this value as needed
        setShowForm(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="contact-us-page">
      {/* Blurred background with centered circle and text */}
      

      {/* Navbar */}
      <Navbar handleOrderPopup={handleOrderPopup} />

      {/* Contact Form Section */}
      <section className="m-20">
        <div className="contact-form-container">
          {/* Contact Details */}
          <div className="contact-details" data-aos="fade-right">
            <h2>Contact Details</h2>
            <div className="mb-8">
              <h3>Email</h3>
              <p>admin@qdorehome.com</p>
            </div>
            <div>
              <h3>Phone</h3>
              <p>+91 7983131615</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form" data-aos="fade-left">
            <h2>Send Us A Message</h2>
            <form className="w-full space-y-6">
              <input
                type="text"
                className="w-full h-14"
                placeholder="Your Name"
                required
              />
              <input
                type="email"
                className="w-full h-14"
                placeholder="Your Email"
                required
              />
              <textarea
                className="w-full"
                placeholder="Write your message"
                rows="6"
                required
              ></textarea>
              <button type="submit" className="w-full">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <a
        href="https://api.whatsapp.com/send?phone=7983131615"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 bg-green-500 text-white py-2 px-4 rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition-all z-50"
        aria-label="WhatsApp"
      >
        <FaWhatsapp size={24} />
        
      </a>
      <Footer />
    </div>
  );
};

export default ContactUs;
