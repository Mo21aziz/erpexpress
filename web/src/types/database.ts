export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  role_id: string;
  refreshToken?: string | null;
  role?: Role;
  employee?: any;
  admin?: any;
}

// Type for User with required role data
export interface UserWithRole extends Omit<User, "role"> {
  role: Role;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Article {
  id: string;
  name: string;
  description?: string;
  price: number | null;
  collisage: string;
  type: string; // "catering" or "sonodis"
  numero?: number;
  quantite_a_stocker: any; // Changed to any to handle Decimal
  quantite_a_demander: any; // Changed to any to handle Decimal
  category_id: string;
  category?: {
    id: string;
    name: string;
  };
}

export interface BonDeCommande {
  id: string;
  code: string;
  created_at: string;
  target_date: string;
  description: string;
  status: string;
  employee_id: string;
  employee?: {
    id: string;
    user_id: string;
    user?: {
      id: string;
      username: string;
      email: string;
    };
  };
  categories: BonDeCommandeCategory[];
}

export interface BonDeCommandeCategory {
  id: string;
  category_id: string;
  bon_de_commande_id: string;
  quantite_a_stocker: any; // Changed to any to handle Decimal
  quantite_a_demander: any; // Changed to any to handle Decimal
  category: {
    id: string;
    name: string;
    description?: string;
  };
}
