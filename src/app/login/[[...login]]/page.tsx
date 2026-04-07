import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fc] flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Sunakshini</h1>
        <p className="text-sm text-gray-400 mt-1">Sign in to continue</p>
      </div>
      <SignIn />
    </main>
  );
}
