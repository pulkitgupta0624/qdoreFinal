import s11 from "../../assets/Serveware/s11.jpg";
import s12 from "../../assets/Serveware/s12.jpg";
import s13 from "../../assets/Serveware/s13.jpg";
import s14 from "../../assets/Serveware/s14.jpg";
import s21 from "../../assets/Serveware/s21.jpg";
import s22 from "../../assets/Serveware/s22.jpg";
import s23 from "../../assets/Serveware/s23.jpg";
import s24 from "../../assets/Serveware/s24.jpg";
import s25 from "../../assets/Serveware/s25.jpg";
import s26 from "../../assets/Serveware/s26.jpg";
import s31 from "../../assets/Serveware/s31.jpg";
import s32 from "../../assets/Serveware/s32.jpg";
import s33 from "../../assets/Serveware/s33.jpg";
import s34 from "../../assets/Serveware/s34.jpg";
import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import AOS from "aos";
import { toast, ToastContainer } from "react-toastify";
import "aos/dist/aos.css";
import "react-toastify/dist/ReactToastify.css"; // Import toast styles
import {
  FaTruck,
  FaMoneyBillAlt,
  FaUndo,
  FaBusinessTime,
  FaChevronDown,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
const productImages = {
  "acacia-wood-bowl-serveware": [s11, s12, s13, s14],
  "chopping-board-serveware": [s21, s22, s23, s24, s25, s26],
  "cake-dome-serveware": [s31, s32, s33, s34],
};

const products = [
  {
    id: "acacia-wood-bowl-serveware",
    name: "ACACIA WOOD BOWL",
    description: [
      "Elevate your home dining experience with Qdore Home’s versatile 𝐀𝐜𝐚𝐜𝐢𝐚 𝐖𝐨𝐨𝐝 𝐁𝐨𝐰𝐥. ",
      "Perfect for serving everything from soups and salads to snacks and even doubling as a chic plant pot, this multipurpose bowl brings natural elegance to your table. ",
      "Crafted for style and function, it’s an excellent gift for any occasion. ",
      "Complete with a matching spoon, it’s a must-have for your rustic kitchen decor.",
    ],
    price: 99.99,
    imageUrl: "QmTCMopBCRHGe9Act794xek44M9t3UD82YxmHf4zVdKSHC",
  },
  {
    id: "chopping-board-serveware",
    name: "CHOPPING BOARD",
    description: [
      "Upgrade your kitchen with our new Acacia Wood 𝐂𝐡𝐨𝐩𝐩𝐢𝐧𝐠 𝐁𝐨𝐚𝐫𝐝𝐬!",
      "Now available in two sleek shapes with rounded edges and a convenient handle for easy use.",
      "Crafted from sustainably sourced, food-safe wood, these boards are not only eco-friendly but also durable and stylish. ",
      "Say NO to Plastic—our heavy, thick Acacia boards bring a premium feel and natural beauty that will compliment your kitchen. ",
      "Easy and safe to clean, just rinse with mild detergent.",
    ],
    price: 89.99,
    imageUrl: "QmYfYqpqHbWB6oPCXsXHetrsr2tWUtE7SnmiJAvqwvnrqq",
  },
  {
    id: "cake-dome-serveware",
    name: "CAKE DOME",
    description: [
      "Showcase your desserts in style with our 𝐂𝐚𝐤𝐞 𝐃𝐨𝐦𝐞, featuring a beautifully crafted Acacia wood stand with a clear glass cloche",
      "Ideal for cakes, cupcakes, and more, this elegant piece is both eco-friendly and food-safe, made from sustainably sourced wood. ",
      "A must-have for any kitchen, it’s expertly crafted by skilled artisans to bring a touch of sophistication to your home.",
    ],
    price: 89.99,
    imageUrl: "QmYuEFGKQfGH7Gz1iuEtNxmjfFyRb1ggSXudhgcqJ8bsHj",
  },
];

const ServewaresDesc = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.auth.userInfo);

  const [activeProduct, setActiveProduct] = useState(
    () => products.find((product) => product.id === productId) || products[0]
  );
  const [activeImg, setActiveImage] = useState(
    productImages[activeProduct.id] ? productImages[activeProduct.id][0] : ""
  );
  const [amount, setAmount] = useState(1);
  const [showDescription, setShowDescription] = useState(false);
  const [showDimensions, setShowDimensions] = useState(false);
  const [showCareInstructions, setShowCareInstructions] = useState(false);
  const [showShipping, setShowShipping] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    AOS.init({
      offset: 100,
      duration: 800,
      easing: "ease-in-sine",
      delay: 100,
    });
    AOS.refresh();
  }, []);

  useEffect(() => {
    if (productImages[activeProduct.id]) {
      setActiveImage(productImages[activeProduct.id][0]);
    }
  }, [activeProduct]);

  const fetchUserData = async () => {
    console.log(userInfo);
    try {
      const response = await fetch(
        `http://localhost:3000/api/users/objectIdexport?fbUserId=${userInfo.fbUserId}`, // Assuming this retrieves MongoDB user
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

      const data = await response.json(); // This should return MongoDB user data
      return data;
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Error fetching user data: " + error.message);
      return null;
    }
  };

  const handleAddToCart = async () => {
    console.log(userInfo);
    const token = userInfo?.token;

    if (!token) {
      toast.error("Authentication token is missing.");
      return;
    }

    // Fetch MongoDB user data
    const userData = await fetchUserData();
    if (!userData || !userData._id) {
      toast.error("Failed to fetch user information.");
      return;
    }

    const mongoUserId = userData._id; // Use MongoDB _id

    try {
      const response = await fetch("http://localhost:3000/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: mongoUserId, // MongoDB user ID
          productId: activeProduct.id,
          name: activeProduct.name,
          price: Number(activeProduct.price),
          image: activeProduct.imageUrl,
          quantity: amount,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add to cart");
      }

      toast.success("Product added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("An unexpected error occurred. Please try again later.");
    }
  };

  const handleBuyNow = async () => {
    const userId = userInfo?._id;

    if (!userId) {
      console.error("User ID is missing");
      alert("Please log in to purchase items.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({
          userId,
          productId: activeProduct.id,
          name: activeProduct.name,
          price: Number(activeProduct.price),
          image: activeProduct.imageUrl,
          quantity: amount,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Checkout successful:", data);
      alert("Proceeding to checkout!");
      navigate("/checkout");
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("Failed to proceed with the purchase. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="flex flex-col lg:flex-row items-start justify-center">
          {/* Main Image and Thumbnails */}
          <div className="flex flex-col lg:flex-row lg:gap-3 lg:w-1/2">
            {/* Main Image */}
            <div className="flex-shrink-0 lg:w-2/3">
              <img
                src={activeImg}
                alt="Main Product"
                className="w-full h-full object-cover rounded-lg shadow-lg"
                style={{ maxHeight: '600px' }}
              />
            </div>
            {/* Thumbnail Images */}
            <div className="flex flex-row lg:flex-col lg:w-1/3 lg:mt-0 mt-4 justify-between">
              <div className="grid grid-cols-5 gap-2 lg:grid-cols-1 lg:gap-3">
                {productImages[activeProduct.id] &&
                  productImages[activeProduct.id].map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-20 h-20 lg:w-1/3 lg:h-auto rounded-lg cursor-pointer hover:opacity-75"
                      onClick={() => {
                        setActiveImage(img);
                        setActiveImageIndex(index); // Set the active image index
                      }}
                    />
                  ))}
              </div>
            </div>
          </div>

          {/* productImages[activeProduct.id].map((img, index) */}

          {/* Product Details Section */}
          <div className="lg:w-1/2 flex flex-col lg:pl-8 lg:gap-6 mt-6 lg:mt-0">
            <h1 className="text-5xl lg:text-8xl font-bold text-gray-800 mb-4 ">
              {activeProduct.name}
            </h1>
            <ul className="text-gray-700 text-2xl list- ">
              {activeProduct.description.map((line, index) => (
                <li key={index}>{line}</li>
              ))}
            </ul>

            <h2 className="text-4xl font-semibold my-4">
              ${activeProduct.price.toFixed(2)}
            </h2>

            <div className="flex items-center gap-6">
              <div className="flex items-center">
                <button
                  className="bg-gray-200 py-2 px-4 rounded-lg text-lg"
                  onClick={() => setAmount(Math.max(1, amount - 1))}
                >
                  -
                </button>
                <span className="py-2 px-4 text-lg">{amount}</span>
                <button
                  className="bg-gray-200 py-2 px-4 rounded-lg text-lg"
                  onClick={() => setAmount(amount + 1)}
                >
                  +
                </button>
              </div>

              {/* Add to Cart & Buy Now */}
              <button
                onClick={handleAddToCart}
                className="bg-black text-white py-2 px-6 rounded-xl">
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="bg-gray-800 text-white py-2 px-6 rounded-xl">
                Buy Now
              </button>
            </div>

            {/* Features Section */}
            <div className="flex justify-between py-6 mt-4 bg-gray-100 rounded-lg">
              <div className="flex items-center space-x-5">
                <IconFeature icon={<FaTruck />} text="Free Delivery" />
                <IconFeature icon={<FaMoneyBillAlt />} text="Cash on Delivery" />
                <IconFeature icon={<FaUndo />} text="7 Days Return" />
                <IconFeature icon={<FaBusinessTime />} text="Quick Dispatch" />
              </div>
            </div>



          </div>
        </div>
        <div className="flex flex-col lg:flex-row  mt-8">
          <div className="lg:w-2/3">
            <div className="border-2 border-gray-300 rounded-lg p-4 mb-4">
              <CollapsibleSection
                title="Description"
                isOpen={showDescription}
                toggle={() => setShowDescription(!showDescription)}
              >
                <ul className="text-gray-700 text-sm lg:text-base list-disc list-inside">
                  {activeProduct.description.map((line, index) => (
                    <li key={index}>{line}</li>
                  ))}
                </ul>
              </CollapsibleSection>
            </div>

            <div className="border-2 border-gray-300 rounded-lg p-4 mb-4">
              <CollapsibleSection
                title="Dimensions & Material"
                isOpen={showDimensions}
                toggle={() => setShowDimensions(!showDimensions)}
              >
                <p className="text-gray-700 text-sm lg:text-base">
                  Dimensions: {activeProduct.dimensions}
                </p>
                <p className="text-gray-700 text-sm lg:text-base">
                  Material: {activeProduct.material}
                </p>
              </CollapsibleSection>
            </div>

            <div className="border-2 border-gray-300 rounded-lg p-4 mb-4">
              <CollapsibleSection
                title="Care Instructions"
                isOpen={showCareInstructions}
                toggle={() => setShowCareInstructions(!showCareInstructions)}
              >
                <p className="text-gray-700">Clean with a dry cloth.</p>
              </CollapsibleSection>
            </div>

            <div className="border-2 border-gray-300 rounded-lg p-4 mb-4">
              <CollapsibleSection
                title="Shipping & Returns"
                isOpen={showShipping}
                toggle={() => setShowShipping(!showShipping)}
              >
                <p className="text-gray-700">Free shipping available. Returns accepted within 7 days.</p>
              </CollapsibleSection>
            </div>
          </div>
        </div>


      </div>
      <Footer />
    </>
  );
};

// Collapsible Section Component
const CollapsibleSection = ({ title, isOpen, toggle, children }) => (
  <div className="my-4 border-b">
    <div className="flex items-center justify-between cursor-pointer" onClick={toggle}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <FaChevronDown className={isOpen ? 'transform rotate-180' : ''} />
    </div>
    {isOpen && <div className="mt-2">{children}</div>}
  </div>
);

// IconFeature Component
const IconFeature = ({ icon, text }) => (
  <div className="flex flex-col items-center p-0 m-0 space-y-1"> {/* Space between icon and text */}
    <div className="text-xl">{icon}</div>
    <span className="text-sm text-gray-700">{text}</span>
  </div>
);
export default ServewaresDesc;
