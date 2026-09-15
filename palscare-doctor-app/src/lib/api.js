const GATEWAY_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8080";

function getHeaders(path, role = "DOCTOR") {
  const current = localStorage.getItem("palscare-current-user");
  let userId = "okta_doc_456";
  let email = "doctor@test.com";

  if (current) {
    try {
      const parsed = JSON.parse(current);
      userId = parsed.userId || userId;
      email = parsed.email || email;
    } catch (e) {
      console.error("Failed to parse session", e);
    }
  }

  const headers = {
    "Content-Type": "application/json",
    "X-User-Id": userId,
    "X-User-Role": role,
    "X-User-Email": email
  };

  const token = localStorage.getItem("palscare-token");
  if (token && path && !path.startsWith("/api/v1/auth/")) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

export async function apiRequest(path, method = "GET", body = null, role = "DOCTOR") {
  const options = {
    method,
    headers: getHeaders(path, role)
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${GATEWAY_URL}${path}`, options);
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      // Try parsing as JSON first
      const errorJson = await response.json();
      if (errorJson && errorJson.message) {
        errorMessage = errorJson.message;
      } else if (errorJson && errorJson.error) {
        errorMessage = errorJson.error;
      }
    } catch (e) {
      // Fallback if not JSON
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
