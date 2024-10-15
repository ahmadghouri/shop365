import { API_BASE_URL } from "../config/api";
import { defineStore } from "pinia";
import axios from "axios";

export const useProductStore = defineStore("products", {
  state: () => ({
    products: [],
    product: null,
    restaurantProducts: [],
    number: "",
  }),
  actions: {
    async getProducts(id) {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/all-products/${id}`
        );
        this.products = response.data.data;
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

    async applyDiscount(productId, discount) {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/restaurantAdmin/products/${productId}/apply-discount`,
          { discount },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
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
