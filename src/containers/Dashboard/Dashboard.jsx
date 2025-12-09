import { useState } from "react";
import "./Dashboard.css";
import { useTranslation } from "react-i18next";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { Calendar } from "primereact/calendar";
import useDataBreakDown from "./useDataBreakDown";
import { addDots } from "../../utils/numberFormat";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardIos";
import DashboardCharts from "./DashboardCharts";
import useGlobalState from "../../actions/useGlobalState";

const initialDate = localStorage.getItem("selectedDate") ? new Date(localStorage.getItem("selectedDate")) : null;
const initialSortBy = localStorage.getItem("sortBy") || "today";

const Dashboard = () => {
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const { getConvertion } = useGlobalState();
  const { t } = useTranslation();
  const result = useDataBreakDown({
    sortBy,
    selectedDate,
  });
  const {
    sellCount,
    expense,
    profit,
    productsWitCost,
    dueCount,
    dueExpense,
    bestSoldProducts,
    chartLabels,
    chartSells,
    chartProfits,
  } = result;
  const sortedBestSoldProd = bestSoldProducts.sort((a, b) => b.profit - a.profit);

  return (
    <div className="dashboard">
      <div className="dashboard-layout">
        <div className="flex gap-6">
          <Select
            size="small"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              localStorage.setItem("sortBy", e.target.value);
            }}
            displayEmpty
          >
            <MenuItem value={"today"}>{t("today")}</MenuItem>
            <MenuItem value={"week"}>{t("week")}</MenuItem>
            <MenuItem value={"month"}>{t("month")}</MenuItem>
            <MenuItem value={"year"}>{t("year")}</MenuItem>
            <MenuItem value={"custom"}>{t("date")}</MenuItem>
          </Select>

          {sortBy === "custom" && (
            <Calendar
              value={selectedDate}
              className="custom-date"
              onChange={(e) => {
                setSelectedDate(e.value);
                if (e.value) {
                  localStorage.setItem("selectedDate", e.value.toISOString());
                } else {
                  localStorage.removeItem("selectedDate");
                }
              }}
              dateFormat="yy-mm-dd"
              showIcon
              placeholder={t("selectDate")}
            />
          )}
        </div>

        <div className="dashboard-sells-info">
          <div className="data-card-group sell-count-group">
            <p className="body-font font-accent">
              {t("sellCount")}: {sellCount}
            </p>
            <p>{addDots(expense.toFixed(2))}</p>
            <p className="body-font">{addDots(getConvertion(expense).toFixed(2))}</p>
          </div>
          <div>
            <div className="data-card-group dashboard-profit-group">
              <p className="body-font font-accent">
                {t("profit")}: {productsWitCost.size}
              </p>
              <p>{addDots(profit.toFixed(2))}</p>
              <p className="body-font">{addDots(getConvertion(profit).toFixed(2))}</p>
            </div>
          </div>

          <div>
            <div className="data-card-group dashboard-profit-group">
              <p className="body-font font-accent">{t("avgBuy")}</p>
              <p>{(expense / sellCount || 0).toFixed(2)}</p>
              <p className="body-font">{addDots(getConvertion(expense / sellCount || 0).toFixed(2))}</p>
            </div>
          </div>
          <div>
            <div className="data-card-group dashboard-profit-group">
              <p className="body-font font-accent-n">{t("due")}</p>
              <p>#{dueCount}</p>
              <p className="body-font">{addDots(dueExpense.toFixed(2))}</p>
            </div>
          </div>
        </div>
        {sortedBestSoldProd.length > 0 && (
          <DataTable
            className="best-sold-products-data-table"
            value={sortedBestSoldProd}
            rows={4}
            paginator
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
          >
            <Column field="product" header={t("product")} />
            <Column
              field="quantity"
              body={(rowData) => {
                return (
                  (typeof rowData.quantity === "string" ? rowData.quantity : addDots(rowData.quantity)) +
                  " " +
                  rowData.unit
                );
              }}
              header={t("quantity")}
            />
            <Column field="profit" body={(rowData) => addDots(rowData.profit)} header={t("profit")} />
          </DataTable>
        )}
        <DashboardCharts chartLabels={chartLabels} chartSells={chartSells} chartProfits={chartProfits} />
      </div>
    </div>
  );
};

export default Dashboard;
