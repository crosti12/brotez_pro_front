import { useCallback, useMemo } from "react";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isWithinInterval,
  // eachHourOfInterval,
  eachDayOfInterval,
  eachMonthOfInterval,
  format,
  setMinutes,
  setHours,
} from "date-fns";
import useGlobalState from "../../actions/useGlobalState";
import { calculate } from "../../utils/numberFormat";

const useDataBreakDown = ({ sortBy = "", selectedDates = {}, indexDate }) => {
  const { orders, productsWithDeleted, getConvertion } = useGlobalState();

  const getProductInfo = useCallback(
    (products = [], bestSoldProducts) =>
      products.reduce(
        (acc, product) => {
          const stateProduct = productsWithDeleted.find((pro) => pro?._id === product?.productId);
          if (!stateProduct) return acc;
          const isDollar = product.currencyAt === "usd";
          const pricedAt = isDollar ? product.pricedAt : getConvertion(product.pricedAt, "toDollar");

          let productCost = 0;
          let productProfit = 0;

          const productExpense = calculate("multiply", pricedAt, product.quantity);
          acc.productExpense += productExpense;

          if (product.costAt || stateProduct.cost) {
            const productCosted = isDollar
              ? product.costAt
              : getConvertion(product.costAt || stateProduct.cost, "toDollar");
            productCost = calculate("multiply", productCosted, product.quantity);
            productProfit = productExpense - productCost;

            acc.productProfit += productProfit;
            acc.extractedProducts.add(stateProduct.name);
          }

          const productInBest = bestSoldProducts.find((pro) => pro.id === stateProduct._id);

          if (!productInBest) {
            bestSoldProducts.push({
              id: stateProduct._id,
              product: stateProduct.name,
              quantity: product.quantity,
              profit: productProfit,
              unit: stateProduct.unit,
            });
          } else {
            productInBest.quantity = calculate("add", productInBest.quantity, product.quantity);
            productInBest.profit = calculate("add", productInBest.profit, productProfit);
          }

          return acc;
        },
        { productExpense: 0, productProfit: 0, extractedProducts: new Set() }
      ),
    [productsWithDeleted]
  );

  const buildChartRange = (sortBy, now, start, end) => {
    if (sortBy === "day") {
      const hours = Array.from({ length: 15 }, (_, i) => 6 + i);
      const labels = hours.map((h) => format(setMinutes(setHours(now, h), 0), "h a"));
      return {
        labels,
        sells: Array(labels.length).fill(0),
        profits: Array(labels.length).fill(0),
      };
    }

    if (sortBy === "week") {
      const range = eachDayOfInterval({ start, end });
      const labels = range.map((d) => format(d, "EE"));
      return { labels, sells: Array(labels.length).fill(0), profits: Array(labels.length).fill(0) };
    }

    if (sortBy === "month") {
      const range = eachDayOfInterval({ start, end });
      const labels = range.map((d) => d.getDate());
      return { labels, sells: Array(labels.length).fill(0), profits: Array(labels.length).fill(0) };
    }

    if (sortBy === "year") {
      const range = eachMonthOfInterval({ start, end });
      const labels = range.map((d) => d.toLocaleString("default", { month: "short" }));
      return { labels, sells: Array(labels.length).fill(0), profits: Array(labels.length).fill(0) };
    }

    return { labels: [], sells: [], profits: [] };
  };

  const result = useMemo(() => {
    const now = indexDate;
    let start = null;
    let end = null;

    switch (sortBy) {
      case "day":
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case "week":
        start = startOfWeek(now, { weekStartsOn: 1 });
        end = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case "month":
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case "year":
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      default:
        start = null;
        end = null;
    }

    const chart = buildChartRange(sortBy, now, start, end);

    const chartIndex = (date) => {
      if (sortBy === "day") {
        const hour = date.getHours();
        if (hour >= 6 && hour <= 20) {
          return hour - 6;
        }
        return -1;
      }
      if (sortBy === "week") {
        const days = eachDayOfInterval({ start, end });
        return days.findIndex((d) => d.toDateString() === date.toDateString());
      }
      if (sortBy === "month") {
        return date.getDate() - 1;
      }
      if (sortBy === "year") {
        return date.getMonth();
      }
      return -1;
    };

    return orders.reduce(
      (acc, order) => {
        const orderDate = new Date(order.createdAt);

        if (start && end && isWithinInterval(orderDate, { start, end })) {
          const info = getProductInfo(order?.products || [], order.isPaid ? acc.bestSoldProducts : []);
          const { productProfit, productExpense, extractedProducts } = info;
          if (order.isPaid) {
            acc.sellCount += 1;

            const idx = chartIndex(orderDate);

            const increaseCount = () => {
              chart.sells[idx] += 1;
              chart.profits[idx] += productProfit;
            };

            idx >= 0 && increaseCount();

            extractedProducts.size > 0 &&
              (acc.productsWitCost = new Set([...acc.productsWitCost, ...extractedProducts]));

            acc.expense += productExpense || 0;
            acc.profit += productProfit || 0;
          } else {
            acc.dueCount += 1;
            acc.dueExpense += productExpense || 0;
          }
        }

        return acc;
      },
      {
        sellCount: 0,
        expense: 0,
        profit: 0,
        productsWitCost: new Set(),
        dueCount: 0,
        dueExpense: 0,
        bestSoldProducts: [],
        chartLabels: chart.labels,
        chartSells: chart.sells,
        chartProfits: chart.profits,
      }
    );
  }, [orders, sortBy, getProductInfo, selectedDates, indexDate]);

  return result;
};

export default useDataBreakDown;
