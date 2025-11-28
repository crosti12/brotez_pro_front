import { useEffect } from "react";
import Login from "./containers/Login/Login";
import useGlobalState from "./actions/useGlobalState";
import Routes from "./Routes";
import useAPI from "./actions/useAPI";

function App() {
  const { isLoggedIn, user } = useGlobalState();
  const { getProducts, getOrders } = useAPI();

  useEffect(() => {
    isLoggedIn &&
      (async () => {
        await getProducts();
        await getOrders();
      })();
  }, [user]);

  return <div className="main-layout">{isLoggedIn ? <Routes /> : <Login />}</div>;
}

export default App;
