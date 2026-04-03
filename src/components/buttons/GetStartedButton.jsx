'use client'
import { useRouter } from "next/navigation"
import { Router } from "next/router";
export default function GetStartedButton() {
    const router = useRouter();
    return (
        <button onClick={() => router.replace('/login')} className="animate-bounce bg-green-400 hover:bg-green-500 active:bg-green-300 cursor-pointer px-2 md:px-5 py-2 md:py-3 rounded-xl text-white mx-auto block mt-10">GET STARTED</button>

    );
}