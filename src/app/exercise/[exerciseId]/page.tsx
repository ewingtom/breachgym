import { EXERCISES } from "@/data/exercises";
import ExerciseClient from "./ExerciseClient";

export function generateStaticParams() {
  return EXERCISES.map((e) => ({ exerciseId: e.id }));
}

export default function ExercisePage() {
  return <ExerciseClient />;
}
