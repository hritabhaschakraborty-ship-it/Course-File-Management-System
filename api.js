const fetchApi = async (endpoint, options = {}) => {
  const token = localStorage.getItem('cfms_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(endpoint, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

export const api = {
  get: (endpoint, options) => fetchApi(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) => fetchApi(endpoint, { method: 'POST', body, ...options }),
  put: (endpoint, body, options) => fetchApi(endpoint, { method: 'PUT', body, ...options }),
  delete: (endpoint, options) => fetchApi(endpoint, { method: 'DELETE', ...options })
};
export default api;
