import useSWR from 'swr';

const useStoreOrders = () => {
    const apiRoute = `/api/shop/storeOrders`;
    const { data, error } = useSWR(`${apiRoute}`);
    return {
        orderData: data,
        orderDataIsLoading: !error && !data,
        isError: error,
    };
};

export default useStoreOrders;