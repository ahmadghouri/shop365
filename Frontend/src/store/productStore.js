import { API_BASE_URL } from "../config/api";
import { defineStore } from "pinia";
import axios from "axios";

export const useProductStore = defineStore("products", {
  state: () => ({
    products: [],
    product: null,
    restaurantProducts: [],
  }),
  actions: {
    async getProducts(id) {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/all-products/${id}`
        );
        this.products = response.data.data;
        console.log("Fetched products:", this.products);
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    },

    // get single product

    async getProduct(id) {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/products/${id}`);
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
        const response = await axios.put(
          `${API_BASE_URL}/api/products/${id}`,
          productInfo
        );

        const index = this.products.findIndex((product) => product.id === id);

        if (index !== -1) {
          this.products[index] = {
            ...this.products[index],
            ...productInfo,
          };
        }
      } catch (error) {
        console.error("Error updating product:", error);
      }
    },

    // for getting products related to a restaurant

    async getRestaurantProducts() {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/restaurantAdmin/allproducts`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        this.products = response.data.data;
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    },
  },
});
