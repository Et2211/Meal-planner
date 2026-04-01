"use server";

import { revalidateTag } from "next/cache";

export async function revalidateUserRecipes(userId: string) {
  await Promise.resolve();
  revalidateTag(`recipes-${userId}`, "default");
}

export async function revalidateRecipe(id: string, userId: string) {
  await Promise.resolve();
  revalidateTag(`recipe-${id}`, "default");
  revalidateTag(`recipes-${userId}`, "default");
}

export async function revalidateRatings() {
  await Promise.resolve();
  revalidateTag("ratings", "default");
}

export async function revalidateUserShoppingLists(userId: string) {
  await Promise.resolve();
  revalidateTag(`shopping-lists-${userId}`, "default");
}

export async function revalidateShoppingList(id: string, userId: string) {
  await Promise.resolve();
  revalidateTag(`shopping-list-${id}`, "default");
  revalidateTag(`shopping-lists-${userId}`, "default");
}
