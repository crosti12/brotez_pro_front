import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { addDots } from "../../utils/numberFormat";

const DashboardTables = ({ products, t }) => {
  if (!products || products.length === 0) return null;
  const paginator = {
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
  };
  const productTable = (
    <DataTable
      className="best-sold-products-data-table"
      value={products}
      rows={4}
      paginator
      paginatorTemplate={paginator}
    >
      <Column field="product" header={t("product")} />
      <Column
        field="quantity"
        body={(rowData) =>
          (typeof rowData.quantity === "string" ? rowData.quantity : addDots(rowData.quantity)) + " " + rowData.unit
        }
        header={t("quantity")}
      />
      <Column field="profit" body={(rowData) => addDots(rowData.profit)} header={t("profit")} />
    </DataTable>
  );

  const userTable = (
    <DataTable
      className="best-sold-products-data-table"
      value={products}
      rows={4}
      paginator
      paginatorTemplate={paginator}
    >
      <Column />
      <Column />
      <Column />
    </DataTable>
  );

  return <div>{productTable}</div>;
};

export default DashboardTables;
