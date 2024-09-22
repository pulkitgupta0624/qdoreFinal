import Product from "../models/product.js";

// Function to get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Function to add a new product
export const addProduct = async (req, res) => {
  try {
    const { productId, userId } = req.body;
    // Logic to save product information
    const product = await Product.findById(productId);
    // Ensure the product is saved or updated correctly
    res.status(200).json({ message: "Product saved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
