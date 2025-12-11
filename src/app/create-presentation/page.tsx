"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/RichTextEditor";
import Link from "next/link";

type Book = {
    _id: string;
    name: string;
    author: { _id: string; name: string } | string;
};

type Ayet = {
    _id: string;
    sure: string;
    ayetNo: string;
    arapca: string;
};

export default function CreatePresentationPage() {
    const router = useRouter();
    const [books, setBooks] = useState<Book[]>([]);
    const [ayets, setAyets] = useState<Ayet[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Form State
    const [selectedBookId, setSelectedBookId] = useState("");
    const [selectedAyetId, setSelectedAyetId] = useState("");
    const [content, setContent] = useState("");

    // Derived State
    const selectedBook = books.find((b) => b._id === selectedBookId);
    const selectedAyet = ayets.find((a) => a._id === selectedAyetId);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }
            fetchData(token);
        };
        checkAuth();
    }, [router]);

    const fetchData = async (token: string) => {
        try {
            // Fetch Books
            const booksRes = await fetch("/api/admin/books?limit=1000", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const booksData = await booksRes.json();
            if (booksData.data) setBooks(booksData.data);

            // Fetch Ayets
            const ayetsRes = await fetch("/api/admin/ayets?limit=1000", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const ayetsData = await ayetsRes.json();
            if (ayetsData.data) setAyets(ayetsData.data);

        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to load necessary data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setSubmitting(true);

        if (!selectedBook || !selectedAyet || !content) {
            setError("Please fill in all fields.");
            setSubmitting(false);
            return;
        }

        // Get author name safely
        const authorName = typeof selectedBook.author === 'object'
            ? selectedBook.author.name
            : "Unknown Author";

        const payload = {
            kitap: selectedBook.name, // Sending name as per current schema, could send ID if updated
            mufessir: authorName,
            sure: selectedAyet.sure,
            ayetNo: selectedAyet.ayetNo,
            arapca: selectedAyet.arapca,
            aciklama: content,
        };

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/user-presentations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to create presentation");

            setSuccess("Presentation created successfully!");
            // Reset form
            setSelectedBookId("");
            setSelectedAyetId("");
            setContent("");

            // Redirect after short delay
            setTimeout(() => {
                router.push("/");
            }, 2000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Create New Presentation</h1>
                    <Link href="/" className="text-green-600 hover:text-green-800 font-medium">
                        &larr; Back to Home
                    </Link>
                </div>

                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="p-8">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 text-green-600 p-4 rounded-md mb-6">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Selection Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Book Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Book
                                    </label>
                                    <select
                                        value={selectedBookId}
                                        onChange={(e) => setSelectedBookId(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                                        required
                                    >
                                        <option value="">-- Choose a Book --</option>
                                        {books.map((book) => (
                                            <option key={book._id} value={book._id}>
                                                {book.name} ({typeof book.author === 'object' ? book.author.name : 'Unknown'})
                                            </option>
                                        ))}
                                    </select>
                                    {selectedBook && (
                                        <p className="mt-2 text-sm text-gray-500">
                                            Author: <span className="font-medium text-gray-800">
                                                {typeof selectedBook.author === 'object' ? selectedBook.author.name : 'Unknown'}
                                            </span>
                                        </p>
                                    )}
                                </div>

                                {/* Ayet Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Ayet
                                    </label>
                                    <select
                                        value={selectedAyetId}
                                        onChange={(e) => setSelectedAyetId(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                                        required
                                    >
                                        <option value="">-- Choose an Ayet --</option>
                                        {ayets.map((ayet) => (
                                            <option key={ayet._id} value={ayet._id}>
                                                {ayet.sure} - Ayet {ayet.ayetNo}
                                            </option>
                                        ))}
                                    </select>
                                    {selectedAyet && (
                                        <p className="mt-2 text-sm text-gray-500 font-arabic text-right" dir="rtl">
                                            {selectedAyet.arapca}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Rich Text Editor */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Explanation (Tefsir Content)
                                </label>
                                <RichTextEditor
                                    content={content}
                                    onChange={setContent}
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${submitting ? "opacity-75 cursor-not-allowed" : ""
                                        }`}
                                >
                                    {submitting ? "Creating..." : "Create Presentation"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
