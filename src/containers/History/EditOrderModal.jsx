import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import useGlobalState from "../../actions/useGlobalState";
import { PAYMENT_TYPES } from "../../contants";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import CancelIcon from "@mui/icons-material/Cancel";
import { format } from "date-fns";
import { addDots } from "../../utils/numberFormat";

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
  const dateFormat = (date) => {
    const dateObj = new Date(date);

    return format(dateObj, "yyyy-MM-dd HH:mm a");
  };

  function ProductTable() {
    const tableData =
      data?.products?.map((orderedProduct) => {
        const ordProId = orderedProduct.productId;
        const product = products.find((pro) => pro._id === ordProId);

        if (!product) {
          return {
            id: ordProId,
            name: "-",
            pricedAt: "-",
            quantity: "-",
          };
        }

        return {
          id: ordProId,
          name: product.name,
          pricedAt: orderedProduct.pricedAt,
          quantity: `${orderedProduct.quantity} ${product.unit}`,
        };
      }) ?? [];
    const formatAddDecimals = (rowData) => addDots(rowData?.pricedAt || 0) + "/Bs";
    return (
      <DataTable className="edit-order-data-table" showGridlines value={tableData}>
        <Column field="name" header={t("name")} />
        <Column field="quantity" header={t("quantity")} />
        <Column field="pricedAt" body={formatAddDecimals} header={t("pricedAt")} />
      </DataTable>
    );
  }

  return (
    <Dialog open={visible} onClose={onClose}>
      <div className="edit-order-modal">
        <div className="edit-order-modal-header">
          <p className="edit-order-modal-title">{t("editOrder")}</p>
          <CancelIcon onClick={onClose} sx={{ height: "30px", width: "30px" }} />
        </div>
        <div className="product-list-container">{ProductTable({ data, products, t })}</div>
        <div className="user-and-payment-info">
          <div className="product-info">
            <span>
              <h1>{t("author")}:</h1>
              <p>{data?.author?.username}</p>
            </span>
            <span>
              <h1>{t("createdAt")}:</h1>
              <p>{data?.createdAt && dateFormat(data?.createdAt)}</p>
            </span>
            <span>
              <h1>{t("total")}:</h1>
              <p>{addDots(data?.total || 0)}/Bs</p>
            </span>
            <span>
              <h1>{t("isDelivered")}:</h1>
              <p>{data?.isDelivered ? t("yes") : t("no")}</p>
            </span>
            <span>
              <h1>{t("orderId")}:</h1>
              <p>{data?.orderId}</p>
            </span>
            <span>
              <h1>{t("clientName")}:</h1>
              <p>{data?.clientName}</p>
            </span>
            <span>
              <h1>{t("clientPhone")}:</h1>
              <p>{data?.clientPhone}</p>
            </span>
            {data.isPaid && (
              <>
                {data?.paymentId && (
                  <span>
                    <h1>{t("paymentId")}:</h1>
                    <p>{data?.paymentId}</p>
                  </span>
                )}
                <span>
                  <h1>{t("paymentType")}:</h1>
                  <p>{data?.paymentType}</p>
                </span>
              </>
            )}
          </div>

          {!data.isPaid && (
            <div className="input-payment">
              <div className="flex gap-8">
                <Select
                  size="small"
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
                    size="small"
                    label={t("reference")}
                    onChange={(e) => setPaymentInf({ ...paymentInf, paymentId: e.target.value })}
                  />
                )}
              </div>

              <Button size="small" variant="contained" onClick={onSave}>
                {t("save")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default EditOrderModal;
