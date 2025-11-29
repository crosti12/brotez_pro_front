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
import { addDots, formatDigits, sumCommaStrings } from "../../utils/numberFormat";
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
  const { user, setNewOrder: setOrder, newOrder: order, showMessage, products } = useGlobalState();
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
      products: localProducts
        .map((pro) => pro.quantity && { productId: pro.product._id, quantity: pro.quantity })
        .filter(Boolean),
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
    else if (body.isPaid && body.paymentType === "pagoMovil" && !body.paymentId)
      message = t("errorMsgs.referenceFieldMissing");
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
        const stateProduct = products.find((pro) => pro._id === orderProduct.product._id);
        if (!stateProduct) return;
        const sumResult = parseInt(stateProduct.price * parseFloat(orderProduct.quantity.replace(",", ".")));
        const orderProductPrice = !Number.isNaN(sumResult) ? sumResult : 0;

        const itemUi = (
          <Accordion key={orderProduct.name}>
            <AccordionSummary expandIcon={<HighlightOffIcon onClick={(e) => onDeleteProduct(e, index)} />}>
              <div className="ordered-product-details">
                <span>{orderProduct.name}: </span>
                <span className="flex">
                  <p>{orderProduct.quantity || 0}/</p>
                  <p>{t(orderProduct.unit)}</p>
                </span>
                <span>{addDots(orderProductPrice)}/Bs</span>
              </div>
            </AccordionSummary>

            <AccordionDetails>
              <div className="product-edit-info">
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
                <p>
                  {t("price")}: {stateProduct?.price}/Bs x {t(stateProduct.unit)}
                </p>
              </div>
            </AccordionDetails>
          </Accordion>
        );
        acc.productsUi.push(itemUi);
        !Number.isNaN(orderProductPrice) && (acc.total += orderProductPrice);
        return acc;
      },
      { productsUi: [], total: 0 }
    );

    return (
      <>
        {result.productsUi}
        <span className="total-order-price" ref={totalPrice} id={result.total}>
          Total: <span className="total-order-price-amount">{addDots(result.total)}</span> Bs
        </span>
      </>
    );
  };

  return (
    <div className="new-order" key={products}>
      <div className="new-order__product-add">
        <span>{t("products")}</span>
        <Button endIcon={<AddCircle />} color="primary" variant="contained" onClick={() => setOpenAddModal(true)}>
          {t("add")}
        </Button>
      </div>

      <div className="new-order__product-list">{getproducList()}</div>
      <div className="new-order__client-data">
        <div className="order-switches">
          <div className="order-switch" onClick={() => onInputChange("isPaid", !order.isPaid)}>
            <span className="ispaid-label">{t("isPaid")}</span>
            <Switch
              checked={order.isPaid}
              key={order.isPaid ? "news" : "asd"}
              onChange={() => onInputChange("isPaid", !order.isPaid)}
            />
          </div>
          <div className="order-switch" onClick={() => onInputChange("isDelivered", !order.isDelivered)}>
            <span className="ispaid-label">{t("isDelivered")}</span>
            <Switch
              checked={order.isDelivered || false}
              key={order.isDelivered ? "delivers" : "deliverss"}
              onChange={() => onInputChange("isDelivered", !order.isDelivered)}
            />
          </div>
        </div>
        <div className="order-payment-data">
          {!order.isPaid ? (
            <>
              <TextField
                size="small"
                value={order.clientName}
                onChange={(e) => onInputChange("clientName", e.target.value)}
                label={t("clientName")}
                className="client-name"
              />
              <TextField
                size="small"
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
                size="small"
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
                  size="small"
                  id="reference"
                  onChange={(e) => onInputChange("paymentId", e.target.value)}
                  label={t("reference")}
                  value={order?.paymentId || ""}
                />
              )}
            </>
          )}
        </div>

        <div className="order-action-buttons">
          <Button variant="outlined" onClick={onClear} color="error">
            {t("reset")}
          </Button>
          <Button variant="contained" onClick={onSave}>
            {t("save")}
          </Button>
        </div>
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
