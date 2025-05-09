import React from "react";
import { Bar, Doughnut, Pie } from "react-chartjs-2";

function PieChart({ chartData, text }) {

   if (!chartData?.labels || !chartData?.datasets) return null;

  return (
    <div className="w-64 h-64 mx-auto">
      {/* 16rem x 16rem */}
      <h2 className="text-center text-lg mb-2">{text}</h2>
      <Pie
        data={chartData}
        options={{
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              font: {
                size: 14,
              },
            },
            legend: {
              display: true,
              position: "bottom",
            },
          },
        }}
      />
    </div>
  );
}

export default PieChart;

export const DoughnutChart = ({ chartData, text }) => {

   if (!chartData?.labels || !chartData?.datasets) return null;

  return (
    <div className="w-64 h-64 mx-auto">
      {/* 16rem x 16rem */}
      <h2 className="text-center text-lg mb-2">{text}</h2>
      <Doughnut
        data={chartData}
        options={{
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              font: {
                size: 14,
              },
            },
            legend: {
              display: true,
              position: "bottom",
            },
          },
        }}
      />
    </div>
  );
};

export const BarChart = ({ chartData, text }) => {

   if (!chartData?.labels || !chartData?.datasets) return null;

  return (
    <div className="w-full max-w-md mx-auto h-72">
      
      {/* Ensures height */}
      <h2 className="text-center text-lg mb-2">{text}</h2>
      <Bar
        data={chartData}
        options={{
          maintainAspectRatio: false,
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0,
              },
            },
          },
        }}
      />
    </div>
  );
};
