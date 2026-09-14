import useSWR from 'swr';

const useOrientationProgress = () => {
  const apiRoute = '/api/admin/orientation-progress';
  const { data, error, mutate } = useSWR(apiRoute);

  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};

export default useOrientationProgress;
