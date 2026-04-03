

import AuthButton from "@/components/authButton";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function LoginPage() {
    const session = await getServerSession(authOptions);
    if (session) { redirect('/') }
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#fdfdfd] relative overflow-hidden">

            <div className="relative z-10 w-full max-w-md px-6">


                <div className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-[2.5rem] p-10 md:p-12">
                    <div className="text-center mb-10">


                    </div>

                    <div className="flex flex-col items-center justify-center">
                        <AuthButton />
                    </div>

                    <div className="mt-10 pt-8 border-t border-gray-100">
                        <p className="text-center text-xs text-gray-400">
                            By continuing, you agree to our
                            <Link href="/terms" className="text-gray-600 hover:underline mx-1">Terms of Service</Link>
                            and
                            <Link href="/privacy" className="text-gray-600 hover:underline mx-1">Privacy Policy</Link>.
                        </p>
                    </div>
                </div>


            </div>
        </div>
    );
}