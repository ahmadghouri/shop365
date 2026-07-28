import { defineStore } from "pinia";
import { ref } from "vue";
import { voucherApi } from "@/api/modules/voucher.api";
import { queryClient } from "@/api/queries/query-client";
import { QUERY_KEYS } from "@/api/queries/query-keys";

export const useVoucherStore = defineStore("vouchers", () => {
  const vouchers = ref([]);

  async function fetchVouchers() {
    try {
      const data = await queryClient.fetchQuery({
        queryKey: QUERY_KEYS.VOUCHERS,
        queryFn: () => voucherApi.getAll().then((r) => r.data.data),
      });
      vouchers.value = data;
    } catch (error) {
      console.error("Failed to fetch vouchers:", error);
    }
  }

  async function deleteVoucher(id) {
    try {
      await voucherApi.delete(id);
      vouchers.value = vouchers.value.filter((v) => v.id !== id);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VOUCHERS });
    } catch (error) {
      console.error("Failed to delete voucher:", error);
      throw error;
    }
  }

  async function createVoucher(data) {
    try {
      const response = await voucherApi.create(data);
      vouchers.value.push(response.data.data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VOUCHERS });
      return response.data;
    } catch (error) {
      console.error("Failed to create voucher:", error);
      throw error;
    }
  }

  return { vouchers, fetchVouchers, deleteVoucher, createVoucher };
});
