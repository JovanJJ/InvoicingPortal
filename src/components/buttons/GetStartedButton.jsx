'use client'
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react";
import Link from "next/link";
export default function GetStartedButton() {
    const session = useSession();
    const router = useRouter();
    return (
        session.status !== "authenticated"
        ?
         <button onClick={() => router.replace('/login')} className="animate-bounce bg-green-400 hover:bg-green-500 active:bg-green-300 cursor-pointer px-2 md:px-5 py-2 md:py-3 rounded-xl text-white mx-auto block ">GET STARTED</button>
        :
        <Link href="/projects" className="text-xl font-extrabold tracking-tight text-slate-900">You are logged in</Link>
    );
}