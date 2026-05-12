interface EmptyStateProps {
  onClear: () => void;
}

export function EmptyState({ onClear }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-5xl mb-4">🔍</div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">No vehicles found</h3>
      <p className="text-sm text-slate-500 mb-6 max-w-xs">
        No vehicles match your current filters. Try adjusting your search or clearing the filters.
      </p>
      <button
        onClick={onClear}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        Clear all filters
      </button>
    </div>
  );
}
