import { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import useGlobalState from "../../actions/useGlobalState";
import useAPI from "../../actions/useAPI";
import EditOrderModal from "./EditOrderModal";
import { PAYMENT_TYPES } from "../../contants";
import TextField from "@mui/material/TextField";
import { format } from "date-fns";
import "./History.css";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardIos";
import Button from "@mui/material/Button";

const History = () => {
  const { updateOrder } = useAPI();
  const [openEditOrderModal, setOpenEditOrderModal] = useState("");
  const [dataidx, setDataIdx] = useState(null);
  const [paymentInf, setPaymentInf] = useState({ paymentType: PAYMENT_TYPES[0], paymentId: "" });
  const { t, orders } = useGlobalState();
  const [globalFilter, setGlobalFilter] = useState("");

  const onPayingDetailsSubmit = async () => {
    if (!paymentInf.paymentType || (paymentInf.paymentType === "pagoMovil" && !paymentInf.paymentId)) return;
    const resp = await updateOrder({ ...paymentInf, isPaid: true }, orders[dataidx]._id);
    resp;
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
        <Column field="total" header={t("total")} />
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
      />
    </div>
  );
};

export default History;
