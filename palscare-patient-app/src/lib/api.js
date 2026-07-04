const GATEWAY_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8080";

function getHeaders(role = "PATIENT") {
  const current = localStorage.getItem("palscare-current-user");
  let userId = role === "PATIENT" ? "okta_pat_123" : "okta_doc_456";
  let email = role === "PATIENT" ? "patient@test.com" : "doctor@test.com";

  if (current) {
    try {
      const parsed = JSON.parse(current);
      // We will make sure registration sets userId on the session object
      userId = parsed.userId || userId;
      email = parsed.email || email;
    } catch (e) {
      console.error("Failed to parse session", e);
    }
  }

  return {
    "Content-Type": "application/json",
    "X-User-Id": userId,
    "X-User-Role": role,
    "X-User-Email": email
  };
}

export async function apiRequest(path, method = "GET", body = null, role = "PATIENT") {
  const options = {
    method,
    headers: getHeaders(role)
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${GATEWAY_URL}${path}`, options);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
