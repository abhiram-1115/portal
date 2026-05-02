import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { itemsAPI } from "../services/api";
import ClaimActions from "../components/ClaimActions";

const ItemDetails = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadItem = async () => {
    try {
      setLoading(true);
      const data = await itemsAPI.getItemById(id);
      setItem(data || null);
    } catch (e) {
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItem();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!item) return <div className="p-6">Item not found.</div>;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link to="/" className="text-blue-600 hover:underline">← Back</Link>

      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold">{item.name || item.title}</h1>
        <p className="mt-2 text-gray-700">{item.description}</p>
        <p className="mt-2 text-sm text-gray-500">
          Category: {item.category || "N/A"} | Status: {item.status || "N/A"}
        </p>

        <ClaimActions item={item} onUpdated={loadItem} />
      </div>
    </div>
  );
};

export default ItemDetails;