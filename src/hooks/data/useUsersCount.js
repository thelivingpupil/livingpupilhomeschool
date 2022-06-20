import useSWR from 'swr';

const useUsersCount = () => {
  const apiRoute = `/api/users/count`;
  const { data, error } = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useUsersCount;
