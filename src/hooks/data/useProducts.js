import useSWR from 'swr';

const useProducts = () => {
  const apiRoute = '/api/admin/products';
  const { data, error, mutate } = useSWR(apiRoute);

  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};

export default useProducts;
