// import { DataTable } from "primereact/datatable";
// import "./UserManagement.css";
// import { Column } from "primereact/column";
// import TextField from "@mui/material/TextField";

// const UserManagement = ({ mode = "new" }) => {

//     const header = (
//       <div className="product-table-header">
//         {addButton}
//         <TextField
//           variant="outlined"
//           size="small"
//           placeholder={t("Search")}
//           value={globalFilter}
//           onChange={(e) => setGlobalFilter(e.target.value)}
//         />
//       </div>
//     );

//   return <div className="user-management">

//      <DataTable
//           className="product-table"
//           paginator
//           rows={10}
//           paginatorTemplate={{
//             layout: "PrevPageLink CurrentPageReport NextPageLink",
//             PrevPageLink: (options) => (
//               <Button {...options}>
//                 <ArrowBackIcon />
//               </Button>
//             ),
//             NextPageLink: (options) => (
//               <Button {...options}>
//                 <ArrowForwardIcon />
//               </Button>
//             ),
//           }}
//           currentPageReportTemplate="{first} to {last} of {totalRecords}"
//           value={products}
//           header={header}
//           globalFilter={globalFilter}
//           onRowClick={onRowClick}
//           showGridlines
//         ></DataTable>
//   </div>;
// };

// export default UserManagement;
