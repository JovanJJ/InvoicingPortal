'use client'

import Image from "next/image";
import { useEffect } from "react";

import GetStartedButton from "@/components/buttons/GetStartedButton";

export default function Home() {

  useEffect(() => {
    const observerOptions = {
      root: null, 
      threshold: 0 
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          
          entry.target.classList.remove('opacity-0');
          entry.target.classList.add('opacity-100');

          
          if (entry.target.classList.contains('reveal-from-left')) {
            entry.target.classList.remove('-translate-x-full');
            entry.target.classList.add('translate-x-0');
          }

          if (entry.target.classList.contains('reveal-from-right')) {
            entry.target.classList.remove('translate-x-full');
            entry.target.classList.add('translate-x-0');
          }

          
          if (entry.target.classList.contains('reveal-on-scroll')) {
            entry.target.classList.remove('translate-y-10');
            entry.target.classList.add('translate-y-0');
          }

        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.reveal-on-scroll, .reveal-from-left, .reveal-from-right');
    elements.forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <header className="relative border-b border-gray-200 h-[60vh] mb-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-200 via-white to-green-200 flex items-center justify-center">
          <div className="px-5 relative">
            <div className="relative h-full flex items-center justify-center">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-center text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
                  Simplify Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">Invoicing</span> <br className="hidden md:block" /> and Time Tracking
                </h1>
                <p className="text-center text-lg md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  Manage projects, track work hours, and send professional invoices. Monitor your progress and get paid faster — all in one place.
                </p>
                <div className="flex justify-center mt-12 scale-110">
                  <GetStartedButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-6xl w-full mx-auto">
        <div className="reveal-on-scroll opacity-0 translate-y-10 transition-all duration-700 ease-out border border-gray-300 shadow-xl rounded-tr-4xl rounded-tl-4xl">
          <div className="bg-gradient-to-r from-green-100 to-green-200 rounded-tl-4xl rounded-tr-4xl">
            <p className="text-center p-3 md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Easily organize your work by creating projects for every client or task. Set deadlines, assign tasks, and keep everything in one place.
            </p>
          </div>

          <div className="bg-green-200">
            <div className="relative aspect-video">
              <Image src="/dashboard-preview.png" alt="img" fill className="object-fit" />
            </div>
          </div>
        </div>

        <div className="reveal-on-scroll opacity-0 translate-y-10 transition-all duration-700 ease-out mt-10 border border-gray-300 shadow-xl rounded-tr-4xl rounded-tl-4xl">
          <div className="bg-gradient-to-l from-purple-100 to-rose-200 rounded-tl-4xl rounded-tr-4xl">
            <p className="text-center p-3 md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Easily stop your timer and save your session with detailed notes. Add commit messages, track work logs, and update any project details whenever needed — all in one place.
            </p>
          </div>

          <div className="bg-purple-200 md:pt-0">
            <div className="relative aspect-video">
              <Image src="/two.png" alt="img" fill className="object-fit" />
            </div>
          </div>
        </div>


        <div className="mt-10 border border-gray-300 shadow-xl rounded-tr-4xl rounded-tl-4xl bg-gradient-to-r from-blue-100 to-purple-200"> 
          <div className="rounded-tl-4xl rounded-tr-4xl">
            <p className="text-center p-3 md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Review and update every detail before sending your invoice. Edit any field to ensure accuracy, and track payments easily with a dedicated section for each invoice where you can record received amounts.
            </p>

          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
            <div className="reveal-from-left transform relative aspect-square transition-transform duration-1000 ease-out -translate-x-full opacity-0">
              <Image src="/invoice2.png" alt="img" fill className="object-fit" />
            </div>
            <div className="reveal-from-right transform relative aspect-square transition-transform duration-1000 ease-out translate-x-full opacity-0">
              <Image src="/invoice1.png" alt="img" fill className="object-fit" />
            </div>
          </div>
        </div>
        <div className="reveal-on-scroll opacity-0 translate-y-10 transition-all duration-700 ease-out mt-10 border border-gray-300 shadow-xl rounded-tr-4xl rounded-tl-4xl bg-gradient-to-l from-violet-100 to-purple-200">
          <div className="rounded-tl-4xl rounded-tr-4xl">
            <p className="text-center p-3 md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Monitor your project from every angle. See progress as a percentage of completed work, track payments in real time, and analyze your productivity with daily time tracking charts.
            </p>
          </div>

          <div className="bg-pink-200 md:pt-0">
            <div className="relative aspect-video">
              <Image src="/four.png" alt="img" fill className="object-fit" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

