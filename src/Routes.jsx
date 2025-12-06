import useGlobalState from "./actions/useGlobalState";
import NavBar from "./containers/NavBar/NavBar";
import Dashboard from "./containers/Dashboard/Dashboard";
import Order from "./containers/Order/Order";
import History from "./containers/History/History";
import Products from "./containers/Products/Products";
import Header from "./containers/Header/Header";
import "./layout.css";
// import UserManagement from "./containers/UserManagement/UserManagement";

const Routes = () => {
  const { view } = useGlobalState();
  const routes = {
    dashboard: <Dashboard />,
    addOrder: <Order />,
    history: <History />,
    // userManagement: <UserManagement />,
    products: <Products />,
  };

  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">{routes[view]}</main>
      <NavBar />
    </div>
  );
};

export default Routes;
