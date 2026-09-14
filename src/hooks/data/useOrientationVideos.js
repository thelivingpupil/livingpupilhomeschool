import useSWR from 'swr';

const useOrientationVideos = () => {
  const apiRoute = '/api/admin/orientation-videos';
  const { data, error, mutate } = useSWR(apiRoute);

  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};

export default useOrientationVideos;
