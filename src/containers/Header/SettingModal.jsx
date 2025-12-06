import { Dialog } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import Button from "@mui/material/Button";
import useGlobalState from "../../actions/useGlobalState";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import useAPI from "../../actions/useAPI";

const SettingModal = ({ visible = false, setVisible = () => {} }) => {
  const onClose = () => setVisible(false);
  const { setIsLoggedIn, user } = useGlobalState();
  const { updateUser } = useAPI();
  const { t } = useTranslation();
  const [loading, setIsloading] = useState(false);
  const [state, setState] = useState(user);

  const clearAllLocalStorage = () => {
    setIsLoggedIn(false);
    localStorage.clear();
    location.reload();
  };

  const onSaveSettings = async () => {
    setIsloading(true);
    const resp = await updateUser(state, user._id || user.id);
    if (resp) setVisible(false);
    setIsloading(false);
  };

  return (
    <Dialog
      PaperProps={{
        sx: {
          margin: 0,
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
        },
      }}
      open={visible}
      onClose={onClose}
    >
      <div className="setting-modal">
        <div className="setting-moda-header">
          <p>{t("settings")}</p>
          <span>
            <CancelIcon onClick={onClose} sx={{ height: "30px", width: "30px" }} />
          </span>
        </div>
        <div className="setting-modal-setup-form">
          <div className="setup-row">
            <InputLabel id="user-language">{t("language")}</InputLabel>
            <Select
              size="small"
              onChange={(e) => setState((prev) => ({ ...prev, language: e.target.value }))}
              labelId="user-language"
              value={state.language}
            >
              <MenuItem value={"es"}>{t("es")}</MenuItem>
              <MenuItem value={"en"}>{t("en")}</MenuItem>
            </Select>
          </div>
          {user?.permissions?.changeUsername && (
            <div className="setup-row">
              <InputLabel id="user-language">{t("username")}</InputLabel>
              <TextField
                onChange={(e) => setState((prev) => ({ ...prev, username: e.target.value }))}
                labelId="user-language"
                value={state.username}
              />
            </div>
          )}
        </div>
        <div className="seting-modal-footer">
          <Button
            size="small"
            color="error"
            loading={loading}
            disabled={loading}
            variant="contained"
            onClick={clearAllLocalStorage}
          >
            {t("reset")}
          </Button>
          <Button
            size="small"
            color="success"
            loading={loading}
            disabled={loading}
            variant="contained"
            onClick={onSaveSettings}
          >
            {t("save")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default SettingModal;
