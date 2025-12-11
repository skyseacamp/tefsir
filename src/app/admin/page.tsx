export default function AdminDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Books</h2>
                    <p className="text-gray-500 mb-4">Manage tefsir books</p>
                    <a href="/admin/books" className="text-green-600 hover:text-green-800 font-medium">Go to Books &rarr;</a>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Authors</h2>
                    <p className="text-gray-500 mb-4">Manage mufessirs</p>
                    <a href="/admin/authors" className="text-green-600 hover:text-green-800 font-medium">Go to Authors &rarr;</a>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Ayets</h2>
                    <p className="text-gray-500 mb-4">Manage verses and translations</p>
                    <a href="/admin/ayets" className="text-green-600 hover:text-green-800 font-medium">Go to Ayets &rarr;</a>
                </div>
            </div>
        </div>
    );
}
