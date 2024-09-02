import useSWR from 'swr';

const useOrderFees = () => {
    const apiRoute = `/api/shop/orderFees`;
    const { data, error } = useSWR(`${apiRoute}`);
    return {
        orderFeeData: data,
        orderFeeDataIsLoading: !error && !data,
        isError: error,
    };
};

export default useOrderFees;