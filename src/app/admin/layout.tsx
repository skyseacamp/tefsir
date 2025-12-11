"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        // Basic client-side check - API calls will enforce security
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }

            // Ideally verify token/role with an API call here
            // For now we'll rely on the API calls failing if not admin
            setAuthorized(true);
        };

        checkAuth();
    }, [router]);

    if (!authorized) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    const navItems = [
        { name: "Dashboard", path: "/admin" },
        { name: "Books", path: "/admin/books" },
        { name: "Authors", path: "/admin/authors" },
        { name: "Ayets", path: "/admin/ayets" },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md flex-shrink-0 hidden md:block">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-green-800">Tefsir Admin</h1>
                </div>
                <nav className="p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`block px-4 py-2 rounded-md transition-colors ${pathname === item.path
                                    ? "bg-green-100 text-green-800 font-medium"
                                    : "text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="pt-4 mt-4 border-t">
                        <Link href="/" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md">
                            Back to Site
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-white shadow-sm z-10 p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-green-800">Tefsir Admin</h1>
                {/* Mobile menu toggle could go here */}
            </div>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto mt-14 md:mt-0">
                {children}
            </main>
        </div>
    );
}
