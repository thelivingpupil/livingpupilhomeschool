const { createContext, useContext, useMemo, useState } = require('react');

const cartInitialState = {
  cart: [],
  total: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
};

const LPH_CART_KEY = 'LPHCART';

const existingCart = localStorage.getItem(LPH_CART_KEY);

const CartContext = createContext(cartInitialState);

export const useCartContext = () => useContext(CartContext);

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(
    existingCart ? JSON.parse(existingCart) : []
  );

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
    localStorage.setItem(LPH_CART_KEY, JSON.stringify([...newCart]));
  };

  const removeFromCart = (id) => {
    const findExistingCartIndex = cart.findIndex((item) => item.id === id);

    const cloneCart = [...cart];

    cloneCart.splice(findExistingCartIndex, 1);

    setCart([...cloneCart]);

    localStorage.setItem(LPH_CART_KEY, JSON.stringify([...cloneCart]));
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
