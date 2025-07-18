

export interface InsertCategory {
  category_name: string;
  category_image?: string; 
}

export interface UpdateCategory {
  category_name: string;
  category_image?: string; // ✅ optional for update
}