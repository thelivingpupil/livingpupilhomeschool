import useSWR from 'swr';

const useDocuments = () => {
    const apiRoute = `/api/documentRequest/getDocs`;
    const { data, error } = useSWR(`${apiRoute}`);
    return {
        ...data,
        isLoading: !error && !data,
        isError: error,
    };
};

export default useDocuments;