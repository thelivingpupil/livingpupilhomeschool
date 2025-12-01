const fetcher = async (url) => {
  const response = await fetch(url);
  const data = await response.json();
  
  if (!response.ok) {
    const error = new Error(data.errors?.error?.msg || 'An error occurred');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  
  return data;
};

export default fetcher;
