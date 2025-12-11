"use client";

import { useState, useEffect } from "react";

type Author = {
    _id: string;
    name: string;
    bio?: string;
};

export default function AuthorsPage() {
    const [authors, setAuthors] = useState<Author[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: "", bio: "" });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchAuthors();
    }, []);

    const fetchAuthors = async () => {
        try {
            const token = localStorage.getItem("token");
            console.log("Token in fetchAuthors:", token);
            const res = await fetch("/api/admin/authors", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.data) setAuthors(data.data);
        } catch (err) {
            console.error("Error fetching authors:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        const token = localStorage.getItem("token");
        console.log("Token in handleSubmit:", token);

        try {
            const url = editingId
                ? `/api/admin/authors/${editingId}`
                : "/api/admin/authors";

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

            setFormData({ name: "", bio: "" });
            setEditingId(null);
            fetchAuthors();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleEdit = (author: Author) => {
        setEditingId(author._id);
        setFormData({ name: author.name, bio: author.bio || "" });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this author?")) return;

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`/api/admin/authors/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                fetchAuthors();
            }
        } catch (err) {
            console.error("Error deleting author:", err);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Authors</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit">
                    <h2 className="text-xl font-semibold mb-4">
                        {editingId ? "Edit Author" : "Add New Author"}
                    </h2>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name
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
                                Bio (Optional)
                            </label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                rows={4}
                            />
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
                                        setFormData({ name: "", bio: "" });
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
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Bio</th>
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
                                ) : authors.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                                            No authors found
                                        </td>
                                    </tr>
                                ) : (
                                    authors.map((author) => (
                                        <tr key={author._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-gray-800 font-medium">{author.name}</td>
                                            <td className="px-6 py-4 text-gray-600 truncate max-w-xs">
                                                {author.bio || "-"}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button
                                                    onClick={() => handleEdit(author)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(author._id)}
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
