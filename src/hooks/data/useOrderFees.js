import useSWR from 'swr';

const useOrderFees = () => {
  const apiRoute = `/api/shop/orderFees`;
  const { data, error, mutate } = useSWR(apiRoute);
  return {
    orderFeeData: data,
    orderFeeDataIsLoading: !error && !data,
    isError: error,
    mutate,
  };
};

export default useOrderFees;