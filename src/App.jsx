import { useEffect } from "react";
import Login from "./containers/Login/Login";
import useGlobalState from "./actions/useGlobalState";
import Routes from "./Routes";
import useAPI from "./actions/useAPI";
import { useTranslation } from "react-i18next";

function App() {
  const { isLoggedIn, user } = useGlobalState();
  const { getProducts, getOrders, getDollar } = useAPI();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (isLoggedIn) {
      (async () => {
        await Promise.all([getProducts(), getOrders(), getDollar()]);
      })();
    }
    i18n.changeLanguage(user?.language || "es");
  }, [isLoggedIn, user]);

  return <div className="main-layout">{isLoggedIn ? <Routes /> : <Login />}</div>;
}

export default App;
