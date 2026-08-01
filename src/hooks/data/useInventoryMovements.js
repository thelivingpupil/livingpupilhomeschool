import useSWR from 'swr';

const useInventoryMovements = ({ productId, type } = {}) => {
  const params = new URLSearchParams();

  if (productId) params.set('productId', productId);
  if (type) params.set('type', type);

  const query = params.toString();
  const apiRoute = `/api/admin/inventory/movements${query ? `?${query}` : ''}`;
  const { data, error, mutate } = useSWR(apiRoute);

  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};

export default useInventoryMovements;
