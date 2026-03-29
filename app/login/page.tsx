import { LoginForm } from "@/components/LoginForm";
import { ChefHat } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-stone-100 px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-brand-500 text-white p-3 rounded-2xl mb-4">
            <ChefHat size={32} />
          </div>
          <h1 className="text-3xl font-bold text-stone-900">Recipe Collection</h1>
          <p className="text-stone-500 mt-1">Save recipes, build shopping lists</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
