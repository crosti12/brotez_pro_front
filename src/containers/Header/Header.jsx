import "./Header.css";
import { Avatar } from "@mui/material";
import useGlobalState from "../../actions/useGlobalState";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import Button from "../../components/Button";
import { useState } from "react";
import SettingModal from "./SettingModal";
import UpdateIcon from '@mui/icons-material/Update';
import useAPI from "../../actions/useAPI";

const Header = () => {
  const { user, dolarValue } = useGlobalState();
  const [openSettings, setOpenSettings] = useState(false);
  const onOpenSettings = () => setOpenSettings(true);
  const { updateDollar } = useAPI();
  
  return (
    <header className="header">
      <Avatar>
        <AccountCircleIcon />
      </Avatar>

      <div>
        <p className="header-font">{user.username}</p>
        <p className="body-font">{user.role}</p>
      </div>

      <span className="dollar-info">
        {Number(dolarValue)?.toFixed?.(2)} $        
        <Button onClick={updateDollar} >
          <UpdateIcon className="reload-dolar-icon"/>
        </Button>
      </span>
      
      <Button onClick={onOpenSettings} className="open-settings-btn">
        <SettingsIcon className="setting-icon" />
      </Button>

      <SettingModal visible={openSettings} setVisible={setOpenSettings} />
    </header>
  );
};

export default Header;
