import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import useGlobalState from "../../actions/useGlobalState";
import Button from "@mui/material/Button";
import useAPI from "../../actions/useAPI";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import CancelIcon from "@mui/icons-material/Cancel";

const AddProductModal = ({ visible = false, setVisible = () => {}, mode = "", data, setData, initialState }) => {
  const { user, t, showMessage } = useGlobalState();
  const { onCreateProduct, updateProduct, deleteProduct } = useAPI();
  const resetState = () => setData(() => initialState);

  const onSave = async () => {
    if (!data.price) return showMessage(t("errorMsgs.priceMissing"), "warn");
    if (!data.name) return showMessage(t("errorMsgs.nameMissing"), "warn");

    const updatedProduct = { ...data, author: user.id || user._id };
    const resp =
      mode === "edit"
        ? await updateProduct(updatedProduct)
        : await onCreateProduct({ ...data, author: user.id || user._id });
    if (resp) {
      showMessage(t("productSaved"), "success");
      setVisible(false);
      resetState();
    }
  };

  const onClose = () => {
    setVisible(false);
    resetState();
  };

  const onDelete = async () => {
    const resp = await deleteProduct(data);
    if (resp) {
      resetState();
      showMessage(t("productDeleted"), "success");
      setVisible(false);
    }
  };
  return (
    <Dialog open={visible} onClose={onClose}>
      <div className="add-product-modal">
        <div className="add-product-modal-header">
          <p>{t("addProduct")}</p>
          <CancelIcon onClick={onClose} sx={{ height: "30px", width: "30px" }} />
        </div>

        <TextField label={t("name")} value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />

        <TextField
          label={t("price")}
          type="number"
          value={data.price}
          onChange={(e) => setData({ ...data, price: e.target.value })}
        />

        <Select value={data.unit} onChange={(e) => setData({ ...data, unit: e.target.value })} displayEmpty>
          <MenuItem value={"kg"}>{t("kg")}</MenuItem>
          <MenuItem value={"unit"}>{t("unit")}</MenuItem>
        </Select>

        <Select
          value={data.productType}
          onChange={(e) => setData({ ...data, productType: e.target.value })}
          displayEmpty
        >
          <MenuItem value={"vegetable"}>{t("vegetable")}</MenuItem>
        </Select>

        {user?.permissions?.manageCost && (
          <TextField
            label={t("cost")}
            type="number"
            value={data.cost}
            onChange={(e) => setData({ ...data, cost: e.target.value })}
          />
        )}
        <div className="add-product-modal-actions">
          <Button onClick={onDelete} color="error" variant="contained" startIcon={<DeleteIcon />}>
            {t("delete")}
          </Button>
          <Button endIcon={<DoneIcon />} color="success" variant="contained" onClick={onSave}>
            {t("accept")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default AddProductModal;
