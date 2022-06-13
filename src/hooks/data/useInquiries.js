import useSWR from 'swr';

const useInquiries = () => {
  const apiRoute = `/api/inquiries`;
  const { data, error } = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useInquiries;
