import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField"; // <-- add this
import "./Products.css";
import useGlobalState from "../../actions/useGlobalState";
import { useState } from "react";
import AddProductModal from "./AddProductModal";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

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

  const [globalFilter, setGlobalFilter] = useState("");

  const addButton = (
    <Button className="add-product" onClick={() => setOpenAddProductModal(true)} variant="contained">
      {t("new")}
    </Button>
  );

  const onRowClick = (rowData) => {
    setData(rowData.data);
    setModalMode("edit");
    setOpenAddProductModal(true);
  };

  const header = (
    <div className="product-table-header">
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
    <div className="product-datatable">
      {products?.length > 0 ? (
        <DataTable value={products} header={header} globalFilter={globalFilter} onRowClick={onRowClick} showGridlines>
          <Column field="name" header={t("name")} />
          <Column field="productType" header={t("productType")} />
          <Column field="price" header={t("price")} />
          <Column field="cost" header={t("cost")} />
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
