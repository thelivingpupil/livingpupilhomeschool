import useSWR from 'swr';

const useSchoolFees = () => {
    const apiRoute = `/api/schoolFees`;
    const { data, error } = useSWR(`${apiRoute}`);
    return {
        ...data,
        isLoading: !error && !data,
        isError: error,
    };
};

export default useSchoolFees;
