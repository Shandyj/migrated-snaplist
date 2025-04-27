import { Id } from "../../../convex/_generated/dataModel";

export interface Store {
  _id: Id<"stores">;
  name: string;
  order: number;
  isExpanded: boolean;
  userId: Id<"users">;
}

export interface Item {
  _id: Id<"items">;
  name: string;
  quantity?: string;
  completed: boolean;
  storeId: Id<"stores">;
  userId: Id<"users">;
  order: number;
} 