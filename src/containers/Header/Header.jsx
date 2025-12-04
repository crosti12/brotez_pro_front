import "./Header.css";
import { Avatar } from "@mui/material";
import useGlobalState from "../../actions/useGlobalState";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import Button from "../../components/Button";
import { useState } from "react";
import SettingModal from "./SettingModal";

const Header = () => {
  const { user } = useGlobalState();
  const [openSettings, setOpenSettings] = useState(false);
  const onOpenSettings = () => setOpenSettings(true);

  return (
    <header className="header">
      <Avatar>
        <AccountCircleIcon />
      </Avatar>
      <div>
        <p className="header-font">{user.username}</p>
        <p className="body-font">{user.role}</p>
      </div>
      <Button onClick={onOpenSettings} className="open-settings-btn">
        <SettingsIcon className="setting-icon" />
      </Button>
      <SettingModal visible={openSettings} setVisible={setOpenSettings} />
    </header>
  );
};

export default Header;
