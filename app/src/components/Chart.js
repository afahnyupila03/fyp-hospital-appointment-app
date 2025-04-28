import React from "react";
import { Bar, Doughnut } from "react-chartjs-2";

function PieChart({ chartData, text }) {
  return (
    <div className="w-64 h-64 mx-auto"> {/* 16rem x 16rem */}
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
}

export default PieChart;
