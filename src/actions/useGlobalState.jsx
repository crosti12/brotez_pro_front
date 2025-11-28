import { useDispatch, useSelector } from "react-redux";
import {
  setUser,
  setView,
  setProducts,
  setOrders,
  setNewOrder,
  setShowNotification,
  setNotificationMessage,
  setIsLoggedIn,
} from "./stateSlice";
import { useTranslation } from "react-i18next";
import { useToast } from "../containers/Notifications/Notifications";

const useGlobalState = () => {
  const { showMessage } = useToast();
  const dispatch = useDispatch();
  const state = useSelector((state) => state.state);
  const { t } = useTranslation();

  const setters = {
    setUser: (val) => dispatch(setUser(val)),
    setView: (val) => dispatch(setView(val)),
    setProducts: (val) => dispatch(setProducts(val)),
    setOrders: (val) => dispatch(setOrders(val)),
    setNewOrder: (val) => dispatch(setNewOrder(val)),
    setShowNotification: (val) => dispatch(setShowNotification(val)),
    setNotificationMessage: (val) => dispatch(setNotificationMessage(val)),
    setIsLoggedIn: (val) => dispatch(setIsLoggedIn(val)),
  };

  return { ...state, ...setters, t, showMessage };
};

export default useGlobalState;
