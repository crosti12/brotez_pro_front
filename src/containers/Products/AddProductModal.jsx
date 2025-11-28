import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import useGlobalState from "../../actions/useGlobalState";
import Button from "@mui/material/Button";
import useAPI from "../../actions/useAPI";

const AddProductModal = ({ visible = false, setVisible = () => {}, mode = "", data, setData, initialState }) => {
  const { user, t } = useGlobalState();
  const { onCreateProduct, updateProduct } = useAPI();

  const isAllowed = user?.role === "admin" || user?.role === "developer";

  const resetState = () => setData(() => initialState);

  const onSave = async () => {
    const isInvalid = !data.price || !data.name;
    const updatedProduct = { ...data, author: user.id || user._id };
    if (!isInvalid) {
      mode === "edit"
        ? await updateProduct(updatedProduct)
        : await onCreateProduct({ ...data, author: user.id || user._id });
      setVisible(false);
      resetState();
    }
  };

  const onClose = () => {
    setVisible(false);
    resetState();
  };

  return (
    <Dialog open={visible} onClose={onClose}>
      <div className="add-product-modal">
        <p>{t("addProduct")}</p>

        <TextField label={t("name")} value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />

        <TextField
          label={t("price")}
          type="number"
          value={data.price}
          onChange={(e) => setData({ ...data, price: e.target.value })}
        />

        <Select value={data.unit} onChange={(e) => setData({ ...data, unit: e.target.value })} displayEmpty>
          <MenuItem value={"kg"}>{t("weight")}</MenuItem>
          <MenuItem value={"unit"}>{t("unit")}</MenuItem>
        </Select>

        <Select
          value={data.productType}
          onChange={(e) => setData({ ...data, productType: e.target.value })}
          displayEmpty
        >
          <MenuItem value={"vegetable"}>{t("vegetable")}</MenuItem>
        </Select>

        {isAllowed && (
          <TextField
            label={t("cost")}
            type="number"
            value={data.cost}
            onChange={(e) => setData({ ...data, cost: e.target.value })}
          />
        )}
        <Button onClick={onClose}>{t("close")}</Button>
        <Button onClick={onSave}>{t("accept")}</Button>
      </div>
    </Dialog>
  );
};

export default AddProductModal;
