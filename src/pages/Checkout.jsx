import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar/Navbar.jsx";
import Footer from "../components/Footer/Footer.jsx";
import "./checkout.css"; // Import Animate.css

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = useSelector((state) => state.auth.userInfo);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false); // New state for success message
  const selectedAddress = location.state?.selectedAddress;

  useEffect(() => {
    fetchCart();
    loadRazorpayScript();
  }, [userInfo]);

  const loadRazorpayScript = () => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => console.log("Razorpay script loaded successfully");
    script.onerror = () =>
      setError("Failed to load Razorpay. Please try again later.");
    document.body.appendChild(script);
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/users/objectIdexport?fbUserId=${userInfo.fbUserId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Error fetching user data: " + error.message);
      return null;
    }
  };

  const fetchCart = async () => {
    const userData = await fetchUserData();
    if (!userData || !userData._id) {
      toast.error("Failed to fetch user information.");
      return;
    }

    const mongoUserId = userData._id; // Use MongoDB _id
    try {
      const response = await fetch(
        `http://localhost:3000/api/cart/${mongoUserId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch cart data");
      }

      const data = await response.json();
      console.log("Fetched cart data:", data);

      if (!data || !data.products) {
        throw new Error("Cart not found for the user");
      }

      setCart(data.products || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setError("Error fetching cart: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = Array.isArray(cart)
    ? cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
    : 0;

  const handleOrder = async () => {
    setIsProcessingPayment(true);
    setError(null);
    try {
      if (!window.Razorpay) {
        throw new Error(
          "Razorpay script not loaded. Please refresh the page and try again."
        );
      }

      const userData = await fetchUserData();
      if (!userData || !userData._id) {
        toast.error("Failed to fetch user information.");
        return;
      }

      const mongoUserId = userData._id; // Use MongoDB _id
      const options = {
        key: "rzp_test_CYxrsd4LgcyNmb", // Replace with your Razorpay key
        amount: Math.round(totalPrice * 100), // Convert to paise
        currency: "INR",
        name: "Your Company",
        description: "Test Transaction",
        handler: async function (response) {
          try {
            const orderdata = {
              userId: mongoUserId,
              address: selectedAddress,
              items: cart,
              paymentId: response.razorpay_payment_id,
              amount: totalPrice,
            };

            const orderResponse = await fetch(
              "http://localhost:3000/api/users/orders",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${userInfo.token}`,
                },
                body: JSON.stringify(orderdata),
              }
            );

            if (!orderResponse.ok) {
              const errorData = await orderResponse.json();
              throw new Error(`Failed to save order: ${errorData.message}`);
            }

            const orderData = await orderResponse.json();
            localStorage.setItem("orderDetails", JSON.stringify(orderData));

            // Show success message
            setSuccessMessage(true);
            setTimeout(() => {
              navigate("/"); // Redirect to home after 3 seconds
            }, 3000);
          } catch (error) {
            console.error("Error saving order:", error);
            setError("Error saving order: " + error.message);
          }
        },
        prefill: {
          name: userInfo?.username || "",
          email: userInfo?.email || "",
          contact: userInfo?.mobile || "",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        setError(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (error) {
      console.error("Error processing payment:", error);
      setError("Error processing payment: " + error.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleChangeAddress = () => {
    navigate("/orderAddress");
  };

  const getImageUrl = (ipfsHash) => {
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 mt-10">
          <p>Loading cart information...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 mt-10">
        {successMessage && (
          <div className="thank-you-message animate__animated animate__fadeIn">
            <h2 className="text-2xl font-bold text-green-600">
              Thank you for shopping with us!
            </h2>
            <p>Your order has been successfully placed.</p>
          </div>
        )}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Products Summary */}
          <div className="border p-4 rounded-lg shadow-lg bg-white">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">
              Order Summary
            </h2>
            {cart.length > 0 ? (
              cart.map((item) => {
                const imageUrl = getImageUrl(item.image);
                return (
                  <div
                    key={item.productId}
                    className="flex items-center border-b py-2 mb-2"
                  >
                    <img
                      src={imageUrl}
                      alt={item.name}
                      className="w-20 h-20 object-cover mr-4 rounded-lg shadow"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <p className="text-gray-700">
                        ${item.price.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500">Your cart is empty.</p>
            )}
            <p className="text-xl font-semibold mt-4 text-blue-600">
              Total Price: ${totalPrice.toFixed(2)}
            </p>
          </div>

          {/* Address Details */}
          <div className="border p-4 rounded-lg shadow-lg bg-white">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">
              Delivery Address
            </h2>
            {selectedAddress ? (
              <>
                <p className="text-lg font-semibold">
                  {selectedAddress.name || "Name not provided"}
                </p>
                <p>
                  {selectedAddress.contactNumber ||
                    "Contact number not provided"}
                </p>
                <p>
                  {selectedAddress.addressLine1 ||
                    "Address line 1 not provided"}
                </p>
                <p>
                  {selectedAddress.addressLine2 ||
                    "Address line 2 not provided"}
                </p>
                <p>
                  {selectedAddress.city || "City not provided"},{" "}
                  {selectedAddress.state || "State not provided"} -{" "}
                  {selectedAddress.pincode || "Pincode not provided"}
                </p>
              </>
            ) : (
              <p className="text-gray-500">No delivery address selected.</p>
            )}
            <button
              onClick={handleChangeAddress}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
            >
              Change Address
            </button>
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <button
            onClick={handleOrder}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-500"
            disabled={isProcessingPayment}
          >
            {isProcessingPayment ? "Processing..." : "Place Order"}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
