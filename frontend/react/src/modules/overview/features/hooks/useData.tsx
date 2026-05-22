import { useEffect, useRef, useState } from "react";

type userData = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  email?: string;
};

type PaginationMode = "append" | "replace";

function useData(mode: PaginationMode = "append") {
  const [data, setData] = useState<userData[]>([]);
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 10;
  const prevMode = useRef(mode);

  useEffect(() => {
    if (prevMode.current !== mode) {
      setData([]);
      setSkip(0);
      setTotal(0);
      prevMode.current = mode;
    }
  }, [mode]);

  useEffect(() => {
    async function getData() {
      setLoading(true);
      const res = await fetch(
        `https://dummyjson.com/users?limit=${limit}&skip=${skip}&select=firstName,lastName,age,email`,
      );
      const parsed = await res.json();
      setTotal(parsed.total);
      setData((prev) => (mode === "append" ? [...prev, ...parsed.users] : parsed.users));
      setLoading(false);
    }

    getData();
  }, [skip, mode]);

  const loadMore = () => setSkip((prev) => prev + limit);
  const goToPage = (p: number) => setSkip((p - 1) * limit);

  const page = skip / limit + 1;
  const totalPages = Math.ceil(total / limit);

  return { data, loading, loadMore, goToPage, page, totalPages };
}

export default useData;
