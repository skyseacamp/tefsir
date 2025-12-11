"use client";

import { useState, useEffect } from "react";

type Ayet = {
    _id: string;
    sure: string;
    ayetNo: string;
    arapca: string;
};

export default function AyetsPage() {
    const [ayets, setAyets] = useState<Ayet[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ sure: "", ayetNo: "", arapca: "" });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [filterSure, setFilterSure] = useState("");

    useEffect(() => {
        fetchAyets();
    }, [filterSure]);

    const fetchAyets = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            let url = "/api/admin/ayets?limit=50";
            if (filterSure) {
                url += `&sure=${encodeURIComponent(filterSure)}`;
            }

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.data) setAyets(data.data);
        } catch (err) {
            console.error("Error fetching ayets:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        const token = localStorage.getItem("token");

        try {
            const url = editingId
                ? `/api/admin/ayets/${editingId}`
                : "/api/admin/ayets";

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

            setFormData({ sure: "", ayetNo: "", arapca: "" });
            setEditingId(null);
            fetchAyets();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleEdit = (ayet: Ayet) => {
        setEditingId(ayet._id);
        setFormData({
            sure: ayet.sure,
            ayetNo: ayet.ayetNo,
            arapca: ayet.arapca
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this ayet?")) return;

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`/api/admin/ayets/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                fetchAyets();
            }
        } catch (err) {
            console.error("Error deleting ayet:", err);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Ayets</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit">
                    <h2 className="text-xl font-semibold mb-4">
                        {editingId ? "Edit Ayet" : "Add New Ayet"}
                    </h2>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sure Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.sure}
                                    onChange={(e) => setFormData({ ...formData, sure: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                    placeholder="e.g. Bakara"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ayet No
                                </label>
                                <input
                                    type="text"
                                    value={formData.ayetNo}
                                    onChange={(e) => setFormData({ ...formData, ayetNo: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                    placeholder="e.g. 255"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Arabic Text
                            </label>
                            <textarea
                                value={formData.arapca}
                                onChange={(e) => setFormData({ ...formData, arapca: e.target.value })}
                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent font-arabic text-right text-lg"
                                rows={4}
                                required
                                dir="rtl"
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
                                        setFormData({ sure: "", ayetNo: "", arapca: "" });
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
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <input
                            type="text"
                            placeholder="Filter by Sure..."
                            value={filterSure}
                            onChange={(e) => setFilterSure(e.target.value)}
                            className="w-full max-w-xs border border-gray-300 rounded-md p-2 text-sm"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Sure</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Ayet No</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Arabic</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : ayets.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                            No ayets found
                                        </td>
                                    </tr>
                                ) : (
                                    ayets.map((ayet) => (
                                        <tr key={ayet._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-gray-800 font-medium">{ayet.sure}</td>
                                            <td className="px-6 py-4 text-gray-600">{ayet.ayetNo}</td>
                                            <td className="px-6 py-4 text-gray-800 font-arabic text-right text-lg truncate max-w-xs" dir="rtl">
                                                {ayet.arapca}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleEdit(ayet)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(ayet._id)}
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
