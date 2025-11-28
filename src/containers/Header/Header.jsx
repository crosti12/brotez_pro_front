import "./Header.css";
import { Avatar } from "@mui/material";
import useGlobalState from "../../actions/useGlobalState";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import { useEffect } from "react";

const Header = () => {
  const { user } = useGlobalState();
  useEffect(() => {});
  return (
    <header className="header">
      <Avatar>
        <AccountCircleIcon />
      </Avatar>
      <div>
        <p className="header-font">{user.username}</p>
        <p className="body-font">{user.role}</p>
      </div>

      <SettingsIcon className="setting-icon" />
    </header>
  );
};

export default Header;
