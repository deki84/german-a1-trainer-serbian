import { addSession, parseDayLog, type DayStats } from "./days";
import { dateKey } from "./srs";
import { createStore } from "./store";

export const dayStore = createStore("nemacki-days-v1", parseDayLog);

export function recordSession(stats: DayStats): void {
  dayStore.set(addSession(dayStore.get(), dateKey(), stats));
}
