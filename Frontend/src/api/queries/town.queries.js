import { useQuery } from "@tanstack/vue-query";
import { townApi } from "@/api/modules/town.api";
import { QUERY_KEYS } from "./query-keys";

export function useTownsQuery(options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.TOWNS,
    queryFn: () => townApi.getAll().then((r) => r.data.data),
    ...options,
  });
}
