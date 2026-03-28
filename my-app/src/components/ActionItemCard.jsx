export default function ActionItemCard({ item, onStatusChange, users = [] }) {
  const isOverdue = new Date(item.deadline) < new Date() && item.status !== 'done';
  const owner = users.find(u => u._id === item.owner);

  return (
    <div className={`p-4 mb-3 rounded border-l-4 ${
      isOverdue ? 'bg-red-50 border-red-600' :
      item.status === 'done' ? 'bg-green-50 border-green-600' :
      'bg-yellow-50 border-yellow-600'
    }`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="font-bold text-gray-800">{item.title}</p>
          <p className="text-sm text-gray-600">Owner: {owner?.name || 'Unknown'}</p>
          <p className="text-sm text-gray-600">Deadline: {new Date(item.deadline).toLocaleDateString()}</p>
          {isOverdue && <p className="text-xs font-bold text-red-600">⚠️ OVERDUE</p>}
        </div>
        <select
          value={item.status}
          onChange={(e) => onStatusChange(item._id, e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-sm"
        >
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>
    </div>
  );
}
