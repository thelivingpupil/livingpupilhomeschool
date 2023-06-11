import useSWR from 'swr';

const useUser = () => {
  const apiRoute = `/api/user`;
  const { data, error } = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useUser;
