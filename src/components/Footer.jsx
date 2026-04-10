'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Footer() {
  const { status } = useSession();
  const currentYear = new Date().getFullYear();

  let navLinks = [];
  if (status === "authenticated") {
    navLinks = [
      { href: '/', label: 'Home' },
      { href: '/projects', label: 'Projects' },
      { href: '/invoices', label: 'Invoices' },
      { href: '/clients', label: 'Clients' },
      { href: '/contact', label: 'Contact' },
      { href: '/about', label: 'About' },
    ];
  } else {
    navLinks = [
      { href: '/', label: 'Home' },
      { href: '/contact', label: 'Contact' },
      { href: '/about', label: 'About' },
    ];
  }

  return (
    <footer className="bg-green-50 border-t border-green-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">

          <div className="text-center md:text-left">
            <Link href="/" className="inline-block text-2xl font-black mb-3">
              <span className="bg-clip-text text-transparent bg-linear-to-r from-green-600 via-emerald-500 to-teal-600">
                monitorInvoice
              </span>
            </Link>
            <p className="text-gray-600 text-sm max-w-xs">
              Simplify your invoicing process with our powerful SaaS solution.
            </p>
          </div>


          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-green-600 transition-all duration-300 text-sm font-medium hover:scale-105"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>


        <div className="mt-8 pt-8 border-t border-green-200/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            © {currentYear} monitorInvoice. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
