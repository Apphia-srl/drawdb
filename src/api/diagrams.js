import axios from "axios";

const baseUrl =
  import.meta.env.VITE_DIAGRAM_BACKEND_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "/backend";

export async function get(id) {
  const res = await axios.get(`${baseUrl}/diagrams/${id}`);

  return res.data.data;
}

export async function save(id, payload) {
  const res = await axios.put(`${baseUrl}/diagrams/${id}`, payload);

  return res.data.data;
}

export async function del(id) {
  await axios.delete(`${baseUrl}/diagrams/${id}`);
}

export async function getCommits(id, perPage = 50, page = 1) {
  const res = await axios.get(`${baseUrl}/diagrams/${id}/commits`, {
    params: { per_page: perPage, page },
  });

  return res.data.data;
}

export async function getVersion(id, version) {
  const res = await axios.get(`${baseUrl}/diagrams/${id}/${version}`);

  return res.data.data;
}
