import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems((prevCartItems) => {
      const instanceId = `${product.id}_${Date.now()}`;
      const newProduct = {
        ...product,
        instanceId,
        quantity: 1,
      };

      return [...prevCartItems, newProduct];
    });
  };

  const removeFromCart = (instanceId) => {
    setCartItems((prevCartItems) => {
      return prevCartItems.filter((item) => item.instanceId !== instanceId);
    });
  };

  const updateQuantity = (instanceId, newQuantity) => {
    setCartItems((prevCartItems) => {
      return prevCartItems.map((item) =>
        item.instanceId === instanceId
          ? { ...item, quantity: newQuantity }
          : item
      );
    });
  };

  const resetCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        resetCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
