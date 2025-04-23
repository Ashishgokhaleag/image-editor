import supersetApi from "./supersetApi";

const datasetColumnsMap = {
  1: ["country_code", "country_name", "region", "year"],
  2: ["num_california", "ds", "gender", "name", "num", "state", "num_boys", "num_girls"],
  3: ["LON", "LAT", "NUMbER", "STREET", "POSTCODE", "datetime", "radius_miles", "geohash"],
  4: ["DEPT_ID", "2003", "2004", "2005", "dttm"],
  5: ["zipcode", "population", "area"],
  6: ["YEAR", "MONTH", "DAY", "DAY_OF_WEEK", "AIRLINE", "FLIGHT_NUMBER", "TAIL_NUMBER", "ORIGIN_AIRPORT", "DESTINATION_AIRPORT", "AIRPORT", "ds", "CITY", "STATE", "COUNTRY", "AIRPORT_DEST"],
  7: ["name", "color", "polyline"],
  8: ["parent", "count", "id", "name"],
  9: ["gender", "highest_degree_earned", "developer_type", "ethnic_minority", "willing_to_relocate"],
  10: ["ts", "name", "text"],
  11: ["channel_id", "user_id"],
  12: ["clinical_stage", "anticipated_next_steps", "ioc_country_code", "country_name", "date_last_updated"],
  13: ["ts", "channel_id", "thread_ts", "type", "user"],
  14: ["topic__last_set", "purpose__last_set", "created", "unlinked"],
  15: ["channel_name", "member_name"],
  16: ["date", "new_members", "percent_of_messages_private_channels", "percent_of_views_public_channels"],
  17:["ts", "client_msg_id", "channel_id", "thread_ts", "latest_reply", "team", "type", "user", "text", "subscribed", "reply_count", "reply_users", "blocks", "reply_users_count"],
  18: ["date", "new_members"],
  19:["with_missing", "phrase", "short_phrase", "dttm", "value"],
    21: ["year", "na_sales", "eu_sales", "global_sales", "publisher", "platform"],
  22: ["user_id", "name"],
  25: ["table_catalog", "table_schema", "table_name"]
};

const getColumnsForDataset = (datasetId) => {
    console.log("datasetColumnsMap[datasetId]>>", datasetColumnsMap[datasetId])
  return datasetColumnsMap[datasetId];
};

export const fetchChartData = async (datasetId) => {
  const csrfToken = localStorage.getItem("csrf_token");

  const payload = {
    datasource: {
      id: datasetId,
      type: "table",
    },
    queries: [
      {
        columns: getColumnsForDataset(datasetId),
        metrics: ["count"],
        order_desc: true,
      },
    ],
  };

  try {
    const response = await supersetApi.post("/api/v1/chart/data", payload, {
      headers: {
        "X-CSRFToken": csrfToken,
      },
    });

    return response.data.result;
  } catch (error) {
    console.error("Failed to fetch chart data:", error.response || error);
    throw error;
  }
};
