import { defineStore } from "pinia";
import axios from "axios";
import { computed, ref } from "vue";
import { API_BASE_URL } from "../config/api";

export const useVoucherStore = defineStore("vouchers", () => {
  const vouchers = ref([]);

  async function fetchVouchers() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/get-voucher`);
      vouchers.value = response.data.data;
      console.log(vouchers.value);

      return response.data;
    } catch (error) {
      console.error("Failed to fetch vouchers:", error);
      throw error;
    }
  }

  async function deleteVoucher(id) {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/admin/voucher/${id}/delete`
      );
      vouchers.value = vouchers.value.filter((voucher) => voucher.id !== id);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete voucher with ID ${id}:`, error);
      throw error;
    }
  }

  async function createVoucher(data) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/create-voucher`,
        data
      );
      await fetchVouchers();
      return response.data;
    } catch (error) {
      console.error("Failed to create voucher:", error);
      throw error;
    }
  }

  return {
    vouchers,
    fetchVouchers,
    deleteVoucher,
    createVoucher,
  };
});

export default useVoucherStore;
