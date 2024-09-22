import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ChevronLeft,
  Package,
  Truck,
  Download,
  X,
  AlertTriangle,
  RotateCcw, // Symbolizes returning
  Undo, // Symbolizes undo or return
} from "lucide-react";

// ConfirmationModal component
const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <AlertTriangle className="mr-2 text-yellow-500" />
          Confirm Cancellation
        </h2>
        <p className="mb-6">
          Are you sure you want to cancel this order? This action cannot be
          undone.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition duration-300"
          >
            No, Keep Order
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-300"
          >
            Yes, Cancel Order
          </button>
        </div>
      </div>
    </div>
  );
};

// Main OrderDetailPage component
const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userInfo = useSelector((state) => state.auth.userInfo);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = userInfo.token;
        const { data } = await axios.get(
          `http://localhost:3000/api/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOrder(data);
      } catch (error) {
        setError("Error fetching order details");
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, userInfo.token]);

  const handleCancelOrder = async () => {
    try {
      const token = userInfo.token;
      const response = await axios.patch(
        `http://localhost:3000/api/orders/${orderId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.message === "Order canceled successfully") {
        toast.success("Order canceled successfully", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
        setOrder((prevOrder) => ({
          ...prevOrder,
          orderStatus: "Cancelled",
        }));
      } else {
        toast.error(`Failed to cancel the order: ${response.data.message}`, {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    } catch (error) {
      toast.error("Error canceling the order", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const token = userInfo.token;
      const response = await axios.post(
        `http://localhost:3000/api/orders/${orderId}/invoice`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const { is_invoice_created, invoice_url } = response.data;

      if (is_invoice_created && invoice_url) {
        const link = document.createElement("a");
        link.href = invoice_url;
        link.target = "_blank";
        link.download = `Invoice_${orderId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Invoice downloaded successfully", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      } else {
        toast.error("Failed to generate invoice or invoice not created.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    } catch (error) {
      console.error("Error downloading invoice:", error.message);
      toast.error("Error downloading invoice. Please try again later.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center text-xl mt-10">{error}</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="container mx-auto p-6">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="bg-blue-600 text-white p-6">
            <h1 className="text-3xl font-bold">Order Details</h1>
            <p className="text-sm opacity-75">Order #{order._id}</p>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Order Date: {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  order.orderStatus === "Cancelled"
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {order.orderStatus}
              </span>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Package className="mr-2" /> Products
              </h2>
              <div className="space-y-4">
                {order.products.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center bg-gray-50 p-4 rounded-lg"
                  >
                    <img
                      src={`https://ipfs.io/ipfs/${product.image}`}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-md mr-4"
                    />
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-600">
                        Quantity: {product.quantity}
                      </p>
                      <p className="text-sm font-semibold">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xl font-bold mt-4 text-right">
                Total: ${order.totalAmount.toFixed(2)}
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Truck className="mr-2" /> Shipping Address
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p>{order.address.line1}</p>
                {order.address.line2 && <p>{order.address.line2}</p>}
                <p>
                  {order.address.city}, {order.address.state} -{" "}
                  {order.address.postalCode}
                </p>
                <p>{order.address.country}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-8">
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-300"
              >
                <ChevronLeft className="mr-2" /> Back to Orders
              </button>

              {order.orderStatus !== "Cancelled" && (
                <>
                  <button
                    onClick={openModal}
                    className="flex items-center px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300"
                  >
                    <X className="mr-2" /> Cancel Order
                  </button>

                  <button
                    onClick={() => navigate(`/track-order/${orderId}`)}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
                  >
                    <Truck className="mr-2" /> Track Order
                  </button>

                  <button
                    onClick={() => handleDownloadInvoice(orderId)}
                    className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300"
                  >
                    <Download className="mr-2" /> Download Invoice
                  </button>

                  {/* Add Return Order Button */}
                  <button
                    onClick={() => navigate(`/return-order/${orderId}`)}
                    className="flex items-center px-6 py-2 bg-yellow-600 text-white px-6 py-2 rounded-md shadow-md hover:bg-yellow-700 transition duration-300"
                  >
                    <Undo className="mr-2" /> Return Order{" "}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={handleCancelOrder}
      />
    </div>
  );
};

export default OrderDetailPage;
