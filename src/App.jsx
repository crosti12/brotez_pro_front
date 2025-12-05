import { useEffect } from "react";
import Login from "./containers/Login/Login";
import useGlobalState from "./actions/useGlobalState";
import Routes from "./Routes";
import useAPI from "./actions/useAPI";
import { useTranslation } from "react-i18next";
import { baseUrl } from "./components/useReq";

function App() {
  const { isLoggedIn, user } = useGlobalState();
  const { getProducts, getOrders } = useAPI();
  const { i18n } = useTranslation();

  const handleNotify = async (eventType) => {
    const actions = {
      orders: getOrders,
      products: getProducts,
    };
    if (actions[eventType]) {
      try {
        await actions[eventType]();
      } catch (err) {
        console.error("Notification handler failed:", err);
      }
    } else {
      console.warn("Unknown event type:", eventType);
    }
  };

  useEffect(() => {
    let source = null;

    const stablishConnection = () => {
      const eventUrl = `${baseUrl}/events?userId=${user.id || ""}`;
      source = new EventSource(eventUrl);

      source.onmessage = (event) => {
        console.log("SSE event:", event.data);
        handleNotify(event.data);
      };

      source.onerror = (error) => {
        console.error("SSE error:", error);
        source.close();
      };
    };

    if (user?.id) stablishConnection();

    return () => source && source.close();
  }, [user]);

  useEffect(() => {
    if (isLoggedIn) {
      (async () => {
        await Promise.all([getProducts(), getOrders()]);
      })();
    }
    i18n.changeLanguage(user?.language || "es");
  }, [isLoggedIn, user]);

  return <div className="main-layout">{isLoggedIn ? <Routes /> : <Login />}</div>;
}

export default App;
