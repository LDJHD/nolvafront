const fetcher = (url: string) =>
  fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  }).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });

export default fetcher;
