import { Authenticated, Unauthenticated } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { Toaster } from "sonner";
import { ShoppingList } from "./ShoppingList";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="w-full mx-auto">
          <Content />
        </div>
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8">
      <Unauthenticated>
        <div className="text-center p-8">
          <h1 className="text-5xl font-bold accent-text mb-4">SnapList</h1>
          <p className="text-xl text-slate-600">Sign in to manage your shopping lists</p>
        </div>
        <SignInForm />
      </Unauthenticated>
      <Authenticated>
        <ShoppingList />
      </Authenticated>
    </div>
  );
}
