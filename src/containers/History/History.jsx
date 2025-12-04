import { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import useGlobalState from "../../actions/useGlobalState";
import useAPI from "../../actions/useAPI";
import EditOrderModal from "./EditOrderModal";
import { PAYMENT_TYPES } from "../../constants";
import TextField from "@mui/material/TextField";
import { format } from "date-fns";
import "./History.css";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardIos";
import Button from "@mui/material/Button";

const History = () => {
  const { updateOrder, deleteOrder } = useAPI();
  const [openEditOrderModal, setOpenEditOrderModal] = useState("");
  const [dataidx, setDataIdx] = useState(null);
  const [paymentInf, setPaymentInf] = useState({ paymentType: PAYMENT_TYPES[0], paymentId: "" });
  const { t, orders, showMessage } = useGlobalState();
  const [globalFilter, setGlobalFilter] = useState("");

  const onPayingDetailsSubmit = async () => {
    if (!paymentInf.paymentType || (paymentInf.paymentType === "pagoMovil" && !paymentInf.paymentId)) {
      showMessage(t("errorMsgs.referenceFieldMissing"), "warn");
      return false;
    }
    const resp = await updateOrder({ ...paymentInf, isPaid: true }, orders[dataidx]._id);
    if (resp) showMessage(t("paymentRegistered"), "success");
    return resp;
  };

  const onDelete = async () => {
    const resp = await deleteOrder(orders[dataidx]._id);
    if (resp) showMessage(t("orderDeleted"), "success");
    else showMessage(t("orderNotDeleted"), "warn");
    return resp;
  };

  const header = (
    <div className="product-table-header">
      <TextField
        variant="outlined"
        size="small"
        placeholder={t("Search")}
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
      />
    </div>
  );

  const dateFormat = (rowData) => {
    const date = new Date(rowData.createdAt);

    return format(date, "yyyy-MM-dd HH:mm a");
  };
  const onRowclik = (rowData) => {
    setDataIdx(rowData.index);
    setOpenEditOrderModal(true);
  };

  const statusTemplate = (rowData) => (
    <span style={{ color: rowData.isPaid ? "green" : "#a3a107" }}>{rowData.isPaid ? t("paid") : t("pending")}</span>
  );

  return (
    <div className="history-main">
      <DataTable
        className="order-data-table"
        header={header}
        onRowClick={onRowclik}
        showGridlines={true}
        value={orders}
        globalFilter={globalFilter}
        paginator
        rows={8}
        paginatorTemplate={{
          layout: "PrevPageLink CurrentPageReport NextPageLink",
          PrevPageLink: (options) => (
            <Button {...options}>
              <ArrowBackIcon />
            </Button>
          ),
          NextPageLink: (options) => (
            <Button {...options}>
              <ArrowForwardIcon />
            </Button>
          ),
        }}
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
      >
        <Column field="createdAt" dataType="date" body={dateFormat} header={t("date")} />
        <Column field="author.username" header={t("author")} />
        <Column
          field="total"
          body={(rowData) => <div className="history-total-ellipsis">{rowData.total}</div>}
          header={t("total")}
        />
        <Column field="isPaid" body={statusTemplate} header={t("status")} />
      </DataTable>

      <EditOrderModal
        visible={openEditOrderModal}
        data={orders[dataidx]}
        setData={setDataIdx}
        paymentInf={paymentInf}
        setPaymentInf={setPaymentInf}
        t={t}
        onSave={onPayingDetailsSubmit}
        setVisible={setOpenEditOrderModal}
        onDelete={onDelete}
      />
    </div>
  );
};

export default History;
