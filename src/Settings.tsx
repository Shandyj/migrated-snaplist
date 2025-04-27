import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function Settings({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const settings = useQuery(api.settings.get);
  const stores = useQuery(api.stores.list) || [];
  const saveSettings = useMutation(api.settings.save);
  const addStore = useMutation(api.stores.add);
  const removeStore = useMutation(api.stores.remove);

  const [newStore, setNewStore] = useState("");
  const [geminiPrompt, setGeminiPrompt] = useState(settings?.geminiPrompt || "");
  const [previousItems, setPreviousItems] = useState(
    settings?.previousItems?.join("\n") || ""
  );

  if (!open) return null;

  const handleSave = async () => {
    await saveSettings({
      geminiPrompt: geminiPrompt || undefined,
      previousItems: previousItems
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    });
    onClose();
  };

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStore) return;
    await addStore({ name: newStore });
    setNewStore("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-t-xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <section>
            <h3 className="font-medium mb-4">Manage Stores</h3>
            <div className="space-y-2 mb-4">
              {stores.map((store) => (
                <div
                  key={store._id}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded"
                >
                  <span>{store.name}</span>
                  <button
                    onClick={() => removeStore({ id: store._id })}
                    className="text-slate-400 hover:text-red-600"
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
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddStore} className="flex gap-2">
              <input
                type="text"
                placeholder="Add new store"
                value={newStore}
                onChange={(e) => setNewStore(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!newStore}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Add
              </button>
            </form>
          </section>

          <section>
            <h3 className="font-medium mb-4">Gemini API System Prompt</h3>
            <textarea
              value={geminiPrompt}
              onChange={(e) => setGeminiPrompt(e.target.value)}
              placeholder="Enter your custom prompt for Gemini API..."
              className="w-full h-32 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-slate-500 mt-2">
              This prompt will be used when processing images of handwritten lists.
            </p>
          </section>

          <section>
            <h3 className="font-medium mb-4">Previously Added Items</h3>
            <textarea
              value={previousItems}
              onChange={(e) => setPreviousItems(e.target.value)}
              placeholder="Enter items (one per line)..."
              className="w-full h-32 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-slate-500 mt-2">
              These items will be used for auto-completion suggestions.
            </p>
          </section>

          <button
            onClick={handleSave}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
