import { API_BASE_URL } from "../config/api";
import { defineStore } from "pinia";
import axios from "axios";

export const useProductStore = defineStore("products", {
  state: () => ({
    productsListBusinessId: null,
    selectedFilter: "All",
    searchTerm: "",
    filters: [],
    products: [],
    product: null,
    restaurantProducts: [],
    number: "",
    currentPage: 0,
    totalPages: 1,
    adminProducts: [],
  }),
  actions: {
    clearData() {
      this.selectedFilter = "All";
      this.searchTerm = "";
      this.filters = [];
      this.products = [];
      this.product = null;
      this.restaurantProducts = [];
      this.number = "";
      this.currentPage = 0;
      this.totalPages = 1;
    },
    async getProducts(id, search = "", page = 1) {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/all-products/${id}`,
          {
            params: {
              search: search,
              page: page,
            },
          }
        );

        for (const product of response.data.data.data) {
          if (this.products.some((p) => p.id === product.id)) {
            continue;
          }
          this.products.push(product);
        }

        this.currentPage = response.data.data.current_page;
        this.totalPages = response.data.data.last_page;
        return this.products;
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    },

    async fetchFilters (businessId){
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

    async getProductPOS(bodyInfo) {
      try {
        const response = await axios.post(
          "https://webapi.cyberneticonline.com/api/product/getProductList",
          bodyInfo,
          {
            headers: {
              ConStr: "ConStr4",
            },
          }
        );
      } catch (error) {
        console.error("Failed to fetch products from POS API", error);
      }
    },

    // get single product

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
        const response = await axios.delete(
          `${API_BASE_URL}/api/products/${id}`
        );
        this.products = this.products.filter((product) => product.id !== id);
        this.adminProducts = this.products.filter(
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

        const index = this.products.findIndex((product) => product.id === id);
        const index2 = this.adminProducts.findIndex(
          (product) => product.id === id
        );

        if (index2 !== -1) {
          this.adminProducts[index] = {
            ...this.adminProducts[index],
            ...productInfo,
          };
        } else {
          console.warn("Product not found in the list for update.");
        }

        if (index !== -1) {
          this.products[index] = {
            ...this.products[index],
            ...productInfo,
          };
        } else {
          console.warn("Product not found in the list for update.");
        }
      } catch (error) {
        console.error("Error updating product:", error);
      }
    },

    // for getting products related to a restaurant

    async getRestaurantProducts(search = "") {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/restaurantAdmin/allproducts`,
          {
            headers: {},
            params: { search },
          }
        );
        this.products = response.data.data;
      } catch (error) {
        console.error("Failed to fetch products", error);
        throw error;
      }
    },

    async applyDiscount(productId, discount) {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/restaurantAdmin/products/${productId}/apply-discount`,
          { discount },
          {
            headers: {},
          }
        );
        const updatedProduct = response.data.data;

        // Update the product in the store with the new discount
        const index = this.products.findIndex(
          (product) => product.id === productId
        );
        if (index !== -1) {
          this.products[index] = {
            ...this.products[index],
            discount: updatedProduct.discount,
            final_price: updatedProduct.final_price, // assuming the backend returns the updated price
          };
        }
        console.log(
          `Discount applied: ${updatedProduct.discount}% to product ID: ${productId}`
        );
      } catch (error) {
        console.error("Failed to apply discount", error);
      }
    },

    async getNumber(businessId) {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/getNumber/${businessId}`
        );
        this.number = response.data.data;
      } catch (error) {
        console.error("Error editing business:", error);
      }
    },
  },
});
