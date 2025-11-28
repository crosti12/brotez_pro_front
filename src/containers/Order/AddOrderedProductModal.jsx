import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";
import useGlobalState from "../../actions/useGlobalState";
import { useMemo, useState } from "react";
import { formatDigits } from "../../utils/numberFormat";

const initialState = { unit: "", quantity: "0,000", name: "", product: {} };

const AddOrderedProductModal = ({
  visible = false,
  onAdditem = () => {},
  moveCursorToEnd = () => {},
  setVisible = () => {},
  title = "",
  t = () => {},
}) => {
  const [data, setData] = useState(initialState);
  const { products } = useGlobalState();

  const onClose = () => {
    setData(initialState);
    setVisible(false);
  };
  const onFormatNumber = (e) => {
    const newVal = formatDigits(e.target.value);
    setData((prev) => ({ ...prev, quantity: newVal }));
  };

  const memoProducts = useMemo(() => products.map((ms) => ({ ...ms, label: ms.name })), [products]);

  const onProductChange = (e, value) => {
    setData((prev) => {
      const newProduct = value;
      return { ...prev, name: newProduct?.name || "", product: newProduct || {}, unit: newProduct?.unit || "" };
    });
  };

  return (
    <Dialog open={visible} onClose={onClose}>
      <div className="add-order-modal">
        <p>{title}</p>
        <div>
          <Autocomplete
            disablePortal
            className="select-dropdown"
            options={memoProducts}
            onChange={onProductChange}
            getOptionLabel={(prod) => prod.name}
            renderInput={(params) => (
              <TextField {...params} onChange={(e) => console.log(e.target.value)} label="name" />
            )}
          />
          <div className="flex">
            <TextField
              inputMode="numeric"
              value={data.quantity}
              onFocus={(e) => moveCursorToEnd(e.target)}
              onClick={(e) => moveCursorToEnd(e.target)}
              onChange={onFormatNumber}
            />
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={data.unit}
              label="Age"
              disabled={true}
              onChange={(e) => setData((prev) => ({ ...prev, unit: e.target.value }))}
            >
              <MenuItem value={"kg"}>Kg</MenuItem>
              <MenuItem value={"unit"}>{t("unit")}</MenuItem>
            </Select>
          </div>
        </div>
        <div className="flex gap-8 align-end">
          <Button
            onClick={() => {
              onAdditem(data);
              onClose();
            }}
            disabled={Object.entries(data).some(([key, val]) => initialState[key] === val)}
            variant="contained"
          >
            {t("save")}
          </Button>
          <Button onClick={onClose} variant="outlined">
            {t("cancel")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
export default AddOrderedProductModal;
