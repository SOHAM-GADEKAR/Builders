import { useState, useEffect } from 'react';
import { actionItemsAPI } from '../services/api';
import ActionItemCard from '../components/ActionItemCard';

export default function PersonalFeed() {
  const [items, setItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, open, overdue, done

  useEffect(() => {
    fetchUserAndItems();
  }, []);

  const fetchUserAndItems = async () => {
    try {
      setLoading(true);
      // Get current user from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setCurrentUser(user);
      
      // Fetch user's action items
      const items = await actionItemsAPI.getUserItems(user._id);
      // Sort by deadline
      const sorted = items.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
      setItems(sorted);
    } catch (err) {
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      await actionItemsAPI.update(itemId, newStatus, null);
      setItems(items.map(item =>
        item._id === itemId ? { ...item, status: newStatus } : item
      ));
    } catch (err) {
      console.error('Error updating action item:', err);
    }
  };

  const getFilteredItems = () => {
    const now = new Date();
    return items.filter(item => {
      if (filter === 'all') return true;
      if (filter === 'open') return item.status === 'open';
      if (filter === 'overdue') {
        return new Date(item.deadline) < now && item.status !== 'done';
      }
      if (filter === 'done') return item.status === 'done';
      return true;
    });
  };

  const overdueCount = items.filter(i => new Date(i.deadline) < new Date() && i.status !== 'done').length;
  const filteredItems = getFilteredItems();

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">My Action Items</h1>
        {currentUser && <p className="text-gray-600 mb-6">Welcome, {currentUser.name}</p>}

        {overdueCount > 0 && (
          <div className="bg-red-100 border-l-4 border-red-600 p-4 mb-6 rounded">
            <p className="text-red-800 font-bold">⚠️ You have {overdueCount} overdue action items!</p>
          </div>
        )}

        <div className="flex gap-3 mb-6 flex-wrap">
          {['all', 'open', 'overdue', 'done'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded font-semibold transition ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-800 hover:bg-gray-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <p className="text-gray-600 text-center py-10">No action items in this category.</p>
          ) : (
            filteredItems.map(item => (
              <ActionItemCard
                key={item._id}
                item={item}
                onStatusChange={handleStatusChange}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
