import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems((prevCartItems) => {
      const existingProduct = prevCartItems.find(
        (item) => item.id === product.id
      );

      if (existingProduct) {
        const updatedCartItems = prevCartItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        console.log("Updated Cart Items:", updatedCartItems); 
        return updatedCartItems;
      } else {
        const newCartItems = [...prevCartItems, product];
        console.log("New Cart Items:", newCartItems); 
        return newCartItems;
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevCartItems) => {
      const updatedCartItems = prevCartItems.filter(
        (item) => item.id !== productId
      );
      console.log("Updated Cart Items after removal:", updatedCartItems); 
      return updatedCartItems;
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    setCartItems((prevCartItems) => {
      const updatedCartItems = prevCartItems.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
      console.log(
        "Updated Cart Items after quantity change:",
        updatedCartItems
      ); 
      return updatedCartItems;
    });
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
};
