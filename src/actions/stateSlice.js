import { createSlice } from "@reduxjs/toolkit";
import { PAYMENT_TYPES } from "../constants";
const EXPIRATION_TIME = 24 * 60 * 60 * 1000;

const isTokenValid = () => {
  const tokenDateStr = localStorage.getItem("tokenDate");
  if (!tokenDateStr) return false;

  const tokenDate = Number(tokenDateStr);
  const now = Date.now();

  return now < tokenDate + EXPIRATION_TIME;
};

const initialState = {
  user: JSON.parse(localStorage.getItem("user") || "{}"),
  view: localStorage.getItem("view") || "addOrder",
  products: [], // local state here  (network first)
  orders: [], // local state here (network first)
  newOrder: {
    paymentType: PAYMENT_TYPES[0],
    isPaid: true,
  },
  orderType: "new",
  productsWithDeleted: [],
  showNotification: false,
  notificationMessage: "",
  isLoggedIn: isTokenValid(),
  dolarValue: Number(localStorage.getItem("dolarValue") || 0),
};

const globalSlice = createSlice({
  name: "globalState",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload || {}));
    },
    setView: (state, action) => {
      localStorage.setItem("view", action.payload);
      state.view = action.payload;
    },
    setProducts: (state, action) => {
      state.products = (action.payload || []).sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
    },
    setOrders: (state, action) => {
      state.orders = action.payload;
    },
    setNewOrder: (state, action) => {
      state.newOrder = action.payload;
    },
    setShowNotification: (state, action) => {
      state.showNotification = action.payload;
    },
    setNotificationMessage: (state, action) => {
      state.notificationMessage = action.payload;
    },
    setIsLoggedIn: (state, action) => {
      state.isLoggedIn = action.payload;
    },
    setProductsWithDeleted: (state, action) => {
      state.productsWithDeleted = action.payload;
    },
    setOrderType: (state, action) => {
      state.orderType = action.payload;
    },
    setDolarValue: (state, action) => {
      localStorage.setItem("dolarValue", action.payload);
      state.dolarValue = action.payload;
    },
  },
});

export const {
  setUser,
  setProductsWithDeleted,
  setDolarValue,
  setView,
  setIsLoggedIn,
  setProducts,
  setOrders,
  setNewOrder,
  setShowNotification,
  setNotificationMessage,
  setOrderType,
} = globalSlice.actions;

export default globalSlice.reducer;
