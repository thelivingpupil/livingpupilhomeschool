import useSWR from 'swr';

const useShopOrdersV2 = () => {
  const { data, error, mutate } = useSWR('/api/admin/shop/orders');

  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};

export default useShopOrdersV2;
