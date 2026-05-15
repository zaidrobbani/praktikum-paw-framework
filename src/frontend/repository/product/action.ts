import {
  AllProducts,
  Product,
  CreateProductRequest,
  UpdateProductRequest,
} from "./dto";
import { tryCatch } from "@/frontend/lib/tryCatch";
import { ActionResult } from "@/frontend/lib/ResponseResult";
import Axios from "@/frontend/hooks/Axios";

const AxiosHelper = () => {
  return Axios();
};

const { axiosPrivate } = AxiosHelper();

export const productRepository = {
  getAllProducts: async (): Promise<ActionResult<AllProducts>> => {
    const result = await tryCatch(axiosPrivate.get<AllProducts>("/products"));

    if (result.error) {
      return { success: false, error: result.error as Error };
    }

    return { success: true, data: result.data.data };
  },

  getProductById: async (id: string): Promise<ActionResult<Product>> => {
    const result = await tryCatch(axiosPrivate.get<Product>(`/products/${id}`));

    if (result.error) {
      return { success: false, error: result.error as Error };
    }

    return { success: true, data: result.data.data };
  },

  createProduct: async (
    data: CreateProductRequest,
  ): Promise<ActionResult<Product>> => {
    const result = await tryCatch(
      axiosPrivate.post<Product>("/products", data),
    );

    if (result.error) {
      return { success: false, error: result.error as Error };
    }

    return { success: true, data: result.data.data };
  },

  updateProduct: async (
    id: string,
    data: UpdateProductRequest,
  ): Promise<ActionResult<Product>> => {
    const result = await tryCatch(
      axiosPrivate.put<Product>(`/products/${id}`, data),
    );

    if (result.error) {
      return { success: false, error: result.error as Error };
    }

    return { success: true, data: result.data.data };
  },

  deleteProduct: async (id: string): Promise<ActionResult<void>> => {
    const result = await tryCatch(axiosPrivate.delete(`/products/${id}`));

    if (result.error) {
      return { success: false, error: result.error as Error };
    }

    return { success: true, data: undefined };
  },
} as const;
