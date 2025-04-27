import { Authenticated, Unauthenticated } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { ShoppingList } from "./ShoppingList";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm p-4 flex justify-between items-center border-b">
        <h2 className="text-xl font-semibold accent-text">SnapList</h2>
        <SignOutButton />
      </header>
      <main className="flex-1 p-8">
        <div className="w-full max-w-4xl mx-auto">
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
        <div className="text-center">
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
