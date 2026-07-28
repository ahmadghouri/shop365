import { useQuery } from "@tanstack/vue-query";
import { headerImageApi } from "@/api/modules/header-image.api";
import { QUERY_KEYS } from "./query-keys";

export function useHeaderImagesQuery(options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.HEADER_IMAGES,
    queryFn: () => headerImageApi.getAll().then((r) => r.data.data || r.data),
    ...options,
  });
}
