const { createContext, useContext, useMemo, useState } = require('react');

const cartInitialState = {
  cart: [],
  total: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
};

const CartContext = createContext(cartInitialState);

export const useCartContext = () => useContext(CartContext);

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const total = useMemo(
    () => cart.reduce((a, b) => a + b.price * b.quantity, 0),
    [cart]
  );

  const addToCart = (item) => {
    const findExistingItem = cart.findIndex(
      (cartItem) => cartItem.id === item.id
    );

    const newCart =
      findExistingItem !== -1
        ? [...cart].splice(findExistingItem, 1, item)
        : [...cart, item];

    setCart([...newCart]);
  };

  const removeFromCart = (id) => {
    const findExistingCartIndex = cart.findIndex((item) => item.id === id);

    const newCart = [...cart].splice(findExistingCartIndex, 1);

    setCart([...newCart]);
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        total,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
