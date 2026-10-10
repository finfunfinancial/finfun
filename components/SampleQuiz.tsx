"use client";
import Link from "next/link";
import { useState } from "react";

// A free taste of a FinFun quiz — no login, checked in the browser (paid course quizzes are graded on the server).
const questions = [
  { q: "Your friend asks for the OTP that just came to your phone. What do you do?", options: ["Share it — they’re a friend", "Never share it with anyone", "Share only half of it"], answer: 1 },
  { q: "Which of these is a need?", options: ["School shoes", "A new video game", "Movie tickets"], answer: 0 },
  { q: "You save ₹100 every month. Starting earlier means…", options: ["Less money in the end", "More money, thanks to compounding", "No difference at all"], answer: 1 },
];

export default function SampleQuiz() {
  const [picked, setPicked] = useState<(number | null)[]>(questions.map(() => null));
  const [checked, setChecked] = useState(false);
  const score = questions.filter((q, i) => picked[i] === q.answer).length;
  return (
    <div className="card stack">
      <h3 style={{ margin: 0 }}>Quick money quiz</h3>
      {questions.map((q, i) => (
        <fieldset key={i} className="quiz-box" disabled={checked}>
          <legend><strong>{i + 1}. {q.q}</strong></legend>
          {q.options.map((o, j) => (
            <label key={j} className={`quiz-opt${checked && j === q.answer ? " right" : ""}${checked && picked[i] === j && j !== q.answer ? " wrong" : ""}`}>
              <input type="radio" name={`sq-${i}`} checked={picked[i] === j} onChange={() => setPicked(picked.map((p, k) => (k === i ? j : p)))} /> {o}
            </label>
          ))}
        </fieldset>
      ))}
      {checked ? (
        <div className="stack">
          <p style={{ margin: 0, fontWeight: 800 }}>You got {score} of {questions.length}! {score === questions.length ? "Money smart already 🎉" : "FinFun makes the rest click."}</p>
          <div className="btn-row">
            <Link className="btn btn-blue" href="/programs">Find a course</Link>
            <button className="btn btn-white" onClick={() => { setPicked(questions.map(() => null)); setChecked(false); }}>Try again</button>
          </div>
        </div>
      ) : (
        <button className="btn" onClick={() => setChecked(true)} disabled={picked.some((p) => p === null)}>Check my answers</button>
      )}
    </div>
  );
}
