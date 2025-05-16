import React, { useState, useEffect } from "react";
import * as WebDataRocksReact from "@webdatarocks/react-webdatarocks";
import "@webdatarocks/webdatarocks/webdatarocks.css";
import "./pivot.css";

const PIVOT_EXCLUDE_BUTTONS = [
  'wdr-tab-connect',
  'wdr-tab-open',
  'wdr-tab-save',
  'wdr-tab-export',
  'wdr-tab-format',
  'wdr-tab-options',
  'wdr-tab-fullscreen'
];



// Druid broker config
const DRUID_BROKER_URL = "https://druid.dev.platform.ext.mobilityware.com";

// Hardcoded list of datasources for dropdown
const DATASOURCES = [
  "cam_app",
  "cam_creative_geo",
  "cam_media_sources",
  "cam_performance_report",
  "cam_performance_report_agg",
  "cam_network_assets"
];

const PivotTable = () => {
  const [selectedDs, setSelectedDs] = useState("cam_app");
  const [dimensions, setDimensions] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch dimensions & data whenever selectedDs changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1) fetch dimension names
        const dimRes = await fetch(
          `${DRUID_BROKER_URL}/druid/v2/datasources/${selectedDs}/dimensions`
        );
        const dims = await dimRes.json();
        setDimensions(dims);

        // 2) build dynamic SELECT clause
        const selectCols = dims.map(col => `"${col}"`).join(", ");
        const sqlQuery = `SELECT ${selectCols} FROM "${selectedDs}"`;

        // 3) execute SQL query
        const sqlRes = await fetch(
          `${DRUID_BROKER_URL}/druid/v2/sql/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: sqlQuery })
          }
        );
        const dataRows = await sqlRes.json();
        console.log(dataRows,"dataRows")

        // 4) load into pivot report
        setReport({ dataSource: { data: dataRows } });
      } catch (err) {
        console.error("Error fetching Druid data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDs]);

  const customizeToolbar = (toolbar) => {
    const tabs = toolbar.getTabs();
    toolbar.getTabs = () =>
      tabs.filter((tab) => !PIVOT_EXCLUDE_BUTTONS.includes(tab.id));
  };

  return (
    <div style={{width:'100%'}}>
      <div style={{ margin: "1rem" }}>
        <label htmlFor="ds-select" style={{ marginRight: "0.5rem", fontWeight: 600 }}>
          Data Source:
        </label>
        <select
          id="ds-select"
          value={selectedDs}
          onChange={(e) => setSelectedDs(e.target.value)}
          style={{ padding: "0.5rem 0.75rem", borderRadius: 4, border: "1px solid #ccc", minWidth: 300 }}
        >
          {DATASOURCES.map((ds) => (
            <option key={ds} value={ds}>
              {ds}
            </option>
          ))}
        </select>
      </div>

      {loading || !report ? (
        <div style={{ textAlign: "center", padding: "2rem 0" }}>Loading pivot table...</div>
      ) : (
        <WebDataRocksReact.Pivot
          report={report}
          toolbar={true}
          beforetoolbarcreated={customizeToolbar}
        />
      )}
    </div>
  );
};

export default PivotTable;