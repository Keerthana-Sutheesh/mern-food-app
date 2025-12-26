import { createContext, useState } from 'react';


export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem('cart');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  });

  const addToCart = (item) => {

    const isCustomized = item.customizations || item.specialInstructions;

    if (isCustomized) {
      const cartEntry = {
        ...item,
        quantity: 1,
        cartId: `c_${Date.now()}_${Math.floor(Math.random()*10000)}`,
        customizations: item.customizations || [],
        specialInstructions: item.specialInstructions || ''
      };
      const updatedCart = [...cartItems, cartEntry];
      setCartItems(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      return;
    }


    const existing = cartItems.find(i => i._id === item._id && !i.cartId);

    let updatedCart;
    if (existing) {
      updatedCart = cartItems.map(i =>
        !i.cartId && i._id === item._id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      );
    } else {
      updatedCart = [...cartItems, { ...item, quantity: 1 }];
    }

    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeFromCart = (idOrCartId) => {
    const updatedCart = cartItems.filter(i => (i.cartId ? i.cartId !== idOrCartId : i._id !== idOrCartId));
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }

    const updatedCart = cartItems.map(item =>
      (item.cartId ? item.cartId === id : item._id === id)
        ? { ...item, quantity: newQuantity }
        : item
    );

    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems
    }}>
      {children}
    </CartContext.Provider>
  );
};
