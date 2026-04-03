import { cn } from "@/lib/utils";

interface ErrorAlertProps {
  message: string | null | undefined;
  variant?: "error" | "success";
  className?: string;
}

export const ErrorAlert = ({
  message,
  variant = "error",
  className,
}: ErrorAlertProps) => {
  if (!message) return null;

  return (
    <p
      className={cn(
        "text-sm px-3 py-2 rounded-lg",
        variant === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700",
        className,
      )}
    >
      {message}
    </p>
  );
};
