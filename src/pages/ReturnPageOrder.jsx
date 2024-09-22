// ReturnOrderPage.jsx

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios"; // Ensure axios is imported
import { useSelector } from "react-redux";

// List of valid return reasons
const returnReasons = [
  "Bought by Mistake",
  "Better price available",
  "Performance or quality not adequate",
  "Incompatible or not useful",
  "Product damaged, but shipping box OK",
  "Item arrived too late",
  "Missing parts or accessories",
  "Both product and shipping box damaged",
  "Wrong item was sent",
  "Item defective or doesn't work",
  "No longer needed",
  "Didn't approve purchase",
  "Inaccurate website description",
  "Return against replacement",
  "Delay Refund",
  "Delivered Late",
  "Product does not Match Description on Website",
  "Both Product & Outer Box Damaged",
  "Defective or does not work",
  "Product damaged, but outer Box OK",
  "Missing Parts or Accessories",
  "Incorrect Item Delivered",
  "Product Defective or Doesn't Work",
  "Product performance/quality is not up to my expectations",
  "Other",
  "Changed my mind",
  "Does not fit",
  "Size not as expected",
  "Item is damaged",
  "Received wrong item",
  "Parcel damaged on arrival",
  "Quality not as expected",
  "Missing Item or accessories",
  "Performance not adequate",
  "Not as described",
  "Arrived too late",
  "Order Not Received",
  "Empty Package",
  "Wrong item or Wrong colour was sent",
  "Item defective, expired, spoilt or does not work",
  "Items or parts missing",
  "Size or Quantity issues",
  "Status as delivered but order not received",
  "N/A",
];

export const ReturnOrderPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [returnReason, setReturnReason] = useState("");
  const [filteredReasons, setFilteredReasons] = useState([]); // State for filtered reasons
  const [showDropdown, setShowDropdown] = useState(false); // Control dropdown visibility
  const userInfo = useSelector((state) => state.auth.userInfo);

  // Function to handle input change and filter reasons
  const handleInputChange = (e) => {
    const input = e.target.value;
    setReturnReason(input);

    // Filter reasons based on input
    if (input) {
      const filtered = returnReasons.filter((reason) =>
        reason.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredReasons(filtered);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  // Function to select a reason from the dropdown
  const handleSelectReason = (reason) => {
    setReturnReason(reason);
    setShowDropdown(false);
  };

  // Function to handle the return order submission
  const handleReturnOrder = async () => {
    try {
      const token = userInfo.token;
      await axios.patch(
        `http://localhost:3000/api/orders/${orderId}/return`,
        { reason: returnReason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Order return initiated successfully.");
      navigate(`/orders`);
    } catch (error) {
      toast.error("Failed to return the order.");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Return Order</h1>
      <div className="relative">
        <textarea
          className="border w-full p-2 mb-4"
          placeholder="Enter reason for return"
          value={returnReason}
          onChange={handleInputChange}
        />
        {/* Dropdown to show filtered reasons */}
        {showDropdown && filteredReasons.length > 0 && (
          <ul className="absolute bg-white border w-full max-h-60 overflow-y-auto">
            {filteredReasons.map((reason, index) => (
              <li
                key={index}
                className="p-2 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSelectReason(reason)}
              >
                {reason}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        onClick={handleReturnOrder}
        className="bg-red-600 text-white px-6 py-2 rounded-md mt-2"
      >
        Submit Return Request
      </button>
    </div>
  );
};

export default ReturnOrderPage;
