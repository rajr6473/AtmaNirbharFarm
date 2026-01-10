import { categories, products, orders } from '../utils/dummyData';

// LATER replace with axios calls
export const loginApi = async () => {
  return { success: true, token: 'dummy-token' };
};

export const getCategoriesApi = async () => categories;

export const getProductsApi = async () => products;

export const getOrdersApi = async () => orders;
