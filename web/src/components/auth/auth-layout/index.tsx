import React from "react";
import Image from "next/image";
import Link from "next/link";

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    showSignInLink?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, showSignInLink = false }) => {
    return (
        <div className="min-h-screen flex">
            {/* Left Side - Brand Section */}
            <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-tm-primary to-tm-primary-dark items-center justify-center p-12 relative">
                <div className="absolute top-8 left-8">
                    <Link href="/dashboard">
                        <Image src="/assets/logo.svg" alt="trumarket logo" width={115} height={44} />
                    </Link>
                </div>

                <div className="max-w-md text-center">
                    <div className="mb-8 flex justify-center">
                        <Link href="/dashboard">
                            <Image src="/assets/logo.svg" alt="trumarket logo" width={200} height={76} />
                        </Link>
                    </div>
                    <h2 className="text-3xl font-bold text-tm-white mb-4">
                        TRU MARKET
                    </h2>
                    <p className="text-lg text-tm-white opacity-90">
                        Agricultural Trade Financing Platform
                    </p>
                    <div className="mt-12 text-sm text-tm-white opacity-75">
                        © {new Date().getFullYear()} TruMarket
                    </div>
                </div>
            </div>

            {/* Right Side - Form Section */}
            <div className="w-full lg:w-3/5 flex flex-col items-center justify-center p-8 bg-tm-neutral-light">
                <div className="w-full max-w-xl flex-1 flex flex-col">
                    {/* Mobile Logo */}
                    <div className="lg:hidden mb-8 flex justify-center">
                        <Link href="/dashboard">
                            <Image src="/assets/logo.svg" alt="trumarket logo" width={115} height={44} />
                        </Link>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl font-bold text-tm-primary mb-8 text-center">
                        {title}
                    </h1>

                    {/* Form Content */}
                    <div className="flex-1">
                        {children}
                    </div>

                    {/* Copyright Notice */}
                    <div className="mt-8 text-center text-sm text-tm-text-light">
                        © 2025 TruMarket
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;

