'use client'

import Image from "next/image";
import { useEffect } from "react";
import invoiceImage from "../../public/invoice.png";
import chart from "../../public/chart.png";

import GetStartedButton from "@/components/buttons/GetStartedButton";

export default function Home() {

  useEffect(() => {
    const observerOptions = {
      root: null, // use the viewport
      threshold: 0.1 // trigger when 10% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Remove the starting state and add the "active" state
          entry.target.classList.remove('opacity-0', 'translate-y-10');
          entry.target.classList.add('opacity-100', 'translate-y-0');
        }
      });
    }, observerOptions);

    // Target all elements with the class
    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <header className="relative border-b border-gray-200 h-[60vh] mb-10">
        <div className="absolute z-50  bottom-0 top-1/3 relative max-w-60 w-full aspect-video">
          <Image src="/finalchart.png" alt="img" fill className="object-fit" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-green-100 via-white to-green-100  flex items-center justify-center">

          <div className="px-5">
            <h1 className="text-center text-2xl md:text-3xl lg:text-4xl mb-5">Simplify Your Invoicing and Time Tracking</h1>
            <p className="text-center md:text-xl">Manage projects, track work hours, monitor progress, and send professional invoices.</p>
            <p className="text-center text-xl mt-5">All in one place!</p>
            <GetStartedButton />
          </div>
        </div>
      </header>
      <div className="max-w-6xl w-full mx-auto">
        <div className="reveal-on-scroll opacity-0 translate-y-10 transition-all duration-700 ease-out grid grid-cols-1 bg-purple-50 md:grid-cols-2 max-w-3xl w-full ml-auto border border-rose-100 shadow-xs rounded-3xl">
          <div className="flex items-center text-center py-10 px-5">“Easily organize your work by creating projects for every client or task. Set deadlines, assign tasks, and keep everything in one place.”</div>
          <div className="aspect-square relative"><Image fill src={invoiceImage} alt="img" className="object-cover rounded-r-3xl" /></div>
        </div>
        <div className="reveal-on-scroll opacity-0 translate-y-10 transition-all duration-700 ease-out grid grid-cols-1 md:grid-cols-2 bg-blue-50 max-w-3xl w-full mr-auto border mt-10 border-rose-100 shadow-xs rounded-3xl">
          <div className="flex items-center text-center py-10 px-5">“Track your work hours in real time with our built-in stopwatch. Record the exact time spent on each task or project without hassle. After every session describe what you have done by commiting message.”</div>
          <div className="aspect-square relative"><Image fill src={invoiceImage} alt="img" className="object-cover rounded-r-3xl" /></div>
        </div>
        <div className="reveal-on-scroll opacity-0 translate-y-10 transition-all duration-700 ease-out grid grid grid-cols-1 md:grid-cols-2 max-w-3xl w-full ml-auto border mt-10 border-green-200 shadow-xs rounded-3xl">
          <div className="flex items-center text-center py-10 px-5">“Visualize your work at a glance. See how much time you’ve spent each day with our easy-to-read daily time tracking chart.”</div>
          <div className="aspect-square relative"><Image fill src={invoiceImage} alt="img" className="object-cover rounded-r-3xl" /></div>
        </div>
        <div className="reveal-on-scroll opacity-0 translate-y-10 transition-all duration-700 ease-out grid grid grid-cols-1 md:grid-cols-2 max-w-3xl w-full mr-auto border mt-10 border-green-200 shadow-xs rounded-3xl">
          <div className="flex items-center text-center py-10 px-5">“Generate professional invoices in seconds. Preview your invoice, tweak hours or session notes, add or remove messages, and then download it as a PDF or send it straight to your client — hassle-free.”</div>
          <div className="aspect-square relative"><Image fill src={chart} alt="img" className="object-fit rounded-r-3xl" /></div>
        </div>
        <div className="mx-auto py-10 ">
          <div className="text-center text-2xl">Try it out</div>
          <div className="text-center md:text-xl">Everything just flows! If you want to learn more, explore all the details on Help Page.</div>
        </div>

      </div>
    </div>
  )
}
