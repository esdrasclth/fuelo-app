async function handle(res: Response) {
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Error de red");
  }
  return res.json();
}

export const api = {
  get: (url: string) => fetch(url).then(handle),
  post: (url: string, body: unknown) =>
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(handle),
  patch: (url: string, body: unknown) =>
    fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(handle),
  del: (url: string) => fetch(url, { method: "DELETE" }).then(handle),
};
