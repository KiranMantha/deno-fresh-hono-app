import { displayGreeting } from "./utils/utils.ts";

export default function handler(payload: Record<string, unknown>) {
  return displayGreeting(payload);
}
