import useGlobalState from "../actions/useGlobalState";
import axios from "axios";

const baseUrl = import.meta.env.VITE_API_URL;

const useReq = ({ url = baseUrl, method = "GET" }) => {
  const { setIsLoggedIn, showMessage } = useGlobalState();

  const req = async ({ body, params = "" }) => {
    const urlWithParams = params ? `${url}/api/${params}` : `${url}/api`;

    try {
      const response = await axios({
        url: urlWithParams,
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        data: body || undefined,
      });

      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Unknown error";
      showMessage(message, "error");
      if (message === "token_invalid") {
        setIsLoggedIn(false);
      }

      console.error(error);
    }
  };

  return req;
};

export default useReq;
