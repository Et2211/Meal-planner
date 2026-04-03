export function formatDate(date: string | Date, includeYear = false): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(includeYear ? { year: "numeric" } : {}),
  });
}
