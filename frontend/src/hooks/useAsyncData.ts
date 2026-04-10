import { useCallback, useEffect, useState } from "react";

type AsyncState<T> = {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
};

export function useAsyncData<T>(loader: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: true,
  });

  const load = useCallback(async () => {
    setState((current) => ({
      data: current.data,
      error: null,
      isLoading: true,
    }));

    try {
      const data = await loader();
      setState({
        data,
        error: null,
        isLoading: false,
      });
    } catch (error) {
      setState({
        data: null,
        error: error instanceof Error ? error : new Error("Unknown error"),
        isLoading: false,
      });
    }
  }, deps);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    ...state,
    reload: load,
  };
}
