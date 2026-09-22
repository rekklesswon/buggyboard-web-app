import type { APIRequestContext } from "@playwright/test";

export type BugRecord = {
  id: number;
  title: string;
  severity: "HIGH" | "MID" | "LOW";
  owner: string;
  description: string;
  state: "OPEN" | "CLOSED";
};

export class BugRecords {
  private readonly markers = new Set<string>();

  constructor(private readonly request: APIRequestContext) {}

  track(marker: string) {
    this.markers.add(marker);
  }

  async list(): Promise<BugRecord[]> {
    const response = await this.request.get("/api/bugs");
    if (!response.ok())
      throw new Error(`List bugs failed: ${response.status()}`);
    return response.json() as Promise<BugRecord[]>;
  }

  async get(id: number): Promise<BugRecord> {
    const response = await this.request.get(`/api/bugs/${id}`);
    if (!response.ok())
      throw new Error(`Get bug ${id} failed: ${response.status()}`);
    return response.json() as Promise<BugRecord>;
  }

  async matching(marker: string): Promise<BugRecord[]> {
    return (await this.list()).filter(
      (bug) =>
        bug.title.includes(marker) ||
        bug.owner.includes(marker) ||
        bug.description.includes(marker)
    );
  }

  async cleanup() {
    if (this.markers.size === 0) return;
    const bugs = await this.list();
    for (const bug of bugs) {
      if (
        ![bug.title, bug.owner, bug.description].some((value) =>
          [...this.markers].some((marker) => value.includes(marker))
        )
      )
        continue;
      const deleted = await this.request.delete(`/api/bugs/${bug.id}`);
      if (deleted.status() !== 204)
        throw new Error(`Delete bug ${bug.id} failed: ${deleted.status()}`);
      const check = await this.request.get(`/api/bugs/${bug.id}`);
      if (check.status() !== 404)
        throw new Error(`Bug ${bug.id} still exists after deletion`);
    }
  }
}
