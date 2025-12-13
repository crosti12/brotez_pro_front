import "./NavBar.css";
import Button from "../../components/Button";
import AddCircle from "@mui/icons-material/AddCircle";
import HistoryIcon from "@mui/icons-material/History";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import useGlobalState from "../../actions/useGlobalState";
import AssignmentIndIcon from "@mui/icons-material/PersonAddAltOutlined";
import useAPI from "../../actions/useAPI";
const ADD_SIZE = "50px";
const BUTTON_SIZE = "30px";

const NavBar = () => {
  const { getProducts, getOrders, getClients } = useAPI();
  const navButtons = [
    {
      id: "products",
      icon: <AddShoppingCartIcon sx={{ width: BUTTON_SIZE, height: BUTTON_SIZE }} />,
      className: "nav-btn",
      styles: { width: BUTTON_SIZE, height: BUTTON_SIZE },
      extraFnc: () => getProducts(),
    },
    {
      id: "dashboard",
      icon: <QueryStatsIcon sx={{ width: BUTTON_SIZE, height: BUTTON_SIZE }} />,
      className: "nav-btn",
      styles: { width: BUTTON_SIZE, height: BUTTON_SIZE },
    },
    {
      id: "addOrder",
      icon: <AddCircle sx={{ width: ADD_SIZE, height: ADD_SIZE }} />,
      className: "add-order",
      styles: { width: ADD_SIZE, height: ADD_SIZE },
      extraFnc: () => getProducts(),
    },
    {
      id: "userManagement",
      icon: <AssignmentIndIcon sx={{ width: BUTTON_SIZE, height: BUTTON_SIZE }} />,
      className: "nav-btn",
      styles: { width: BUTTON_SIZE, height: BUTTON_SIZE },
      extraFnc: () => getClients(),
    },
    {
      id: "history",
      icon: <HistoryIcon sx={{ width: BUTTON_SIZE, height: BUTTON_SIZE }} />,
      className: "nav-btn",
      styles: { width: BUTTON_SIZE, height: BUTTON_SIZE },
      extraFnc: () => getOrders(),
    },
  ];

  const { view, setView, user } = useGlobalState();
  const allowedViews = {
    ...(user.permissions || {}),
  };

  return (
    <div className="navbar">
      {navButtons.map((btn, index) => (
        <div style={btn.styles} key={btn.id}>
          {allowedViews[btn.id] && (
            <Button
              key={index}
              onClick={() => {
                setView(btn.id);
                btn.extraFnc && btn.extraFnc();
              }}
              className={btn.className + " " + (view === btn.id ? "view-active" : "")}
              id={btn.id}
            >
              {btn.icon}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};

export default NavBar;
