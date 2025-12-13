import { useState } from "react";
import "./Dashboard.css";
import { useTranslation } from "react-i18next";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import useDataBreakDown from "./useDataBreakDown";
import { addDots } from "../../utils/numberFormat";
import DashboardCharts from "./DashboardCharts";
import useGlobalState from "../../actions/useGlobalState";
import { format } from "date-fns";
import DashboardTables from "./DashboardTables";

const Dashboard = () => {
  const initialSortBy = localStorage.getItem("sortBy") || "day";

  const initialIndexDAte = localStorage.getItem("selectedDateIndex")
    ? new Date(localStorage.getItem("selectedDateIndex"))
    : new Date();

  const [sortBy, setSortBy] = useState(initialSortBy);
  const [indexDate, setIndexDate] = useState(initialIndexDAte);

  const { getConvertion } = useGlobalState();
  const { t } = useTranslation();

  const result = useDataBreakDown({
    sortBy,
    indexDate,
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

  const onMoveNextAndBack = (direction = "backwards") => {
    let result = new Date(indexDate);

    switch (sortBy) {
      case "day":
        result.setDate(result.getDate() + (direction === "forward" ? 1 : -1));
        break;

      case "week":
        result.setDate(result.getDate() + (direction === "forward" ? 7 : -7));
        break;

      case "month":
        result.setMonth(result.getMonth() + (direction === "forward" ? 1 : -1));
        break;

      case "year":
        result.setFullYear(result.getFullYear() + (direction === "forward" ? 1 : -1));
        break;

      default:
        result = indexDate;
    }
    localStorage.setItem("selectedDateIndex", result.toISOString());
    setIndexDate(result);
  };

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
            <MenuItem value={"day"}>{t("day")}</MenuItem>
            <MenuItem value={"week"}>{t("week")}</MenuItem>
            <MenuItem value={"month"}>{t("month")}</MenuItem>
            <MenuItem value={"year"}>{t("year")}</MenuItem>
          </Select>

          <div className="date-navigation-btns">
            <button onClick={() => onMoveNextAndBack("backwards")}>{"<"}</button>
            {format(indexDate, "yyyy-MM-dd")}
            <button onClick={() => onMoveNextAndBack("forward")}>{">"}</button>
          </div>
        </div>

        <div className="dashboard-sells-info">
          <div className="data-card-group sell-count-group">
            <p className="body-font font-accent">
              {t("sellCount")}: {sellCount}
            </p>
            <p>{addDots(expense.toFixed(2))} $</p>
            <p className="body-font">{addDots(getConvertion(expense).toFixed(2))} Bs</p>
          </div>
          <div>
            <div className="data-card-group dashboard-profit-group">
              <p className="body-font font-accent">
                {t("profit")}: {productsWitCost.size}
              </p>
              <p>{addDots(profit.toFixed(2))} $</p>
              <p className="body-font">{addDots(getConvertion(profit).toFixed(2))} Bs</p>
            </div>
          </div>

          <div>
            <div className="data-card-group dashboard-profit-group">
              <p className="body-font font-accent">{t("avgBuy")}</p>
              <p>{(expense / sellCount || 0).toFixed(2)} $</p>
              <p className="body-font">{addDots(getConvertion(expense / sellCount || 0).toFixed(2))} Bs</p>
            </div>
          </div>
          <div>
            <div className="data-card-group dashboard-profit-group">
              <p className="body-font font-accent-n">{t("due")}</p>
              <p>#{dueCount}</p>
              <p className="body-font">{addDots(dueExpense.toFixed(2))} $</p>
            </div>
          </div>
        </div>

        <DashboardCharts chartLabels={chartLabels} chartSells={chartSells} chartProfits={chartProfits} />
        <DashboardTables products={sortedBestSoldProd} t={t} />
      </div>
    </div>
  );
};

export default Dashboard;
