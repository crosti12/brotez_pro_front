import { DataTable } from "primereact/datatable";
import "./UserManagement.css";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import useGlobalState from "../../actions/useGlobalState";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardIos";
import { Column } from "primereact/column";
import EditUserModal from "./EditUserModal";

const UserManagement = ({ mode = "new" }) => {
  const { clients } = useGlobalState();
  const { t } = useTranslation();
  const [globalFilter, setGlobalFilter] = useState("");
  const [openAddProductModal, setOpenAddProductModal] = useState(false);
  const [modalData, setModalData] = useState({});

  const onRowClick = (rowData) => {
    setOpenAddProductModal(true);
    setModalData(rowData.data);
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

  return (
    <div className="user-management">
      <DataTable
        className="user-table"
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
        value={clients}
        header={header}
        globalFilter={globalFilter}
        onRowClick={onRowClick}
        showGridlines
      >
        <Column field="name" header={t("name")} />
        <Column field="phone" header={t("phone")} />
        <Column field="ci" header={t("ci")} />
      </DataTable>
      <EditUserModal visible={openAddProductModal} data={modalData} onClose={() => setOpenAddProductModal(false)} />
    </div>
  );
};

export default UserManagement;
