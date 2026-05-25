const fetcher = (url: string, data?: Record<string, unknown>) =>
  fetch(url, {
    method: data ? "POST" : "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    ...(data ? { body: JSON.stringify(data) } : {}),
  }).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });

export default fetcher;
