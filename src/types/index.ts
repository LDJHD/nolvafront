import React from "react";

export interface WrapperAnimationFCProps {
  children: React.ReactNode | React.ReactNode[];
  triggerOnce: boolean;
  className: string;
  index?: any;
  postData?: any;
}

export type ProductType = {
  id: number;
  name: string;
  thumb: string;
  price: string;
  count: number;
  color: string;
  size: string;
};

export type ProductStoreType = {
  id: number;
  name: string;
  thumb: string;
  price: number;
  count: number;
  color: string;
  size: string;
};

export enum TemplateEnum {
  THEME = "theme",
  TEMPLATE = "template",
}

export interface ProductData {
  id: number;
  title: string;
  newPrice: number;
  waight: string;
  image: string;
  imageTwo: string;
  date: string;
  status: string;
  rating: number;
  oldPrice: number;
  location: string;
  brand: string;
  sku: number;
  category: string;
  nombre_ecran: string;
  quantity: number;
  description: string;
  features: any[];
  nom_categorie: string;
}

export interface ProductContentType {
  data?: ProductData[];
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  hasPaginate?: boolean;
  url?: string;
}

export interface Product {
  id: string;
  title: string;
  image: string;
  newPrice: number;
}

export interface Order {
  orderId: string;
  date: string;
  shippingMethod: string;
  totalItems: number;
  totalPrice: number;
  status: string;
  products: Product[];
}
