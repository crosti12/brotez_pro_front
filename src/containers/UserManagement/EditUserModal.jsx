import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import "./UserManagement.css";
import CancelIcon from "@mui/icons-material/Cancel";
import { useTranslation } from "react-i18next";

function flattenObject(obj, parentKey = "") {
  let result = {};

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const newKey = parentKey ? `${parentKey}.${key}` : key;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = Array.isArray(value) ? JSON.stringify(value) : String(value);
    }
  }

  return result;
}

const EditUserModal = ({ visible, onClose, data = {} }) => {
  const flatData = flattenObject(data);
  const { t } = useTranslation();
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
      <div className="user-management-modal-header">
        <p className="user-management-modal-title">{t("editUserModal")}</p>
        <CancelIcon onClick={onClose} sx={{ height: "30px", width: "30px" }} />
      </div>
      <div>
        <div className="edit-user-modal">
          {Object.keys(flatData).map((key) => (
            <TextField size="small" key={key} label={key} disabled={true} defaultValue={flatData[key]} />
          ))}
        </div>
      </div>
    </Dialog>
  );
};

export default EditUserModal;
