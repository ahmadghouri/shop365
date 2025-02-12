import { API_BASE_URL } from "../config/api";
import { defineStore } from "pinia";
import axios from "axios";

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
    restaurantProducts: [],
    productsList: [],
    number: "",
    currentPage: 0,
    totalPages: 1,
    adminProducts: [],
    isLoading: false,
  }),

  getters: {
    currentProducts: (state) => {
      return state.products;
    },
  },

  actions: {
    clearData() {
      this.selectedFilter = "All";
      this.searchTerm = "";
      this.filters = [];
      this.products = [];
      this.product = null;
      this.restaurantProducts = [];
      this.productsList = [];
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
        const response = await axios.get(
          `${API_BASE_URL}/api/restaurantAdmin/allproducts`,
          {
            params: {
              search,
              page,
            },
          }
        );

        const { data, current_page, last_page, total } = response.data.data;

        // If it's page 1, reset the products array
        if (page === 1) {
          this.products = data;
        } else {
          // Otherwise append new products
          this.products = [...this.products, ...data];
        }

        this.currentPage = current_page;
        this.totalPages = last_page;
        this.total = total;

        return this.products;
      } catch (error) {
        console.error("Failed to fetch restaurant products", error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async getProducts(id, search = "", page = 1) {
      try {
        this.setBusinessContext(id, "child");

        const response = await axios.get(
          `${API_BASE_URL}/api/all-products/${id}`,
          {
            params: { search, page },
          }
        );

        console.log(response.data);

        const data = response.data.data;
        const newProducts = data.products.data;
        this.number = data.number;

        let types = data.types;

        const uniqueFilters = [
          ...new Set(types.map((product) => product.type)),
        ];
        this.filters = ["All", ...uniqueFilters];

        // If it's the first page, replace products array
        // Otherwise append new products
        if (page === 1) {
          this.products = newProducts;
        } else {
          this.products = [...this.products, ...newProducts];
        }

        this.currentPage = data.products.current_page;
        this.totalPages = data.products.last_page;

        return this.products;
      } catch (error) {
        console.error("Failed to fetch products", error);
        throw error;
      }
    },

    async fetchFilters(businessId) {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/businessTypes/${businessId}`
        );
        const uniqueFilters = [
          ...new Set(response.data.data.map((product) => product.type)),
        ];
        this.filters = ["All", ...uniqueFilters];
      } catch (error) {
        console.error("Failed to fetch filters from the backend.");
      }
    },

    async getProductsAdmin(id, search = "") {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/all-products/${id}/admin`,
          {
            params: { search },
          }
        );

        this.adminProducts = response.data.data;
      } catch (error) {
        console.error(error);
      }
    },

    async getProduct(id, business_id) {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/products/${id}`, {
          params: { business_id },
        });
        this.product = response.data.data;
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    },

    async deleteProduct(id) {
      try {
        await axios.delete(`${API_BASE_URL}/api/products/${id}`);
        this.products = this.products.filter((product) => product.id !== id);
        this.adminProducts = this.adminProducts.filter(
          (product) => product.id !== id
        );
      } catch (error) {
        console.error("Failed to delete product", error);
      }
    },

    async storeProduct(productInfo) {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/products`,
          productInfo
        );
        this.products.push(response.data.data);
      } catch (error) {
        console.error("Error adding product:", error);
      }
    },

    async updateProduct(productInfo, id) {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/products/${id}`,
          productInfo,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Update product in the list
        const index = this.products.findIndex((p) => p.id === id);
        if (index !== -1) {
          this.products[index] = {
            ...this.products[index],
            ...response.data.data,
          };
        }
      } catch (error) {
        console.error("Error updating product:", error);
      }
    },

    async applyDiscount(productId, discount, discountType) {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/restaurantAdmin/products/${productId}/apply-discount`,
          {
            discount,
            discount_type: discountType,
          }
        );

        const updatedProduct = response.data.data;

        const index = this.products.findIndex((p) => p.id === productId);

        if (index !== -1) {
          this.products[index] = {
            ...this.products[index],
            discount: updatedProduct.discount,
            discount_type: updatedProduct.discount_type,
            final_price: updatedProduct.final_price,
          };
        }
      } catch (error) {
        console.error("Failed to apply discount", error);
        throw error;
      }
    },

    async getNumber(businessId) {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/getNumber/${businessId}`
        );
        this.number = response.data.data;
        console.log(response.data.data);
        console.log(this.number);
      } catch (error) {
        console.error("Error getting business number:", error);
      }
    },

    async initializeBusinessData(businessId) {
      try {
        await Promise.all([
          this.getNumber(businessId),
          this.fetchFilters(businessId),
        ]);
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
});
