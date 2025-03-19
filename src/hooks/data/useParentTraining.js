import useSWR from 'swr';

const useParentTrainings = () => {
    const apiRoute = `/api/parent-training`;
    const { data, error } = useSWR(`${apiRoute}`);

    return {
        ...data,
        isLoading: !error && !data,
        isError: error,
    };
};

export default useParentTrainings;
