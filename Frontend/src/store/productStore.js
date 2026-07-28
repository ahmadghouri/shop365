import { defineStore } from "pinia";
import { productApi } from "@/api/modules/product.api";
import { queryClient } from "@/api/queries/query-client";
import { QUERY_KEYS } from "@/api/queries/query-keys";

export const useProductStore = defineStore("products", {
  state: () => ({
    activeBusinessId: null,
    businessType: null,
    productsListBusinessId: null,
    selectedFilter: "All",
    searchTerm: "",
    filters: [],
    products: [],
    product: null,
    number: "",
    currentPage: 0,
    totalPages: 1,
    adminProducts: [],
    isLoading: false,
  }),

  getters: {
    currentProducts: (state) => state.products,
  },

  actions: {
    clearData() {
      this.selectedFilter = "All";
      this.searchTerm = "";
      this.filters = [];
      this.products = [];
      this.product = null;
      this.number = "";
      this.currentPage = 0;
      this.totalPages = 1;
      this.isLoading = false;
    },

    setBusinessContext(id, type = "child") {
      if (this.activeBusinessId !== id || this.businessType !== type) {
        this.clearData();
        this.activeBusinessId = id;
        this.businessType = type;
      }
    },

    async getRestaurantProducts(search = "", page = 1) {
      this.isLoading = true;
      try {
        const response = await productApi.getRestaurantProducts({ search, page });
        const resData = response.data.data || response.data;
        const data = resData.data || resData || [];
        const current_page = resData.current_page || 1;
        const last_page = resData.last_page || 1;
        const total = resData.total || 0;

        this.products = page === 1 ? data : [...this.products, ...data];
        this.currentPage = current_page;
        this.totalPages = last_page;
        this.total = total;
        return this.products;
      } catch (error) {
        console.error("Failed to fetch restaurant products", error);
        this.products = [];
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async getProducts(id, search = "", page = 1) {
      try {
        this.setBusinessContext(id, "child");
        const response = await productApi.getBusinessProducts(id, { search, page });
        const data = response.data.data;
        const newProducts = data.products?.data || data.products || data;
        this.number = data.number;

        const types = data.types || [];
        this.filters = ["All", ...new Set(types.map((t) => t.type || t))];
        this.products = page === 1 ? newProducts : [...this.products, ...newProducts];
        this.currentPage = data.products?.current_page || 1;
        this.totalPages = data.products?.last_page || 1;
        return this.products;
      } catch (error) {
        console.error("Failed to fetch products", error);
        throw error;
      }
    },

    async fetchFilters(businessId) {
      try {
        const response = await productApi.getTypes(businessId);
        const types = response.data.data?.types || response.data.data || [];
        this.filters = ["All", ...new Set(types.map((t) => t.type || t))];
      } catch (error) {
        console.error("Failed to fetch filters");
      }
    },

    async getProductsAdmin(id, search = "") {
      try {
        const response = await productApi.getBusinessProductsAdmin(id, { search });
        this.adminProducts = response.data.data;
      } catch (error) {
        console.error(error);
      }
    },

    async getProduct(id, business_id) {
      try {
        const response = await productApi.getById(id, { business_id });
        this.product = response.data.data;
      } catch (error) {
        console.error("Failed to fetch product", error);
      }
    },

    async deleteProduct(id) {
      try {
        await productApi.delete(id);
        this.products = this.products.filter((p) => p.id !== id);
        this.adminProducts = this.adminProducts.filter((p) => p.id !== id);
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } catch (error) {
        console.error("Failed to delete product", error);
      }
    },

    async storeProduct(productInfo) {
      try {
        const response = await productApi.create(productInfo);
        this.products.push(response.data.data);
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } catch (error) {
        console.error("Error adding product:", error);
      }
    },

    async updateProduct(productInfo, id) {
      try {
        const response = await productApi.update(id, productInfo);
        const index = this.products.findIndex((p) => p.id === id);
        if (index !== -1) this.products[index] = { ...this.products[index], ...response.data.data };
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } catch (error) {
        console.error("Error updating product:", error);
      }
    },

    async applyDiscount(productId, discount, discountType) {
      try {
        const response = await productApi.applyDiscountToProduct(productId, { discount, discount_type: discountType });
        const updated = response.data.data;
        const index = this.products.findIndex((p) => p.id === productId);
        if (index !== -1) {
          this.products[index] = { ...this.products[index], discount: updated.discount, discount_type: updated.discount_type, final_price: updated.final_price };
        }
      } catch (error) {
        console.error("Failed to apply discount", error);
        throw error;
      }
    },

    async getNumber(businessId) {
      try {
        const { businessApi } = await import("@/api/modules/business.api");
        const response = await businessApi.getNumber(businessId);
        this.number = response.data.data;
      } catch (error) {
        console.error("Error getting business number:", error);
      }
    },

    async initializeBusinessData(businessId) {
      await Promise.all([this.getNumber(businessId), this.fetchFilters(businessId)]);
    },

    async updateProductStatus(productId, status) {
      try {
        await productApi.updateStatus(productId, { status });
        const index = this.products.findIndex((p) => p.id === productId);
        if (index !== -1) this.products[index] = { ...this.products[index], status };
        return true;
      } catch (error) {
        console.error("Failed to update product status:", error);
        throw error;
      }
    },

    async updateProductActive(productId) {
      try {
        await productApi.toggleActive(productId);
        queryClient.invalidateQueries({ queryKey: ["products"] });
        return true;
      } catch (error) {
        console.error("Failed to update product active status:", error);
        throw error;
      }
    },
  },
});
