"use client";

import { useRouter } from "next/navigation";

export default function PushUrl(pathname, slug){
 const router = useRouter(); 

 router.push(`/${pathname}/${slug}`);
}