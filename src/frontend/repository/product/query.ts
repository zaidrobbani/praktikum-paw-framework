'use client';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productRepository } from "./action";
import { CreateProductRequest, UpdateProductRequest } from "./dto";

export const PRODUCT_QUERY_KEYS = {
  all: ["products"] as const,
  detail: (id: string) => ["products", id] as const,
};

// Hook untuk semua products
export const useProductsQuery = () => {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.all,
    queryFn: async () => {
      const result = await productRepository.getAllProducts();
      if (!result.success) throw result.error;
      return result.data;
    },
  });
};

// Hook terpisah untuk product by ID
export const useProductByIdQuery = (id: string) => {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const result = await productRepository.getProductById(id);
      if (!result.success) throw result.error;
      return result.data;
    },
    enabled: !!id,
  });
};

// Hook untuk semua mutations
export const useProductMutation = () => {
  const queryClient = useQueryClient();

  const createProduct = useMutation({
    mutationFn: async (data: CreateProductRequest) => {
      const result = await productRepository.createProduct(data);
      if (!result.success) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.all });
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductRequest }) => {
      const result = await productRepository.updateProduct(id, data);
      if (!result.success) throw result.error;
      return result.data;
    },
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.all });
      queryClient.setQueryData(PRODUCT_QUERY_KEYS.detail(updatedProduct.id), updatedProduct);
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const result = await productRepository.deleteProduct(id);
      if (!result.success) throw result.error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.all });
    },
  });

  return { createProduct, updateProduct, deleteProduct };
};