import { useMemo, useState } from "react";
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
import { Badge } from "primereact/badge";
const History = () => {
  const { updateOrder, deleteOrder } = useAPI();
  const [openEditOrderModal, setOpenEditOrderModal] = useState("");
  const [dataidx, setDataIdx] = useState(null);
  const [paymentInf, setPaymentInf] = useState({ paymentType: PAYMENT_TYPES[0], paymentId: "" });
  const { t, orders, showMessage } = useGlobalState();
  const [globalFilter, setGlobalFilter] = useState("");

  const sortedRows = useMemo(
    () =>
      [...orders]
        .map((order) => ({ ...order }))
        .sort((a, b) => {
          if (a.isPaid !== b.isPaid) {
            return a.isPaid ? 1 : -1;
          }
          return new Date(b.createdAt) - new Date(a.createdAt);
        }),
    [orders]
  );

  const onPayingDetailsSubmit = async () => {
    if (!paymentInf.paymentType || (paymentInf.paymentType === "pagoMovil" && !paymentInf.paymentId)) {
      showMessage(t("errorMsgs.referenceFieldMissing"), "warn");
      return false;
    }
    const resp = await updateOrder({ ...paymentInf, isPaid: true }, sortedRows[dataidx]._id);
    if (resp) showMessage(t("paymentRegistered"), "success");
    return resp;
  };

  const onDelete = async () => {
    const resp = await deleteOrder(sortedRows[dataidx]._id);
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

    return format(date, "MM-dd");
  };

  const onRowclik = (rowData) => {
    setDataIdx(rowData.index);
    setOpenEditOrderModal(true);
  };

  const statusTemplate = (rowData) => (
    <Badge severity={rowData.isPaid ? "success" : "warning"} style={{ width: "15px", height: "15px" }} />
  );
  const totalTemplate = (rowData) => <div className="history-total-ellipsis">{rowData.total}</div>;
  const clientTemplate = (rowData) => <div className="history-total-ellipsis">{rowData.clientName || "-"}</div>;

  return (
    <div className="history-main">
      <DataTable
        className="order-data-table"
        header={header}
        onRowClick={onRowclik}
        showGridlines={true}
        value={sortedRows}
        globalFilter={globalFilter}
        paginator
        rows={11}
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
        <Column field="clientName" body={clientTemplate} header={t("client")} />
        <Column field="total" body={totalTemplate} header={t("total")} />
        <Column field="isPaid" body={statusTemplate} header={t("status")} />
      </DataTable>

      <EditOrderModal
        visible={openEditOrderModal}
        data={sortedRows[dataidx]}
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
