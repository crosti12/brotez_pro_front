import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import useGlobalState from "../../actions/useGlobalState";
import { PAYMENT_TYPES } from "../../contants";

const EditOrderModal = ({
  visible = false,
  onSave = () => {},
  setVisible = () => {},
  t = () => {},
  data = {},
  setData = () => {},
  paymentInf = {},
  setPaymentInf = () => {},
}) => {
  const { products } = useGlobalState();
  const onClose = () => {
    setData(null);
    setVisible(false);
  };
  if (!data?.products) return;

  return (
    <Dialog open={visible} onClose={onClose}>
      <div className="edit-order-modal">
        <p>{t("editOrder")}</p>
        <div>
          {data?.products?.map?.((orderedProduct) => {
            const ordProId = orderedProduct.productId;
            const product = products.find((pro) => pro._id === ordProId);
            if (!product) return t("productNotFound") + " " + ordProId;

            return (
              <div>
                <span>
                  <h1>{t("name")}</h1>
                  <p>{product.name}</p>
                </span>
                <span>
                  <h1>{t("price")}</h1>
                  <p>{product.price}</p>
                </span>
                <span>
                  <h1>{t("quantity")}</h1>
                  <p>{orderedProduct.quantity + " " + product.unit}</p>
                </span>
              </div>
            );
          })}
        </div>
        <div>
          <span>
            <h1>t{"author"}</h1>
            <p>{data?.author?.username}</p>
          </span>
          <span>
            <h1>t{"createdAt"}</h1>
            <p>{data?.createdAt.split("T")[0]}</p>
          </span>
          <span>
            <h1>t{"total"}</h1>
            <p>{data?.total}</p>
          </span>
          {data.isPaid && (
            <>
              <span>
                <h1>t{"paymentId"}</h1>
                <p>{data?.paymentId}</p>
              </span>
              <span>
                <h1>t{"paymentType"}</h1>
                <p>{data?.paymentType}</p>
              </span>
            </>
          )}
        </div>

        {!data.isPaid && (
          <div>
            <Select
              onChange={(e) => setPaymentInf({ ...paymentInf, paymentType: e.target.value })}
              value={paymentInf.paymentType || PAYMENT_TYPES[0]}
              label={t("paymentType")}
            >
              {PAYMENT_TYPES.map((payT) => (
                <MenuItem value={payT}>{t(payT)}</MenuItem>
              ))}
            </Select>

            {(paymentInf.paymentType || PAYMENT_TYPES[0]) === "pagoMovil" && (
              <TextField
                label={t("reference")}
                onChange={(e) => setPaymentInf({ ...paymentInf, paymentId: e.target.value })}
              />
            )}

            <Button variant="contained" onClick={onSave}>
              {t("save")}
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default EditOrderModal;
