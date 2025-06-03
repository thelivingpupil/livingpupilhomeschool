import { createContext, useContext, useEffect, useMemo, useState, useRef } from 'react';
import api from '@/lib/common/api';
import toast from 'react-hot-toast';
import { ShippingType } from '@prisma/client';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { storage } from '@/lib/client/firebase';
import crypto from 'crypto';
import format from 'date-fns/format';

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
  signatureProgress: 0, //returned
  signatureLink: '', //returned
  sigCanvas: null, //returned
  showSignCanvas: false, //returned
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
  clearSignature: () => { }, //returned
  toggleSignCanvasVisibility: () => { }, //returned
  saveSignature: () => { },
  handleEndDrawing: () => { },
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
    fee: (location) => {
      const rates = {
        Liloan: 130,
        'Mandaue City': 130,
        'Consolation': 140,
        'Lapu-Lapu City': 150,
        'Cebu City': 160,
        'Talisay City': 170,
        'Minglanilia': 180,
        'Naga City': 200,
        'Compostela': 200,
      };
      return rates[location]; // Default to Cebu City rate if location is not found
    },
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
  const [signatureLink, setSignatureLink] = useState(null); //initiated
  const [signatureProgress, setSignatureProgress] = useState(0); //initiated
  const sigCanvas = useRef(null); //initiated
  const [isEmptyCanvas, setIsEmptyCanvas] = useState(true); //initiated
  const [showSignCanvas, setShowSignCanvas] = useState(false); //initiated

  //initiated
  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setIsEmptyCanvas(true); // Mark canvas as empty after clearing
    }
  };

  //initiated
  // Toggle modal visibility
  const toggleSignCanvasVisibility = () => setShowSignCanvas((state) => !state);


  const dataURLToBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = Buffer.from(arr[1], 'base64');
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr[n];
    }
    return new Blob([u8arr], { type: mime });
  };

  const uploadSignature = (dataUrl) => {
    console.log(dataUrl)
    const blob = dataURLToBlob(dataUrl);
    const extension = 'png';
    const fileName = `signature-${crypto
      .createHash('md5')
      .update(dataUrl)
      .digest('hex')
      .substring(0, 12)}-${format(new Date(), 'yyyy.MM.dd.kk.mm.ss')}.${extension}`;

    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setSignatureProgress(progress);
      },
      (error) => {
        toast.error(error.message);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setSignatureLink(downloadURL);
        });
      }
    );
  };

  //initiated
  const saveSignature = () => {
    if (sigCanvas.current && !isEmptyCanvas) {
      const signatureData = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      uploadSignature(signatureData);
    } else {
      alert("Please sign before saving.");
    }
  };

  useEffect(() => {
    if (showSignCanvas && sigCanvas.current) {
      sigCanvas.current.clear(); // Ensure the canvas is clear on show
      setIsEmptyCanvas(true); // Reset the empty status when modal opens
      console.log(isEmptyCanvas)
    }
  }, [showSignCanvas]);

  //initiated
  const handleEndDrawing = () => {
    if (sigCanvas.current) {
      // Check if the canvas is actually empty
      if (sigCanvas.current.isEmpty()) {
        setIsEmptyCanvas(true); // Mark canvas as empty if no drawing
      } else {
        setIsEmptyCanvas(false); // Mark canvas as not empty if there is drawing
      }
    }
  };

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
      body: { items: cart, shippingFee, deliveryAddress, contactNumber, paymentType, signatureLink },
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
        signatureProgress,
        signatureLink,
        sigCanvas,
        showSignCanvas,
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
        clearSignature,
        toggleSignCanvasVisibility,
        saveSignature,
        handleEndDrawing
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
