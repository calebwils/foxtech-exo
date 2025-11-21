import React from 'react';
import { useProducts } from './hooks/useProducts';
import { Header } from './components/Header';
import { ProductControls } from './components/ProductControls';
import { ProductCard } from './components/ProductCard';
import { Pagination } from './components/Pagination';
import { Loader } from './components/Loader';
import { CartDrawer } from './components/CartDrawer';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const {
    products,
    loading,
    error,
    total,
    totalPages,
    filters,
    setQuery,
    setCategory,
    setSort,
    setPage,
    refresh
  } = useProducts();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Header />
      <CartDrawer />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Product Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage your catalogue, filter by category, and track inventory in real-time.
          </p>
        </div>

        <ProductControls
          filters={filters}
          setQuery={setQuery}
          setCategory={setCategory}
          setSort={setSort}
        />

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6 border border-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading products</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                   <button
                    type="button"
                    onClick={refresh}
                    className="rounded-md bg-red-100 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <Loader />
        ) : products.length === 0 && !error ? (
          <div className="text-center py-20 bg-white rounded-lg border border-dashed border-slate-300">
            <p className="text-slate-500 text-lg">No products found matching your criteria.</p>
            <button 
              onClick={() => setQuery('')}
              className="mt-4 text-fox-600 font-medium hover:text-fox-700"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <Pagination
              currentPage={filters.page}
              totalPages={totalPages}
              totalItems={total}
              onPageChange={setPage}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default App;