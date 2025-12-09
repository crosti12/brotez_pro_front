import { useDispatch } from "react-redux";
import useReq from "../components/useReq";
import { setDolarValue, setOrders, setProducts, setProductsWithDeleted, setUser } from "./stateSlice";
import axios from "axios";
import { format } from "date-fns";

const useAPI = () => {
  const dispatch = useDispatch();
  const getReq = useReq({ method: "GET" });
  const postReq = useReq({ method: "POST" });
  const putReq = useReq({ method: "PUT" });
  const deleteReq = useReq({ method: "DELETE" });

  const getProducts = async () => {
    try {
      const resp = await getReq({ params: "products" });
      if (resp) {
        dispatch(setProducts(resp.filter((pro) => !pro?.isDeleted)));
        dispatch(setProductsWithDeleted(resp));
      }
      return resp;
    } catch (error) {
      console.error(error);
    }
  };

  const onCreateProduct = async (body) => {
    try {
      const resp = await postReq({ params: "products", body });
      if (resp) await getProducts();
      return resp;
    } catch (error) {
      console.error(error);
    }
  };

  const onLogin = async ({ password = "", username = "" }) => {
    if (!password || !username) return;
    try {
      const resp = await postReq({
        params: "users/login",
        body: { username: username.trim().toLowerCase(), password },
      });
      localStorage.setItem("token", resp.token);
      localStorage.setItem("tokenDate", Date.now().toString());
      return resp;
    } catch (error) {
      console.error(error);
    }
  };

  const updateProduct = async (data) => {
    const id = data._id;
    const body = { ...data };
    try {
      delete body.__v;
      delete body._id;
      delete body.createdAt;
      const resp = await putReq({ params: `products/id/${id}`, body });
      if (resp) {
        dispatch(setProducts(resp.filter((pro) => !pro?.isDeleted)));
        dispatch(setProductsWithDeleted(resp));
      }
      return resp;
    } catch (error) {
      console.error(error);
    }
  };

  const deleteProduct = async (data) => {
    const id = data._id;
    try {
      const resp = await deleteReq({ params: `products/id/${id}` });
      if (resp) {
        dispatch(setProducts(resp.filter((pro) => !pro?.isDeleted)));
        dispatch(setProductsWithDeleted(resp));
      }
      return resp;
    } catch (error) {
      console.error(error);
    }
  };
  const getOrders = async () => {
    try {
      const resp = await getReq({ params: "orders" });
      resp && dispatch(setOrders(resp));
    } catch (error) {
      console.error(error);
    }
  };

  const createOrder = async (data) => {
    const body = { ...data, area: "san onofre" };
    try {
      const resp = await postReq({ params: "orders", body });
      resp && dispatch(setOrders(resp));
      return resp;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const updateOrder = async (updatedInfo, id) => {
    try {
      const resp = await putReq({ params: `orders/id/${id}`, body: updatedInfo });
      resp && dispatch(setOrders(resp));
      return resp;
    } catch (error) {
      console.error(error);
    }
  };

  const deleteOrder = async (id) => {
    try {
      const resp = await deleteReq({ params: `orders/id/${id}` });
      resp && dispatch(setOrders(resp));
      return resp;
    } catch (error) {
      console.error(error);
    }
  };

  const updateUser = async (newData, id) => {
    try {
      const resp = await putReq({ params: "users/id/" + id, body: newData });
      resp && dispatch(setUser(resp));
      return resp;
    } catch (error) {
      console.error(error);
    }
  };
  const getDollar = async () => {
    try {
      const resp = await axios({
        url: "https://api.dolarvzla.com/public/exchange-rate",
        method: "GET",
      });
      const today = format(new Date(), "yyyy-MM-dd");
      const data = resp?.data;
      if (data.current?.date !== today) {
        dispatch(setDolarValue(data.previous.usd));
      } else {
        dispatch(setDolarValue(data.current.usd));
      }
    } catch (error) {
      console.error(error);
    }
  };
  return {
    getProducts,
    getDollar,
    updateUser,
    onLogin,
    onCreateProduct,
    updateOrder,
    deleteOrder,
    createOrder,
    getOrders,
    updateProduct,
    deleteProduct,
  };
};

export default useAPI;
