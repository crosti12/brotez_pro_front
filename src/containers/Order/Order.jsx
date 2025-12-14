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
import { addDots, calculate, formatDigits, sumCommaStrings } from "../../utils/numberFormat";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import "./Order.css";
import { Button } from "@mui/material";
import useAPI from "../../actions/useAPI";
import useGlobalState from "../../actions/useGlobalState";
import { PAYMENT_TYPES } from "../../constants";

const Order = () => {
  const { t } = useTranslation();
  const [openAddModal, setOpenAddModal] = useState(false);
  const { createOrder, updateOrder } = useAPI();

  const {
    user,
    setNewOrder: setOrder,
    newOrder: order,
    showMessage,
    products,
    orderType,
    setOrderType,
    productsWithDeleted,
    getConvertion,
    clients,
  } = useGlobalState();

  const totalPrice = useRef(null);
  const [loading, setIsloading] = useState(false);

  const localProducts = order.products || [];
  const setLocalProducts = (val) => setOrder({ ...order, products: val });
  const [disableClientInfo, setDisableClientInfo] = useState(false);
  const onInputChange = (key, val) => {
    setOrder({ ...order, [key]: val });
  };

  const moveCursorToEnd = useCallback((el) => {
    const length = el.value.length;
    el?.setSelectionRange?.(length, length);
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
    setOrder({ paymentType: PAYMENT_TYPES[0], clientName: "", clientPhone: "", isPaid: true, ci: "" });
    setOrderType("new");
    setDisableClientInfo(false);
  };

  const onSave = async () => {
    setIsloading(true);
    const total = getConvertion(totalPrice.current.id, "toDollar");
    const body = {
      ...order,
      products: localProducts
        .map((pro) => {
          const updatedProduct = products.find((product) => product._id === pro?.product?._id);
          return (
            pro.quantity && {
              productId: pro.product._id,
              quantity: pro.quantity,
              pricedAt: updatedProduct?.price,
              costAt: updatedProduct?.cost,
              currencyAt: updatedProduct?.currency,
            }
          );
        })
        .filter(Boolean),
      author: user.id,
      total: total,
      currency: "usd",
    };

    delete body._id;
    let message = "";
    if (!body?.products?.length > 0) message = t("errorMsgs.productsMissing");
    else if (body.isPaid && body.paymentType === "pagoMovil" && !body.paymentId)
      message = t("errorMsgs.referenceFieldMissing");
    else if (!body.isPaid && !body.clientName) message = t("errorMsgs.clientNameMissing");

    if (message) {
      setIsloading(false);
      return showMessage(message, "warn");
    }

    const resp = orderType === "new" ? await createOrder(body) : await updateOrder(body, order._id);
    if (resp) {
      orderType === "new" ? showMessage(t("successCreated"), "success") : showMessage(t("successUpdated"), "success");
      onClear();
    }
    setIsloading(false);
  };

  const getproductList = () => {
    const result = localProducts.reduce(
      (acc, orderProduct, index) => {
        const stateProduct = productsWithDeleted.find((pro) => pro._id === orderProduct.product._id);
        if (!stateProduct) return acc;
        const isCurrencyDollar = stateProduct.currency === "usd";
        const price = isCurrencyDollar ? getConvertion(stateProduct.price) : stateProduct.price;

        const sumResult = calculate("multiply", price, orderProduct.quantity);
        const orderProductPrice = !Number.isNaN(sumResult) ? sumResult : 0;

        const itemUi = (
          <Accordion key={orderProduct.name}>
            <AccordionSummary expandIcon={<HighlightOffIcon onClick={(e) => onDeleteProduct(e, index)} />}>
              <div className="ordered-product-details">
                <span className="ordered-product-detail-name">{orderProduct.name}:</span>
                <span className="flex">
                  <p>{orderProduct.quantity || 0}/</p>
                  <p>{t(orderProduct.unit)}</p>
                </span>
                <div className="flex-col">
                  <span>{addDots(orderProductPrice, 2)}/Bs</span>
                  <span className="order-product-dolar-price">
                    {getConvertion(orderProductPrice, isCurrencyDollar ? "toDollar" : "").toFixed(2)}/$
                  </span>
                </div>
              </div>
            </AccordionSummary>

            <AccordionDetails>
              <div className="product-edit-info">
                {orderProduct.unit === "kg" ? (
                  <TextField
                    value={parseFloat(orderProduct.quantity.replace(",", ".")).toFixed(3)}
                    inputMode="numeric"
                    type="number"
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
                  {t("price")}: {stateProduct?.price}/{t(stateProduct.currency)} x {t(stateProduct.unit)}
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
          <div>
            <span className="total-order-price-amount"> Total: {addDots(result.total)}</span> Bs
            <br />
            <span>{getConvertion(result.total, "toDollar").toFixed(2)}</span> $
          </div>
        </span>
      </>
    );
  };

  const onIdChange = async (e) => {
    const newClientId = e.target.value;
    let clientFound = null;
    const updateObjecT = { ...order, ci: newClientId };

    if (newClientId.length > 6) clientFound = clients.find((client) => client.ci === newClientId);

    if (clientFound) {
      setDisableClientInfo(true);
      updateObjecT.clientName = clientFound.name;
      updateObjecT.clientPhone = clientFound.phone;
    } else {
      setDisableClientInfo(false);
    }

    setOrder(updateObjecT);
  };

  return (
    <div className="new-order" key={products}>
      <div className="new-order__product-add">
        <span>{t("products")}</span>
        <Button endIcon={<AddCircle />} color="primary" variant="contained" onClick={() => setOpenAddModal(true)}>
          {t("add")}
        </Button>
      </div>

      <div className="new-order__product-list">{getproductList()}</div>
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
          <TextField
            size="small"
            type="number"
            value={order.ci}
            onChange={onIdChange}
            label={t("clientId")}
            className="client-name"
          />

          <>
            <TextField
              size="small"
              value={order.clientName}
              onChange={(e) => onInputChange("clientName", e.target.value)}
              label={!disableClientInfo && t("clientName")}
              className="client-name"
              disabled={disableClientInfo}
            />
            <TextField
              size="small"
              value={order.clientPhone}
              type="number"
              onChange={(e) => onInputChange("clientPhone", e.target.value)}
              label={!disableClientInfo && t("clientPhone")}
              id="clientphone"
              key={order.isPaid ? "newKEt" : "newOrkey"}
              disabled={disableClientInfo}
            />
          </>
          {order.isPaid && (
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
                  type="number"
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
          <Button variant="contained" loading={loading} disabled={loading} onClick={onSave}>
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
