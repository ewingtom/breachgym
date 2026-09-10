import { MODULES } from "@/data/modules";
import LessonClient from "./LessonClient";

export function generateStaticParams() {
  return MODULES.map((m) => ({ moduleId: m.id }));
}

export default function LessonPage() {
  return <LessonClient />;
}
