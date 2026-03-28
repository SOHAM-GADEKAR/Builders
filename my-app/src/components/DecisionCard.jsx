export default function DecisionCard({ decision }) {
  return (
    <div className="bg-green-50 border-l-4 border-green-600 p-4 mb-3 rounded">
      <p className="text-gray-800"><strong>Decision:</strong> {decision.description}</p>
      <p className="text-gray-500 text-sm mt-1">Created: {new Date(decision.createdAt).toLocaleDateString()}</p>
    </div>
  );
}
