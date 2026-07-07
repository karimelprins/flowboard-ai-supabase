export type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'pending' | 'inactive';
  created_at: string;
};

export type ProductRecord = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'draft' | 'archived';
  created_at: string;
};

export type OrderRecord = {
  id: string;
  user_id: string | null;
  product_id: string | null;
  amount: number;
  status: 'paid' | 'pending' | 'cancelled';
  created_at: string;
  users?: { name: string; email: string } | null;
  products?: { name: string; category: string } | null;
};
