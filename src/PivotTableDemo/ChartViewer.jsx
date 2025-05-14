import React, { useEffect, useState } from "react";
import { fetchChartData } from "./chartService";
import supersetApi, { login } from "./supersetApi";
import WebDataRocksReact from "@webdatarocks/react-webdatarocks";
import "@webdatarocks/webdatarocks/webdatarocks.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { getChartKeys } from "./helper";

const ChartExplorer = () => {
  const [datasets, setDatasets] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [pivotKey, setPivotKey] = useState(0); // For remounting the pivot

  const [viewMode, setViewMode] = useState("pivot");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      await login();
    };
    init();
  }, []);

  const fetchDatasets = async () => {
    const csrfToken = localStorage.getItem("csrf_token");

    try {
      const response = await supersetApi.get("/api/v1/dataset/", {
        headers: {
          "X-CSRFToken": csrfToken,
        },
      });

      setDatasets(response.data.result);
    } catch (error) {
      console.error("Failed to fetch datasets:", error);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleDatasetSelect = async (e) => {
    const id = parseInt(e.target.value);
    setSelectedId(id);
    setLoading(true);

    try {
      const data = await fetchChartData(id);
      setChartData(data[0].data);
      setPivotKey((prev) => prev + 1); // Force remount with new key
    } catch (err) {
      console.error("Failed to fetch chart data:", err);
    }

    setLoading(false);
  };

  const { xKey, numericKeys, allKeys } = getChartKeys(chartData);

  useEffect(() => {
    const handleResize = () => {
      // Force remount after resizing
      setPivotKey((prev) => prev + 1);
    };
  
    let timeoutId = null;
  
    const debounceResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 500); // delay
    };
  
    window.addEventListener("resize", debounceResize);
  
    return () => {
      window.removeEventListener("resize", debounceResize);
    };
  }, []);
  

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>
        Superset Dataset Explorer
      </h2>

      <label>
        Select a Dataset:
        <select
          onChange={handleDatasetSelect}
          value={selectedId || ""}
          style={{ border: "2px solid black" }}
        >
          <option value="" disabled>
            -- Select Dataset --
          </option>
          {datasets?.map((ds) => (
            <option key={ds.id} value={ds.id}>
              {ds.table_name} (ID: {ds.id})
            </option>
          ))}
        </select>
      </label>

      {loading && <p>Loading chart data...</p>}

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => setViewMode("chart")}
          style={{
            padding: "8px 16px",
            marginRight: "10px",
            border: "1px solid black",
            backgroundColor: "white",
            color: "black",
            fontSize: "14px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Chart View
        </button>

        <button
          onClick={() => setViewMode("pivot")}
          style={{
            padding: "8px 16px",
            border: "1px solid black",
            backgroundColor: "white",
            color: "black",
            fontSize: "14px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Pivot Table View
        </button>
      </div>

      {viewMode === "chart" && chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey || "id"} />
            <YAxis />
            <Tooltip />
            {allKeys.map((key, idx) => (
              <Bar
                key={key}
                dataKey={key}
                fill={
                  ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#a4de6c"][
                    idx % 5
                  ]
                }
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}

      {viewMode === "pivot" && chartData.length > 0 && (
        <WebDataRocksReact
          key={pivotKey}
          toolbar={true}
          width="100%"
          height="430px"
          report={{
            dataSource: {
              data: [...chartData],
            },
            options: {
              grid: {
                type: "flat",
              },
            },
          }}
        />
      )}
    </div>
  );
};

export default ChartExplorer;
