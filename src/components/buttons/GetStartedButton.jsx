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
            <Link href="/projects" className="text-xl font-extrabold text-green-500 border hover:bg-green-100 transition px-5 py-2 rounded-2xl tracking-tight ">Create project</Link>
    );
}