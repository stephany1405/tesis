import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems((prevCartItems) => {
      if (product.note) {
        return [...prevCartItems, { ...product, uniqueId: Date.now() }];
      }
      const existingProduct = prevCartItems.find(
        (item) => item.id === product.id && !item.note
      );

      if (existingProduct) {
        return prevCartItems.map((item) =>
          item.id === product.id && !item.note
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCartItems, { ...product, uniqueId: Date.now() }];
      }
    });
  };

  const removeFromCart = (uniqueId) => {
    setCartItems((prevCartItems) =>
      prevCartItems.filter((item) => item.uniqueId !== uniqueId)
    );
  };

  const updateQuantity = (uniqueId, newQuantity) => {
    setCartItems((prevCartItems) =>
      prevCartItems.map((item) =>
        item.uniqueId === uniqueId ? { ...item, quantity: newQuantity } : item
      )
    );
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
