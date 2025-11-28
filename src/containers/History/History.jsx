import { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import useGlobalState from "../../actions/useGlobalState";
import useAPI from "../../actions/useAPI";
import EditOrderModal from "./EditOrderModal";
import { PAYMENT_TYPES } from "../../contants";

const History = () => {
  const { updateOrder } = useAPI();
  const [openEditOrderModal, setOpenEditOrderModal] = useState("");
  const [dataidx, setDataIdx] = useState(null);
  const [paymentInf, setPaymentInf] = useState({ paymentType: PAYMENT_TYPES[0], paymentId: "" });
  const { t, orders } = useGlobalState();

  const onPayingDetailsSubmit = async () => {
    if (!paymentInf.paymentType || (paymentInf.paymentType === "pagoMovil" && !paymentInf.paymentId)) return;
    const resp = await updateOrder({ ...paymentInf, isPaid: true }, orders[dataidx]._id);
    resp;
  };

  const onRowclik = (rowData) => {
    setDataIdx(rowData.index);
    setOpenEditOrderModal(true);
  };

  const statusTemplate = (rowData) => (rowData.isPaid ? t("paid") : t("pending"));

  return (
    <div>
      <DataTable onRowClick={onRowclik} showGridlines={true} value={orders}>
        <Column field="orderId" header={t("id")} />
        <Column field="author.username" header={t("creator")} />
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
