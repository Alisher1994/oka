import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getCategories, getProducts } from '../api/api';
import ProductCard from '../components/ProductCard';

function HomePage() {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, productsData] = await Promise.all([
        getCategories(),
        getProducts()
      ]);
      
      setCategories(categoriesData);
      setProducts(productsData);
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = async (categoryId) => {
    setSelectedCategory(categoryId);
    try {
      const productsData = await getProducts(categoryId);
      setProducts(productsData);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category_id === selectedCategory)
    : products;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{t('error')}: {error}</p>
          <button onClick={loadData} className="btn-primary">
            {t('try_again')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Categories */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-3">{t('categories')}</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => handleCategorySelect(null)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              selectedCategory === null
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-primary'
            }`}
          >
            {t('all_products')}
          </button>
          
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedCategory === category.id
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-primary'
              }`}
            >
              {category.icon && <span>{category.icon}</span>}
              <span>{i18n.language === 'ru' ? category.name_ru : category.name_en}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div>
        <h2 className="text-lg font-bold mb-4">
          {selectedCategory
            ? categories.find(c => c.id === selectedCategory)?.[i18n.language === 'ru' ? 'name_ru' : 'name_en']
            : t('all_products')
          }
          <span className="text-gray-500 text-sm ml-2">({filteredProducts.length})</span>
        </h2>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('no_products')}</p>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
