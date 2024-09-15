import { useState, useEffect } from "react";

function useFetchBlob(url) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        const { ok, statusText } = response;
        if (!ok) {
          throw new Error(
            `파일을 가져오는 중 에러,${statusText} 가 발생했습니다,`
          );
        }
        setLoading(true);
        const blobObj = await response.blob();
        setData(blobObj);
      } catch (error) {
        setError(error);
        console.error("Download failed", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [url]);

  return { loading, data, error };
}

export default useFetchBlob;
