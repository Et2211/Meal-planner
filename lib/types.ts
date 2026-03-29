export interface Ingredient {
  raw: string;
  name: string;
  quantity: number | null;
  unit: string | null;
}

export interface Recipe {
  id: string;
  user_id: string;
  title: string;
  source_url: string;
  image_url: string | null;
  ingredients: Ingredient[];
  instructions: string[];
  created_at: string;
}

export interface ScrapedRecipe {
  title: string;
  source_url: string;
  image_url: string | null;
  ingredients: Ingredient[];
  instructions: string[];
}

export interface ShoppingListItem {
  name: string;
  quantity: number | null;
  unit: string | null;
  entries: string[];
}

export interface SavedListItem {
  label: string;
  checked: boolean;
  custom: boolean;
}

export interface SavedShoppingList {
  id: string;
  user_id: string;
  name: string;
  items: SavedListItem[];
  recipe_ids: string[];
  created_at: string;
}
