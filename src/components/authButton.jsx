"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function AuthButton() {
  const { data: session } = useSession();

  return (
    <button
      onClick={() => signIn("google")}
      className="group cursor-pointer relative flex items-center gap-3 px-8 py-3.5 bg-white text-gray-700 font-semibold rounded-2xl border-2 border-gray-100 shadow-lg hover:shadow-xl hover:border-blue-100 hover:scale-[1.03] active:scale-[0.97] transition-all transform duration-300"
    >
      <Image src="/google-icon.svg" alt="google" width="24" height="24" />
      Login to get started
    </button>
  );
}