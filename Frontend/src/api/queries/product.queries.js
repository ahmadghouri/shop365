import { useQuery } from "@tanstack/vue-query";
import { productApi } from "@/api/modules/product.api";
import { QUERY_KEYS } from "./query-keys";

export function useProductsQuery(params, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCTS(params),
    queryFn: () => productApi.getAll(params).then((r) => r.data.data),
    ...options,
  });
}

export function useProductQuery(id, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCT(id),
    queryFn: () => productApi.getById(id).then((r) => r.data.data),
    enabled: !!id,
    ...options,
  });
}

export function useBusinessProductsQuery(businessId, params, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.BUSINESS_PRODUCTS(businessId, params),
    queryFn: () => productApi.getBusinessProducts(businessId, params).then((r) => r.data.data),
    enabled: !!businessId,
    ...options,
  });
}

export function useBusinessProductsAdminQuery(businessId, params, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.BUSINESS_PRODUCTS_ADMIN(businessId, params),
    queryFn: () => productApi.getBusinessProductsAdmin(businessId, params).then((r) => r.data.data),
    enabled: !!businessId,
    ...options,
  });
}

export function useRandomProductsQuery(options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.RANDOM_PRODUCTS,
    queryFn: () => productApi.getRandom().then((r) => r.data.data),
    ...options,
  });
}

export function useProductTypesQuery(businessId, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCT_TYPES(businessId),
    queryFn: () => productApi.getTypes(businessId).then((r) => r.data.data),
    enabled: !!businessId,
    ...options,
  });
}

export function useRestaurantProductsQuery(params, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.RESTAURANT_PRODUCTS(params),
    queryFn: () => productApi.getRestaurantProducts(params).then((r) => r.data.data),
    ...options,
  });
}
