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
  paymentType: '',
  addToCart: () => { },
  removeFromCart: () => { },
  setShippingFee: () => { },
  setDeliveryAddress: () => { },
  setContactNumber: () => { },
  clearCart: () => { },
  toggleCartVisibility: () => { },
  togglePaymentLinkVisibility: () => { },
  checkoutCart: () => { },
  setPaymentType: () => { },
};

const LPH_CART_KEY = 'LPHCART';

const CartContext = createContext(cartInitialState);

const calculateShippingFee = (shippingType, itemCount) => {
  if (shippingType === ShippingType.WITHIN_CEBU) {
    return 160;
  }

  if (itemCount >= 25) {
    return 500;
  } else if (itemCount >= 10) {
    return 400;
  } else {
    return 300;
  }
};

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
    fee: (itemCount) => calculateShippingFee(ShippingType.NCR, itemCount),
    key: ShippingType.NCR,
    value: 'ncr',
  },
  northLuzon: {
    title: 'North Luzon',
    fee: (itemCount) => calculateShippingFee(ShippingType.NORTH_LUZON, itemCount),
    key: ShippingType.NORTH_LUZON,
    value: 'northLuzon',
  },
  southLuzon: {
    title: 'South Luzon',
    fee: (itemCount) => calculateShippingFee(ShippingType.SOUTH_LUZON, itemCount),
    key: ShippingType.SOUTH_LUZON,
    value: 'southLuzon',
  },
  visayas: {
    title: 'Other Visayas Region',
    fee: (itemCount) => calculateShippingFee(ShippingType.VISAYAS, itemCount),
    key: ShippingType.VISAYAS,
    value: 'visayas',
  },
  mindanao: {
    title: 'Mindanao',
    fee: (itemCount) => calculateShippingFee(ShippingType.MINDANAO, itemCount),
    key: ShippingType.MINDANAO,
    value: 'mindanao',
  },
  islander: {
    title: 'Islander',
    fee: (itemCount) => calculateShippingFee(ShippingType.ISLANDER, itemCount),
    key: ShippingType.ISLANDER,
    value: 'islander',
  },
};

export const SHOP_PAYMENT_TYPE = {
  FULL_PAYMENT: 'Full Payment',
  INSTALLMENT: 'Installment'
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
  const [paymentType, setPaymentType] = useState({});

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem(LPH_CART_KEY));

    if (storedCart) {
      setCart([...storedCart]);
    }
  }, []);

  const itemCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);

  useEffect(() => {
    if (shippingFee.key) {
      const fee = typeof shippingFee.fee === 'function' ? shippingFee.fee(itemCount) : shippingFee.fee || 0;
      setShippingFee((prev) => ({ ...prev, fee }));
    }
  }, [cart, shippingFee.key]);

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
      body: { items: cart, shippingFee, deliveryAddress, contactNumber, paymentType },
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
        ? [...cart].map((cartItem, index) =>
          index === findExistingItem ? { ...cartItem, quantity: cartItem.quantity + item.quantity } : cartItem)
        : [...cart, item];

    setCart([...newCart]);
    localStorage.setItem(LPH_CART_KEY, JSON.stringify([...newCart]));

    // Update shipping fee based on the new cart
    const itemCount = newCart.reduce((total, item) => total + item.quantity, 0);
    if (shippingFee.key) {
      const fee = typeof SHOP_SHIPPING[shippingFee.value].fee === 'function'
        ? SHOP_SHIPPING[shippingFee.value].fee(itemCount)
        : SHOP_SHIPPING[shippingFee.value].fee;
      setShippingFee((prev) => ({ ...prev, fee }));
    }
  };

  const removeFromCart = (id) => {
    const newCart = cart.filter((item) => item.id !== id);

    setCart([...newCart]);
    localStorage.setItem(LPH_CART_KEY, JSON.stringify([...newCart]));

    // Update shipping fee based on the new cart
    const itemCount = newCart.reduce((total, item) => total + item.quantity, 0);
    if (shippingFee.key) {
      const fee = typeof SHOP_SHIPPING[shippingFee.value].fee === 'function'
        ? SHOP_SHIPPING[shippingFee.value].fee(itemCount)
        : SHOP_SHIPPING[shippingFee.value].fee;
      setShippingFee((prev) => ({ ...prev, fee }));
    }
  };

  const clearCart = () => {
    setCart([]);
    localStorage.setItem(LPH_CART_KEY, JSON.stringify([]));

    // Clear shipping fee
    setShippingFee({});
  };

  // Update setPaymentType to ensure it's setting the value correctly
  const handleSetPaymentType = (type) => {
    setPaymentType(type);
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
        paymentType,
        addToCart,
        setShippingFee,
        setDeliveryAddress,
        setContactNumber,
        removeFromCart,
        clearCart,
        toggleCartVisibility,
        togglePaymentLinkVisibility,
        checkoutCart,
        setPaymentType: handleSetPaymentType, // Updated to use the new function
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
