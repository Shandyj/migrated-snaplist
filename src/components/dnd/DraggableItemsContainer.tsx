import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  closestCorners,
  DragOverlay,
  TouchSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";
import { Store, Item } from "./types";

export function DraggableItemsContainer({ stores, items }: { stores: Store[], items: Item[] }) {
  const [activeId, setActiveId] = useState<Id<"items"> | null>(null);
  const [activeContainer, setActiveContainer] = useState<Id<"stores"> | null>(null);
  const [localItems, setLocalItems] = useState<Item[]>(items);
  
  // Update localItems when props change
  useEffect(() => {
    setLocalItems(items);
  }, [items]);
  
  const reorderItem = useMutation(api.items.reorder);
  const moveToStore = useMutation(api.items.moveToStore);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px of movement required before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // Wait 200ms before activating
        tolerance: 5, // 5px of movement allowed during delay
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get the active item from the items array
  const activeItem = activeId ? localItems.find(item => item._id === activeId) : null;

  function findContainer(id: Id<"items">) {
    const item = localItems.find(item => item._id === id);
    return item ? item.storeId : null;
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const id = active.id as Id<"items">;
    setActiveId(id);
    setActiveContainer(findContainer(id));
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    
    if (!over) return;
    
    const id = active.id as Id<"items">;
    const overId = over.id as Id<"items">;
    
    // Find the containers
    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);
    
    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    // Simply update the active container - the actual item movement
    // will be handled in handleDragEnd
    setActiveContainer(overContainer);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      setActiveContainer(null);
      return;
    }
    
    const id = active.id as Id<"items">;
    const overId = over.id as Id<"items">;
    
    // Find the containers
    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);
    
    if (!activeContainer || !overContainer) {
      setActiveId(null);
      setActiveContainer(null);
      return;
    }

    // Create a copy of all items that we'll manipulate
    let itemsCopy = [...localItems];
    
    // Get the sorted arrays for both containers
    const activeItems = itemsCopy
      .filter(item => item.storeId === activeContainer)
      .sort((a, b) => a.order - b.order);
      
    const overItems = itemsCopy
      .filter(item => item.storeId === overContainer)
      .sort((a, b) => a.order - b.order);
    
    // Find the source index
    const activeIndex = activeItems.findIndex(item => item._id === id);
    
    // Find the destination index
    const overIndex = overItems.findIndex(item => item._id === overId);
    
    if (activeContainer === overContainer) {
      // SAME CONTAINER
      if (activeIndex !== overIndex) {
        // Create a new array with the item moved to the new position
        const reorderedItems = arrayMove([...activeItems], activeIndex, overIndex);
        
        // Update the order values to match the new positions
        reorderedItems.forEach((item, index) => {
          item.order = index;
        });
        
        // Replace the old items with the reordered ones in our copy
        itemsCopy = itemsCopy.map(item => {
          if (item.storeId === activeContainer) {
            // Find the updated version of this item
            const updatedItem = reorderedItems.find(ri => ri._id === item._id);
            return updatedItem || item;
          }
          return item;
        });
        
        // Update the UI immediately
        setLocalItems([...itemsCopy]);
        
        // Update the database
        try {
          await Promise.all(
            reorderedItems.map(item => 
              reorderItem({ id: item._id, newOrder: item.order })
            )
          );
        } catch (error) {
          console.error('Failed to reorder items:', error);
        }
      }
    } else {
      // DIFFERENT CONTAINERS
      // First, remove the item from the source container
      const movedItem = activeItems[activeIndex];
      const remainingSourceItems = activeItems.filter((_, i) => i !== activeIndex);
      
      // Then, prepare to insert it at the destination position
      let insertAtIndex = overIndex;
      
      // If there are no items or dropping after the last item
      if (overItems.length === 0 || overIndex === -1) {
        insertAtIndex = overItems.length;
      }
      
      // Create the new destination container array
      const newDestinationItems = [...overItems];
      newDestinationItems.splice(insertAtIndex, 0, {
        ...movedItem,
        storeId: overContainer
      });
      
      // Update order values for both containers
      remainingSourceItems.forEach((item, index) => {
        item.order = index;
      });
      
      newDestinationItems.forEach((item, index) => {
        item.order = index;
      });
      
      // Rebuild the entire items array with the updated data
      itemsCopy = itemsCopy.map(item => {
        // If it's the moved item
        if (item._id === id) {
          return {
            ...item,
            storeId: overContainer,
            order: newDestinationItems.findIndex(ni => ni._id === id)
          };
        }
        
        // If it's in the source container
        if (item.storeId === activeContainer && item._id !== id) {
          const newSourceIndex = remainingSourceItems.findIndex(ri => ri._id === item._id);
          if (newSourceIndex !== -1) {
            return {
              ...item,
              order: newSourceIndex
            };
          }
        }
        
        // If it's in the destination container
        if (item.storeId === overContainer && item._id !== id) {
          const newDestIndex = newDestinationItems.findIndex(di => di._id === item._id);
          if (newDestIndex !== -1) {
            return {
              ...item,
              order: newDestIndex
            };
          }
        }
        
        return item;
      });
      
      // Update UI immediately
      setLocalItems([...itemsCopy]);
      
      // Update database
      try {
        // First, move the item to the new container
        await moveToStore({
          id,
          newStoreId: overContainer,
          newOrder: newDestinationItems.findIndex(di => di._id === id),
        });
        
        // Then update all items in both containers
        await Promise.all([
          ...remainingSourceItems.map(item => 
            reorderItem({ id: item._id, newOrder: item.order })
          ),
          ...newDestinationItems.filter(item => item._id !== id).map(item => 
            reorderItem({ id: item._id, newOrder: item.order })
          )
        ]);
      } catch (error) {
        console.error('Failed to move and reorder items:', error);
      }
    }
    
    setActiveId(null);
    setActiveContainer(null);
  }

  // Group items by store using localItems instead of items
  const itemsByStore = stores.reduce((acc, store) => {
    acc[store._id] = localItems
      .filter(item => item.storeId === store._id)
      .sort((a, b) => a.order - b.order);
    return acc;
  }, {} as Record<Id<"stores">, Item[]>);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        {stores.filter(store => store.isExpanded).map(store => (
          <div 
            key={store._id}
            className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
          >
            <h3 className="text-lg font-medium mb-3">{store.name}</h3>
            <SortableContext
              items={itemsByStore[store._id]?.map(item => item._id) || []}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2 min-h-[50px]">
                {itemsByStore[store._id]?.map(item => (
                  <SortableItem 
                    key={`${item._id}-${item.order}`} 
                    id={item._id}
                    item={item}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeId && activeItem ? (
          <div className="bg-white rounded-md shadow-lg p-3 border border-blue-200">
            <div className="flex items-center gap-3">
              <span className={`w-5 h-5 rounded border ${
                activeItem.completed ? "bg-blue-600 border-blue-600" : "border-gray-300"
              } flex items-center justify-center`}>
                {activeItem.completed && (
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
              </span>
              <span className={activeItem.completed ? "line-through text-gray-400" : ""}>
                {activeItem.name}
                {activeItem.quantity && (
                  <span className="text-sm text-gray-500 ml-2">({activeItem.quantity})</span>
                )}
              </span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
} 