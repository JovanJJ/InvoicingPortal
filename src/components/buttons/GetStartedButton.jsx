'use client'
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react";
import AuthButton from "../authButton";
import Link from "next/link";
export default function GetStartedButton() {
    const session = useSession();
    const router = useRouter();
    return (
        session.status !== "authenticated"
            ?
            <AuthButton />
            :
            <Link href="/projects" className="text-xl font-extrabold tracking-tight text-slate-900 animate-pulse">Create project</Link>
    );
}