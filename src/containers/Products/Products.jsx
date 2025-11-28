import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField"; // <-- add this
import "./Products.css";
import useGlobalState from "../../actions/useGlobalState";
import { useState } from "react";
import AddProductModal from "./AddProductModal";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import useAPI from "../../actions/useAPI";

const initialState = {
  name: "",
  price: "",
  unit: "kg",
  productType: "vegetable",
};

const Products = () => {
  const [data, setData] = useState(initialState);
  const { t, products } = useGlobalState();
  const [openAddProductModal, setOpenAddProductModal] = useState(false);
  const [modalMode, setModalMode] = useState("");
  const { deleteProduct } = useAPI();

  const [globalFilter, setGlobalFilter] = useState("");

  const addButton = (
    <Button onClick={() => setOpenAddProductModal(true)} variant="contained">
      {t("AddnewProduct")}
    </Button>
  );

  const actionTemplate = (rowData) => (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <IconButton
        color="primary"
        size="small"
        onClick={() => {
          setData(rowData);
          setModalMode("edit");
          setOpenAddProductModal(true);
        }}
      >
        <EditIcon />
      </IconButton>
      <IconButton color="error" size="small" onClick={() => deleteProduct(rowData)}>
        <DeleteIcon />
      </IconButton>
    </div>
  );

  // 🔧 custom header with search bar + add button
  const header = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      {addButton}
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
    <div>
      {products?.length > 0 ? (
        <DataTable value={products} header={header} globalFilter={globalFilter} filterDisplay="row" showGridlines>
          <Column field="name" header={t("name")} />
          <Column field="productType" header={t("productType")} />
          <Column field="price" header={t("price")} />
          <Column field="cost" header={t("cost")} />
          <Column header={t("action")} body={actionTemplate} />
        </DataTable>
      ) : (
        addButton
      )}
      <AddProductModal
        data={data}
        setData={setData}
        initialState={initialState}
        mode={modalMode}
        visible={openAddProductModal}
        setVisible={setOpenAddProductModal}
      />
    </div>
  );
};

export default Products;
