import useSWR from 'swr';

const useAffiliates = (year) => {
    const apiRoute = `/api/admin/affiliates`;
    const { data, error } = useSWR(
        year ? `${apiRoute}?year=${year}` : null
    );

    return {
        data: data?.data || [],
        year: data?.year || year,
        isLoading: !error && !data,
        isError: error,
    };
};

export default useAffiliates; 