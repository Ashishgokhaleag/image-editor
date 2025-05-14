import { useEffect } from "react";
import axios from "axios";
import { embedDashboard } from "@superset-ui/embedded-sdk";

// const supersetUrl = "http://localhost:8088";
const supersetUrl = "https://superset.dev.platform.ext.mobilityware.com";
const dashboardId = "71acc3e4-9880-484a-ac28-7d4e05a0db32";

const supersetApi = axios.create({
  baseURL: supersetUrl,
});

supersetApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// Get CSRF Token
const getCSRFToken = async () => {
  const res = await supersetApi.get("/api/v1/security/csrf_token/", {
    withCredentials: true,
  });
  return res.data.result;
};

const getTokenAndEmbedDashboard = async () => {
  try {
    // Login to get access token
    const loginResponse = await axios.post(
      `${supersetUrl}/api/v1/security/login`,
      {
        password: "admin",
        provider: "db",
        refresh: true,
        username: "admin",
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const access_token = loginResponse.data.access_token;
    localStorage.setItem("access_token", access_token);

    const csrf = await getCSRFToken();
    localStorage.setItem("csrf_token", csrf);

    // POST guest_token
    const guestTokenResponse = await axios.post(
      `${supersetUrl}/api/v1/security/guest_token/`,
      {
        resources: [
          {
            type: "dashboard",
            id: dashboardId,
          },
        ],
        rls: [],
        user: {
          username: "report-viewer",
          first_name: "report-viewer",
          last_name: "report-viewer",
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
          "X-CSRFToken": csrf,
        },
        withCredentials: true, // ✅ important
      }
    );

    const guestToken = guestTokenResponse.data.token;
    console.log(guestToken,'guestToken')
    await embedDashboard({
      id: "71acc3e4-9880-484a-ac28-7d4e05a0db32",
      supersetDomain: "https://superset.dev.platform.ext.mobilityware.com",
      mountPoint: document.getElementById("superset-container"),
      fetchGuestToken: () => guestToken,
      dashboardUiConfig: { hideTitle: true },
    });

    const iframe = document.querySelector("#superset-container iframe");
    if (iframe) {
      iframe.style.width = "100%";
      iframe.style.minHeight = "100vh";
      iframe.setAttribute(
        "sandbox",
        "allow-scripts allow-same-origin allow-forms allow-popups"
      );
    }
  } catch (error) {
    console.error("Error embedding Superset dashboard:", error);
  }
};

function SupersetIframe() {
  useEffect(() => {
    getTokenAndEmbedDashboard();
  }, []);

  return <div id="superset-container" />;
}

export default SupersetIframe;