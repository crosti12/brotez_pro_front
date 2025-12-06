import { Chart } from "primereact/chart";

const DashboardCharts = ({ chartLabels, chartSells, chartProfits }) => {
  const chartData = {
    labels: chartLabels,
    datasets: [{ type: "line", label: "Sales", data: chartSells }],
  };
  const chartDataSecond = {
    labels: chartLabels,
    datasets: [{ type: "line", label: "Profit", color: "red", data: chartProfits, borderColor: "#e7e41dff" }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  return (
    <div className="my-chart-wrapper">
      <Chart type="bar" data={chartData} options={chartOptions} />
      <Chart type="bar" data={chartDataSecond} options={chartOptions} />
    </div>
  );
};

export default DashboardCharts;
