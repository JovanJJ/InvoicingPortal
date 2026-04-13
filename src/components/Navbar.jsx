'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  console.log(status);
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  let navLinks = [];
  if (status === "authenticated") {
    navLinks = [
      { href: '/', label: 'Home' },
      { href: '/projects', label: 'Projects' },
      { href: '/invoices', label: 'Invoices' },
      { href: '/clients', label: 'Clients' },
      { href: '/help', label: 'Help' },
      { href: '/contact', label: 'Contact' },
      { href: '/settings', label: 'Settings' },
    ];
  } else {
    navLinks = [
      { href: '/', label: 'Home' },
      { href: '/contact', label: 'Contact' },
      { href: '/about', label: 'About' },
    ];
  }






  return (
    <nav className="bg-white border-b border-green-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-13">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link href="/" >
              <span className="text-xl md:text-2xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-green-600 via-emerald-500 to-teal-600">
                monitorInvoice
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-gray-600 text-[1rem] ${link.label === "Settings" && "md:hidden"} hover:text-green-600 transition-all duration-300 text-sm font-medium hover:scale-105`}
              >
                {link.label}
              </Link>
            ))}
          </div>


          <div className="hidden md:flex items-center space-x-4 rounded-full hover:bg-green-100 transition">
            <Link href="/settings" className="p-2 text-gray-700 hover:text-green-600 transition-colors">
              <Image src="/settings.svg" alt="img" width={25} height={25} />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              {isOpen ? <Image src="/x.svg" alt='x' width={24} height={24} /> : <Image src="/hamburger-menu.svg" alt='menu' width={30} height={30} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden flex flex-col text-center gap-4 pb-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-gray-700 hover:text-green-600 hover:bg-gray-100 rounded transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
