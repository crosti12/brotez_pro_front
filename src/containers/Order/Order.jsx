import { useCallback, useRef, useState } from "react";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import { useTranslation } from "react-i18next";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import AddCircle from "@mui/icons-material/AddCircle";
import AddProductModal from "./AddOrderedProductModal";
import { formatDigits, sumCommaStrings } from "../../utils/numberFormat";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import "./Order.css";
import { Button } from "@mui/material";
import useAPI from "../../actions/useAPI";
import useGlobalState from "../../actions/useGlobalState";
import { PAYMENT_TYPES } from "../../contants";

const Order = () => {
  const { t } = useTranslation();
  const [openAddModal, setOpenAddModal] = useState(false);
  const { createOrder } = useAPI();
  const { user, setNewOrder: setOrder, newOrder: order, showMessage } = useGlobalState();
  const totalPrice = useRef(null);

  const localProducts = order.products || [];
  const setLocalProducts = (val) => setOrder({ ...order, products: val });

  const onInputChange = (key, val) => setOrder({ ...order, [key]: val });

  const moveCursorToEnd = useCallback((el) => {
    const length = el.value.length;
    el.setSelectionRange(length, length);
  }, []);

  const onDeleteProduct = (e, index) => {
    e.stopPropagation();
    const newProducts = [...localProducts];
    newProducts.splice(index, 1);
    setLocalProducts(newProducts);
  };

  const onProductChange = (value, field, index) => {
    const newProducts = [...localProducts];
    newProducts[index] = { ...localProducts[index], [field]: value };
    setLocalProducts(newProducts);
  };

  const onAddItem = (newItem) => {
    const existingItem = localProducts.find((item) => item.product._id === newItem.product._id);

    if (existingItem) {
      return setLocalProducts(
        localProducts.map((item) => {
          if (item.name === newItem.name) {
            return {
              ...newItem,
              quantity: sumCommaStrings(item.quantity, newItem.quantity),
            };
          }
          return item;
        })
      );
    }

    setLocalProducts([...localProducts, newItem]);
  };

  const onFormatNumber = (value) => {
    const newVal = formatDigits(value);
    return newVal;
  };
  const onClear = () => {
    setOrder({ paymentType: PAYMENT_TYPES[0], clientName: "", clientPhone: "", isPaid: true });
  };
  const onSave = async () => {
    const total = totalPrice.current.id;
    const body = {
      ...order,
      products: localProducts.map((pro) => ({ productId: pro.product._id, quantity: pro.quantity })),
      author: user.id,
      total,
    };
    if (body.isPaid) {
      delete body.clientPhone;
      delete body.clientName;
    } else {
      delete body.paymentId;
    }
    let message = "";
    if (!body?.products?.length > 0) message = t("errorMsgs.productsMissing");
    else if (body.isPaid && !body.paymentId) message = t("errorMsgs.referenceFieldMissing");
    else if (!body.isPaid && !body.clientPhone) message = t("errorMsgs.clientPhoneMissing");
    else if (!body.isPaid && !body.clientName) message = t("errorMsgs.clientNameMissing");

    if (message) return showMessage(message, "warn");

    const resp = await createOrder(body);
    if (resp) {
      showMessage(t("successCreated"), "success");
      onClear();
    }
  };

  const getproducList = () => {
    const result = localProducts.reduce(
      (acc, orderProduct, index) => {
        const itemPrice = parseInt(orderProduct.product.price * parseFloat(orderProduct.quantity.replace(",", ".")));

        const itemUi = (
          <Accordion key={orderProduct.name}>
            <AccordionSummary expandIcon={<HighlightOffIcon onClick={(e) => onDeleteProduct(e, index)} />}>
              <span>{orderProduct.name}</span>
              <span>{orderProduct.quantity}</span>
              <span>{itemPrice}</span>
            </AccordionSummary>

            <AccordionDetails>
              {orderProduct.unit === "kg" ? (
                <TextField
                  value={orderProduct.quantity}
                  inputMode="numeric"
                  onChange={(e) => onProductChange(onFormatNumber(e.target.value), "quantity", index)}
                  label={t("quantity")}
                  onFocus={(e) => moveCursorToEnd(e.target)}
                  onClick={(e) => moveCursorToEnd(e.target)}
                />
              ) : (
                <TextField
                  value={orderProduct.quantity}
                  type="number"
                  onChange={(e) => onProductChange(e.target.value, "quantity", index)}
                  label={t("quantity")}
                />
              )}

              <TextField value={orderProduct?.product?.price} label={t("price")} />
            </AccordionDetails>
          </Accordion>
        );
        acc.productsUi.push(itemUi);
        acc.total += itemPrice;
        return acc;
      },
      { productsUi: [], total: 0 }
    );
    return (
      <>
        {result.productsUi}
        <span ref={totalPrice} id={result.total}>
          Total: {result.total}
        </span>
      </>
    );
  };

  return (
    <div className="new-order">
      <div className="new-order__product-add">
        <span>{t("product")}</span>
        <AddCircle onClick={() => setOpenAddModal(true)} />
      </div>

      <div className="new-order__product-list">{getproducList()}</div>
      <div className="new-order__client-data">
        <div className="flex">
          <h1>{t("isPaid")}</h1>
          <Switch
            checked={order.isPaid}
            key={order.isPaid ? "news" : "asd"}
            onChange={() => onInputChange("isPaid", !order.isPaid)}
          />
        </div>
        <div className="flex-col">
          {!order.isPaid ? (
            <>
              <TextField
                value={order.clientName}
                onChange={(e) => onInputChange("clientName", e.target.value)}
                label={t("clientName")}
              />
              <TextField
                value={order.clientPhone}
                type="number"
                onChange={(e) => onInputChange("clientPhone", e.target.value)}
                label={t("clientPhone")}
                id="clientphone"
                key={order.isPaid ? "newKEt" : "newOrkey"}
              />
            </>
          ) : (
            <>
              <Select
                value={order.paymentType}
                onChange={(e) => onInputChange("paymentType", e.target.value)}
                label={t("paymentType")}
              >
                {PAYMENT_TYPES.map((payT) => (
                  <MenuItem value={payT}>{t(payT)}</MenuItem>
                ))}
              </Select>
              {order.paymentType === "pagoMovil" && (
                <TextField
                  id="reference"
                  onChange={(e) => onInputChange("paymentId", e.target.value)}
                  label={t("reference")}
                  value={order?.paymentId || ""}
                />
              )}
            </>
          )}
        </div>

        <Button variant="outlined" onClick={onClear} color="error">
          {t("reset")}
        </Button>
        <Button variant="contained" onClick={onSave}>
          {t("save")}
        </Button>
      </div>

      <AddProductModal
        visible={openAddModal}
        t={t}
        moveCursorToEnd={moveCursorToEnd}
        onAdditem={onAddItem}
        title={t("addProduct")}
        setVisible={setOpenAddModal}
      />
    </div>
  );
};

export default Order;
