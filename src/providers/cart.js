import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '@/lib/common/api';
import toast from 'react-hot-toast';
import { ShippingType } from '@prisma/client';

const cartInitialState = {
  cart: [],
  total: 0,
  showCart: false,
  showPaymentLink: false,
  isSubmitting: false,
  paymentLink: '',
  shippingFee: {},
  deliveryAddress: '',
  contactNumber: '',
  addToCart: () => {},
  removeFromCart: () => {},
  setShippingFee: () => {},
  setDeliveryAddress: () => {},
  setContactNumber: () => {},
  clearCart: () => {},
  toggleCartVisibility: () => {},
  togglePaymentLinkVisibility: () => {},
  checkoutCart: () => {},
};

const LPH_CART_KEY = 'LPHCART';

const CartContext = createContext(cartInitialState);

export const SHOP_SHIPPING = {
  pickup: {
    title: 'Pick Up',
    fee: 0,
    key: ShippingType.PICK_UP,
    value: 'pickup',
  },
  withInCebu: {
    title: 'Within Cebu',
    fee: 160,
    key: ShippingType.WITHIN_CEBU,
    value: 'withInCebu',
  },
  ncr: {
    title: 'NCR',
    fee: 200,
    key: ShippingType.NCR,
    value: 'ncr',
  },
  northLuzon: {
    title: 'North Luzon',
    fee: 210,
    key: ShippingType.NORTH_LUZON,
    value: 'northLuzon',
  },
  southLuzon: {
    title: 'South Luzon',
    fee: 210,
    key: ShippingType.SOUTH_LUZON,
    value: 'southLuzon',
  },
  visayas: {
    title: 'Other Visayas Region',
    fee: 200,
    key: ShippingType.VISAYAS,
    value: 'visayas',
  },
  mindanao: {
    title: 'Mindanao',
    fee: 200,
    key: ShippingType.MINDANAO,
    value: 'mindanao',
  },
  islander: {
    title: 'Islander',
    fee: 210,
    key: ShippingType.ISLANDER,
    value: 'islander',
  },
};

export const useCartContext = () => useContext(CartContext);

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [showCart, setCartVisibility] = useState(false);
  const [showPaymentLink, setPaymentLinkVisibility] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');
  const [shippingFee, setShippingFee] = useState({});
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem(LPH_CART_KEY));

    if (cart) {
      setCart([...cart]);
    }
  }, []);

  const total = useMemo(
    () =>
      cart.reduce((a, b) => a + b.price * b.quantity, 0) +
      (shippingFee?.fee || 0),
    [cart, shippingFee]
  );

  const toggleCartVisibility = () => setCartVisibility((state) => !state);

  const togglePaymentLinkVisibility = () =>
    setPaymentLinkVisibility((state) => !state);

  const checkoutCart = () => {
    setSubmitting(true);

    api('/api/shop', {
      body: { items: cart, shippingFee, deliveryAddress, contactNumber },
      method: 'POST',
    }).then((response) => {
      setSubmitting(false);

      if (response.errors) {
        Object.keys(response.errors).forEach((error) =>
          toast.error(response.errors[error].msg)
        );
      } else {
        toggleCartVisibility();
        setPaymentLink(response.data.paymentLink);
        togglePaymentLinkVisibility();
        setCart([]);
        localStorage.setItem(LPH_CART_KEY, JSON.stringify([]));
        toast.success('Posted items for purchase!');
      }
    });
  };

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
    localStorage.setItem(LPH_CART_KEY, JSON.stringify([]));
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        total,
        showCart,
        showPaymentLink,
        shippingFee,
        deliveryAddress,
        contactNumber,
        isSubmitting,
        paymentLink,
        addToCart,
        setShippingFee,
        setDeliveryAddress,
        setContactNumber,
        removeFromCart,
        clearCart,
        toggleCartVisibility,
        togglePaymentLinkVisibility,
        checkoutCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
