import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AddressSelection = ({ productData, amount }) => {
  const userInfo = useSelector((state) => state.auth.userInfo);
  const [addresses, setAddresses] = useState([]);
  const navigate = useNavigate();
  const [selectedAddress, setSelectedAddress] = useState(null);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        if (!userInfo?._id) {
          throw new Error("User ID is missing");
        }

        const response = await fetch(
          `http://localhost:3000/api/users/${userInfo._id}/addresses`,
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch addresses");
        }

        const addresses = await response.json();
        return addresses;
      } catch (error) {
        console.error("Error fetching addresses:", error);
        setError("Error fetching addresses: " + error.message);
        return null;
      }
    };

    fetchAddresses();
  }, [userInfo]);

  const handleCheckout = async () => {
    // Ensure userInfo is defined and has the required properties
    if (!userInfo || !userInfo._id) {
      console.error("User ID is missing or userInfo is undefined");
      alert("Please log in to continue with the checkout.");
      return;
    }

    // Proceed with the checkout logic
    const userId = userInfo._id;

    try {
      const response = await fetch(`http://localhost:3000/api/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({ userId }), // Add any other necessary data
      });

      if (!response.ok) {
        throw new Error("Failed to complete checkout");
      }

      const data = await response.json();
      console.log("Checkout successful:", data);
      // Handle successful checkout (e.g., redirect or show confirmation)
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("An error occurred during checkout: " + error.message);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Select Your Address</h2>
      {addresses.length > 0 ? (
        addresses.map((address) => (
          <div
            key={address._id}
            className={`border p-4 rounded mb-2 cursor-pointer ${
              selectedAddress && selectedAddress._id === address._id
                ? "bg-gray-200"
                : ""
            }`}
            onClick={() => setSelectedAddress(address)}
          >
            <p>{address.line1}</p>
            {address.line2 && <p>{address.line2}</p>}
            <p>
              {address.city}, {address.state} {address.postalCode},{" "}
              {address.country}
            </p>
          </div>
        ))
      ) : (
        <p>No addresses found. Please add an address first.</p>
      )}
      <button
        onClick={handleCheckout}
        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
      >
        Proceed to Checkout
      </button>
    </div>
  );
};

export default AddressSelection;
