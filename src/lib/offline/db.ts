import Dexie, { type Table } from "dexie";

export interface OutboxItem {
  id: string; // clientId (uuid) — also used as the FuelLog id on the server
  payload: Record<string, unknown>;
  createdAt: number;
}

class FueloDB extends Dexie {
  outbox!: Table<OutboxItem, string>;

  constructor() {
    super("fuelo");
    this.version(1).stores({ outbox: "id, createdAt" });
  }
}

export const db = new FueloDB();
