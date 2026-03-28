import { useState } from 'react';

export default function MeetingForm({ onSubmit, loading = false, users = [] }) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    agenda: '',
    attendees: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleAttendeeToggle = (userId) => {
    setFormData((prev) => {
      const alreadySelected = prev.attendees.includes(userId);
      return {
        ...prev,
        attendees: alreadySelected
          ? prev.attendees.filter((id) => id !== userId)
          : [...prev.attendees, userId],
      };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">Meeting Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">Date & Time</label>
        <input
          type="datetime-local"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">Agenda / Notes</label>
        <textarea
          name="agenda"
          value={formData.agenda}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
        ></textarea>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">Attendees</label>
        <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
          {users.length === 0 ? (
            <p className="text-sm text-gray-500">No users found</p>
          ) : (
            users.map((user) => (
              <label key={user._id} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.attendees.includes(user._id)}
                  onChange={() => handleAttendeeToggle(user._id)}
                />
                <span>{user.name} ({user.email})</span>
              </label>
            ))
          )}
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Creating...' : 'Create Meeting'}
      </button>
    </form>
  );
}
