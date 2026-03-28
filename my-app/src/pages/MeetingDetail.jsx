import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { meetingsAPI, decisionsAPI, actionItemsAPI } from '../services/api';
import DecisionCard from '../components/DecisionCard';
import ActionItemCard from '../components/ActionItemCard';

export default function MeetingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [decisions, setDecisions] = useState([]);
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newDecision, setNewDecision] = useState('');
  const [newActionItem, setNewActionItem] = useState({ title: '', owner: '', deadline: '' });

  useEffect(() => {
    fetchMeetingDetails();
  }, [id]);

  const fetchMeetingDetails = async () => {
    try {
      setLoading(true);
      const data = await meetingsAPI.getById(id);
      setMeeting(data);
      setDecisions(data.decisions || []);
      setActionItems(data.actionItems || []);
    } catch (err) {
      console.error('Error fetching meeting:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDecision = async (e) => {
    e.preventDefault();
    if (!newDecision.trim()) return;
    try {
      const decision = await decisionsAPI.add(id, newDecision);
      setDecisions([...decisions, decision]);
      setNewDecision('');
    } catch (err) {
      console.error('Error adding decision:', err);
    }
  };

  const handleAddActionItem = async (e) => {
    e.preventDefault();
    if (!newActionItem.title.trim() || !newActionItem.owner || !newActionItem.deadline) return;
    try {
      const item = await actionItemsAPI.create(id, newActionItem.title, newActionItem.owner, newActionItem.deadline);
      setActionItems([...actionItems, item]);
      setNewActionItem({ title: '', owner: '', deadline: '' });
    } catch (err) {
      console.error('Error adding action item:', err);
    }
  };

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      await actionItemsAPI.update(itemId, newStatus, null);
      setActionItems(actionItems.map(item =>
        item._id === itemId ? { ...item, status: newStatus } : item
      ));
    } catch (err) {
      console.error('Error updating action item:', err);
    }
  };

  if (loading || !meeting) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/meetings')}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Back to Meetings
        </button>

        <h1 className="text-4xl font-bold text-gray-800 mb-2">{meeting.title}</h1>
        <p className="text-gray-600 mb-4">{meeting.agenda}</p>

        <div className="grid grid-cols-2 gap-6">
          {/* Decisions Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Decisions</h2>
            <form onSubmit={handleAddDecision} className="mb-4">
              <textarea
                value={newDecision}
                onChange={(e) => setNewDecision(e.target.value)}
                placeholder="Add a decision..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                rows="2"
              ></textarea>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Add Decision
              </button>
            </form>
            {decisions.map(d => <DecisionCard key={d._id} decision={d} />)}
          </div>

          {/* Action Items Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Action Items</h2>
            <form onSubmit={handleAddActionItem} className="mb-4 space-y-2">
              <input
                type="text"
                value={newActionItem.title}
                onChange={(e) => setNewActionItem({ ...newActionItem, title: e.target.value })}
                placeholder="Action title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                value={newActionItem.owner}
                onChange={(e) => setNewActionItem({ ...newActionItem, owner: e.target.value })}
                placeholder="Owner user ID..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="date"
                value={newActionItem.deadline}
                onChange={(e) => setNewActionItem({ ...newActionItem, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                type="submit"
                className="w-full bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700"
              >
                Add Action Item
              </button>
            </form>
            {actionItems.map(item => (
              <ActionItemCard
                key={item._id}
                item={item}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
