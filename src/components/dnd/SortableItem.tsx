import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Item } from "./types";

export function SortableItem({ id, item }: { id: Id<"items">; item: Item }) {
  const toggleComplete = useMutation(api.items.toggleComplete);
  const removeItem = useMutation(api.items.remove);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    transition: {
      duration: 200,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1 : 0,
    position: 'relative',
    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-white rounded-md border ${
        isDragging ? 'border-blue-300 shadow-md' : 'border-gray-200'
      } hover:bg-gray-50 transition-colors`}
      {...attributes}
      {...listeners}
    >
      <button
        onClick={() => toggleComplete({ id: item._id })}
        className={`w-5 h-5 rounded border ${
          item.completed ? "bg-blue-600 border-blue-600" : "border-gray-300"
        } flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors`}
      >
        {item.completed && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>
      <span 
        className={`flex-1 ${
          item.completed ? "line-through text-gray-400" : "text-gray-900"
        }`}
      >
        {item.name}
        {item.quantity && (
          <span className="text-sm text-gray-500 ml-2">({item.quantity})</span>
        )}
      </span>
      <div className="flex items-center">
        <span className="mr-2 text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
          {/* Display the store name if needed */}
        </span>
        <button
          onClick={() => removeItem({ id: item._id })}
          className="text-gray-400 hover:text-red-600 focus:outline-none transition-colors p-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
} 