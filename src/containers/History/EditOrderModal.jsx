import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import useGlobalState from "../../actions/useGlobalState";
import { PAYMENT_TYPES } from "../../constants";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import CancelIcon from "@mui/icons-material/Cancel";
import { format } from "date-fns";
import { addDots, calculate } from "../../utils/numberFormat";
import { useState } from "react";
import ShareIcon from "@mui/icons-material/Share";

const EditOrderModal = ({
  visible = false,
  onSave = () => {},
  onDelete = () => {},
  setVisible = () => {},
  t = () => {},
  data = {},
  setData = () => {},
  paymentInf = {},
  setPaymentInf = () => {},
}) => {
  const { user, productsWithDeleted, setOrderType, setNewOrder, setView, showMessage, getConvertion, clients } =
    useGlobalState();
  const [loading, setIsloading] = useState(false);
  const onClose = () => {
    setData(null);
    setVisible(false);
    setIsloading(false);
  };

  if (!data?.products) return;

  const dateFormat = (date) => {
    const dateObj = new Date(date);

    return format(dateObj, "yyyy-MM-dd hh:mm a");
  };

  const onDeleteOrder = async () => {
    setIsloading(true);
    const resp = await onDelete();
    if (resp) {
      onClose();
    }
    setIsloading(false);
  };
  const onSaveOrderModal = async () => {
    setIsloading(true);
    let resp = true;
    if (!data.isPaid) {
      resp = await onSave();
    }
    setIsloading(false);
    resp && onClose();
  };

  const onEditOrder = () => {
    const orderClient = clients.find((client) => client._id === data.clientId);
    const orderFormat = {
      paymentType: data.paymentType,
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      isPaid: data.isPaid,
      paymentId: data.paymentId || "",
      _id: data._id,
      products: data.products.map((pro) => {
        const productObject = productsWithDeleted.find((prod) => prod._id === pro.productId) || {};
        const test = {
          unit: productObject?.unit,
          quantity: pro.quantity,
          name: productObject?.name,
          product: { ...productObject, label: productObject?.name },
        };
        return test;
      }),
    };
    orderClient && (orderFormat.ci = orderClient.ci);
    setNewOrder(orderFormat);
    setView("addOrder");
    setOrderType("edit");
  };

  const handleCopy = async () => {
    try {
      const productLines = data.products.map((orderedProduct) => {
        const product = productsWithDeleted.find((p) => p._id === orderedProduct.productId);
        if (!product) return ``;
        const isCurrDollar = orderedProduct.currencyAt === "usd";
        const pricedAtPro = orderedProduct.pricedAt;
        const pricedAtBs = isCurrDollar ? getConvertion(pricedAtPro, "toBs") : pricedAtPro;
        const lineTotalBs = calculate("multiply", pricedAtBs, orderedProduct.quantity);

        return `* ${product.name} - ${orderedProduct.quantity}${product.unit} -> ${addDots(lineTotalBs)}Bs`;
      });

      const clientInfo = `🛒 Gracias por tu compra en Brotez. Aquí están los detalles de tu pedido:`;
      const header = `Fecha: ${dateFormat(data.createdAt)}`;
      const clientName = data?.clientName ? `Cliente: ${data.clientName}` : "";

      const isDollar = data?.currency === "usd";
      const totalBs = isDollar ? getConvertion(data.total, "toBs") : data.total;
      const totalDollar = isDollar ? data.total : getConvertion(data.total, "toDollar");

      const total = `Total: ${addDots(totalBs)} Bs \n$ref: ${addDots(totalDollar)}$`;

      const text = `${clientInfo}\n\n${header}\n${clientName}\n\nProductos:\n${productLines.join("\n")}\n\n${total}`;

      await navigator.clipboard.writeText(text);
      showMessage(t("orderCopied"), "success");
    } catch (err) {
      console.error("Failed to copy: ", err);
      showMessage(t("copyFailed"), "error");
    }
  };

  function ProductTable() {
    const tableData =
      data?.products?.map((orderedProduct) => {
        const ordProId = orderedProduct.productId;
        const product = productsWithDeleted.find((pro) => pro._id === ordProId);

        if (!product) {
          return {
            id: ordProId,
            name: "not-found",
            price: "0",
            quantity: "0",
          };
        }

        const isCurrDollar = orderedProduct.currencyAt === "usd";
        const pricedAtPro = orderedProduct.pricedAt;
        const pricedAt = isCurrDollar ? getConvertion(pricedAtPro, "toBs") : pricedAtPro;
        const producctDollarPrice = isCurrDollar ? pricedAtPro : getConvertion(pricedAtPro, "toDollar").toFixed(2);

        const quantityFormat = `${orderedProduct.quantity}${product.unit} x ${producctDollarPrice}$/${product.unit}`;
        const price = calculate("multiply", pricedAt, orderedProduct.quantity);
        return {
          id: ordProId,
          name: product.name + (product?.isDeleted ? " (D)" : ""),
          price,
          quantity: quantityFormat,
        };
      }) ?? [];

    const formatAddDecimals = (rowData) => {
      const value = rowData.price;
      return addDots(value) + "/Bs";
    };

    return (
      <DataTable className="edit-order-data-table" showGridlines value={tableData}>
        <Column field="name" header={t("name")} />
        <Column field="quantity" header={t("quantity")} />
        <Column field="price" body={formatAddDecimals} header={t("price")} />
      </DataTable>
    );
  }

  const getTotalLabels = () => {
    const total = data?.total;
    const isDollar = data?.currency === "usd";
    const totalBs = isDollar ? getConvertion(total, "toBs") : total;
    const totalDollar = isDollar ? total : getConvertion(total, "toDollar");

    return (
      <>
        <p>{addDots(totalDollar || 0)}/$</p>
        <p>{addDots(totalBs)}/Bs</p>
      </>
    );
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
      <div className="edit-order-modal">
        <div className="edit-order-modal-header">
          <ShareIcon onClick={handleCopy} sx={{ height: "30px", width: "30px" }} />
          <p className="edit-order-modal-title">{data.isPaid ? t("viewOrder") : t("editOrder")}</p>
          <CancelIcon onClick={onClose} sx={{ height: "30px", width: "30px" }} />
        </div>
        <div className="product-list-container">{ProductTable({ data, productsWithDeleted, t })}</div>
        <div className="user-and-payment-info">
          <div className="product-info">
            <span className="product-info-total">
              <h1>{t("total")}:</h1>
              {getTotalLabels()}
            </span>
            <span>
              <h1>{t("author")}:</h1>
              <p>{data?.author?.username}</p>
            </span>
            <span>
              <h1>{t("createdAt")}:</h1>
              <p>{data?.createdAt && dateFormat(data?.createdAt)}</p>
            </span>
            <span>
              <h1>{t("isDelivered")}:</h1>
              <p>{data?.isDelivered ? t("yes") : t("no")}</p>
            </span>
            <span>
              <h1>{t("orderId")}:</h1>
              <p>{data?.orderId}</p>
            </span>
            {data?.clientName && (
              <span>
                <h1>{t("clientName")}:</h1>
                <p>{data?.clientName}</p>
              </span>
            )}
            {data?.clientPhone && (
              <span>
                <h1>{t("clientPhone")}:</h1>
                <a target="_blank" href={"https://wa.me/+58" + (data?.clientPhone || "").substring(1)}>
                  {data?.clientPhone}
                </a>
              </span>
            )}
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
            </div>
          )}
          <div className="history-modal-action-btns">
            {user?.permissions?.deleteOrder && (
              <Button
                loading={loading}
                disabled={loading}
                size="small"
                color="error"
                variant="contained"
                onClick={onDeleteOrder}
              >
                {t("delete")}
              </Button>
            )}

            <Button
              size="small"
              color="warning"
              loading={loading}
              disabled={loading}
              variant="contained"
              onClick={onEditOrder}
            >
              {t("edit")}
            </Button>
            <Button size="small" loading={loading} disabled={loading} variant="contained" onClick={onSaveOrderModal}>
              {t("save")}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default EditOrderModal;
