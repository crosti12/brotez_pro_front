import { useDispatch } from "react-redux";
import useReq from "../components/useReq";
import { setClients, setDolarValue, setOrders, setProducts, setProductsWithDeleted, setUser } from "./stateSlice";
import axios from "axios";
import { format } from "date-fns";
import useDb from "../DB/useDb";

const useAPI = () => {
  const dispatch = useDispatch();
  const getReq = useReq({ method: "GET" });
  const postReq = useReq({ method: "POST" });
  const putReq = useReq({ method: "PUT" });
  const deleteReq = useReq({ method: "DELETE" });
  const { getItem, getAllItems, saveCollection } = useDb();

  const getProducts = async () => {
    try {
      const productMetaData = await getItem("lastUpdated", "products");
      const url = `products${productMetaData ? "?lastUpdated=" + productMetaData.updatedAt : ""}`;
      const resp = await getReq({ params: url });

      let allProducts = [];

      if (!productMetaData) allProducts = resp;
      else {
        const savedProducts = await getAllItems("products");
        if (!savedProducts || savedProducts.length === 0) {
          allProducts = resp || [];
        } else {
          allProducts = savedProducts.map((product) => {
            const orderUpdated = resp.find((productItem) => productItem._id === product._id);
            return orderUpdated ? orderUpdated : product;
          });

          const newOrders = resp.filter((productItem) => !savedProducts.some((order) => order._id === productItem._id));
          allProducts = [...allProducts, ...newOrders];
        }
      }

      const filteredProducts = allProducts.filter((product) => !product?.isDeleted);

      dispatch(setProducts(filteredProducts));
      dispatch(setProductsWithDeleted(allProducts));

      saveCollection("products", allProducts);
      return true;
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

  const updateProduct = async (data) => {
    const id = data._id;
    const body = { ...data };
    delete body.__v;
    delete body._id;
    delete body.createdAt;

    try {
      await putReq({ params: `products/id/${id}`, body });
      await getProducts();
      return true;
    } catch (error) {
      console.error(error);
    }
  };

  const deleteProduct = async (data) => {
    const id = data._id;
    try {
      await deleteReq({ params: `products/id/${id}` });
      await getProducts();
      return true;
    } catch (error) {
      console.error(error);
    }
  };

  // *******************************************************************************

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
        dispatch(setDolarValue(data.previous.usd || data.current.usd));
      } else {
        dispatch(setDolarValue(data.current.usd));
      }
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

  //  *******************************************************************************
  const getClients = async () => {
    try {
      const clientMetaData = await getItem("lastUpdated", "clients");
      const url = `clients${clientMetaData ? "?lastUpdated=" + clientMetaData.updatedAt : ""}`;
      const resp = await getReq({ params: url });

      let allClients = [];

      if (!clientMetaData) allClients = resp;
      else {
        const savedClients = await getAllItems("clients");
        if (!savedClients || savedClients.length === 0) allClients = resp || [];
        else {
          allClients = savedClients.map((client) => {
            const clientUpdated = resp.find((clientItem) => clientItem._id === client._id);
            return clientUpdated ? clientUpdated : client;
          });

          const newClients = resp.filter((clientItem) => !savedClients.some((client) => client._id === clientItem._id));

          allClients = [...allClients, ...newClients].filter((client) => !client?.isDeleted);
        }
      }

      dispatch(setClients(allClients));
      saveCollection("clients", allClients);
      return true;
    } catch (error) {
      console.error(error);
    }
  };

  // ***********************************************************************

  const getOrders = async () => {
    try {
      const orderMetaData = await getItem("lastUpdated", "orders");
      const url = `orders${orderMetaData ? "?lastUpdated=" + orderMetaData.updatedAt : ""}`;
      const resp = await getReq({ params: url });

      let allOrders = [];

      if (!orderMetaData) allOrders = resp;
      else {
        const savedOrders = await getAllItems("orders");
        if (!savedOrders || savedOrders.length === 0) {
          allOrders = resp || [];
        } else {
          allOrders = savedOrders.map((order) => {
            const orderUpdated = resp.find((orderItem) => orderItem._id === order._id);
            return orderUpdated ? orderUpdated : order;
          });

          const newOrders = resp.filter((orderItem) => !savedOrders.some((order) => order._id === orderItem._id));
          allOrders = [...allOrders, ...newOrders].filter((order) => !order?.isDeleted);
        }
      }

      dispatch(setOrders(allOrders));
      saveCollection("orders", allOrders);
      return true;
    } catch (error) {
      console.error(error);
    }
  };

  const createOrder = async (data) => {
    const body = { ...data, area: "san onofre" };
    try {
      await postReq({ params: "orders", body });
      await getOrders();
      await getClients();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const updateOrder = async (updatedInfo, id) => {
    try {
      const resp = await putReq({ params: `orders/id/${id}`, body: updatedInfo });
      await getOrders();
      await getClients();
      return resp;
    } catch (error) {
      console.error(error);
    }
  };

  const deleteOrder = async (id) => {
    try {
      const resp = await deleteReq({ params: `orders/id/${id}` });
      await getOrders();
      return resp;
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
    getClients,
  };
};

export default useAPI;
