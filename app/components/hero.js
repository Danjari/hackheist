'use client'

import { useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Image from 'next/image';

const navigation = [
  { name: 'Features', href: '#' },
  { name: 'How it Works', href: '#' },
  { name: 'Pricing', href: '#' },
  { name: 'Contact', href: '#' },
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="relative bg-gradient-to-r from-slate-800 via-gray-700 to-slate-600 text-white min-h-screen">
      {/* Navbar */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between px-6 py-5 lg:px-8">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">AYN</span>
              <Image
                src="/logo.png" 
                alt="AYN Logo"
                width={50}
                height={50}
                className="h-12 w-auto"
              />
            </a>
          </div>
          <div className="hidden lg:flex lg:gap-x-10">
            {navigation.map((item) => (
              <a key={item.name} href={item.href} className="text-sm font-medium text-gray-300 hover:text-white transition">
                {item.name}
              </a>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <a href="#" className="text-sm font-semibold text-gray-300 hover:text-white transition">
              Sign Up <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </nav>

        <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
          <div className="fixed inset-0 z-50 bg-gray-800 bg-opacity-50" />
          <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gray-900 px-6 py-6 sm:max-w-sm">
            <div className="flex items-center justify-between">
              <a href="#" className="-m-1.5 p-1.5">
                <Image
                  src="/logo.png"
                  alt="AYN Logo"
                  width={50} 
                  height={50} 
                />
              </a>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-400"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-6 space-y-4">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block text-base font-medium text-gray-300 hover:text-white transition"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </DialogPanel>
        </Dialog>
      </header>

      {/* Hero Section */}
            {/* Hero Section */}
            <div className="relative overflow-hidden flex flex-col items-center justify-center h-screen text-center">
        {/* Background Image (Necklace on the Right) */}
        <div className="">
          <Image
            src="/necklace.png"
            alt="AYN Device"
            width={550} // Adjust for responsiveness
            height={550}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 opacity-30 md:opacity-50 lg:opacity-70 drop-shadow-2xl"
          />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 pt-32 pb-24 lg:pt-48 lg:pb-32">
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight sm:text-7xl text-slate-100">
            Empower Vision. Experience Freedom.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-300">
            AYN is an AI-powered wearable assistant that describes the world around you. 
            Designed for the visually impaired, built for independence.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a
              href="/ayn"
              className="rounded-md bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-md hover:bg-blue-500 transition"
            >
              Get Started
            </a>
            <a href="#" className="text-lg font-semibold px-6 py-3 text-gray-300 hover:text-white transition">
              Learn More →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}