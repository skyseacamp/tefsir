"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Book = {
    _id: string;
    name: string;
    author: { _id: string; name: string } | string;
};

type Author = {
    _id: string;
    name: string;
};

export default function BooksPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: "", author: "" });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        fetchBooks();
        fetchAuthors();
    }, []);

    const fetchBooks = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/admin/books", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.data) setBooks(data.data);
        } catch (err) {
            console.error("Error fetching books:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAuthors = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/admin/authors?limit=100", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.data) setAuthors(data.data);
        } catch (err) {
            console.error("Error fetching authors:", err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        const token = localStorage.getItem("token");

        try {
            const url = editingId
                ? `/api/admin/books/${editingId}`
                : "/api/admin/books";

            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Something went wrong");

            setFormData({ name: "", author: "" });
            setEditingId(null);
            fetchBooks();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleEdit = (book: Book) => {
        setEditingId(book._id);
        const authorId = typeof book.author === 'object' ? book.author._id : book.author;
        setFormData({ name: book.name, author: authorId });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this book?")) return;

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`/api/admin/books/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                fetchBooks();
            }
        } catch (err) {
            console.error("Error deleting book:", err);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Books</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit">
                    <h2 className="text-xl font-semibold mb-4">
                        {editingId ? "Edit Book" : "Add New Book"}
                    </h2>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Book Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Author
                            </label>
                            <select
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select Author</option>
                                {authors.map((author) => (
                                    <option key={author._id} value={author._id}>
                                        {author.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
                            >
                                {editingId ? "Update" : "Create"}
                            </button>
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingId(null);
                                        setFormData({ name: "", author: "" });
                                        setError("");
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Name</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Author</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : books.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                                            No books found
                                        </td>
                                    </tr>
                                ) : (
                                    books.map((book) => (
                                        <tr key={book._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-gray-800">{book.name}</td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {typeof book.author === 'object' ? book.author?.name : 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button
                                                    onClick={() => handleEdit(book)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(book._id)}
                                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
