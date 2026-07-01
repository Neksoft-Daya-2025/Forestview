import { useCallback, useEffect, useState } from "react";

export const MATH_CHALLENGE_ERROR =
  "That answer is incorrect. Please solve the math question and try again.";

export function createMathQuestion() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  return { a, b, answer: a + b };
}

export function validateMathAnswer(expected, userAnswer) {
  const trimmed = String(userAnswer ?? "").trim();
  if (!trimmed) return "Please answer the math question.";
  if (!/^-?\d+$/.test(trimmed)) return "Please enter a whole number.";
  if (Number(trimmed) !== expected) return MATH_CHALLENGE_ERROR;
  return "";
}

export function useMathChallenge(resetKey) {
  const [question, setQuestion] = useState(createMathQuestion);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setQuestion(createMathQuestion());
    setAnswer("");
    setError("");
  }, [resetKey]);

  const validate = useCallback(() => {
    const message = validateMathAnswer(question.answer, answer);
    setError(message);
    return !message;
  }, [question.answer, answer]);

  const reset = useCallback(() => {
    setQuestion(createMathQuestion());
    setAnswer("");
    setError("");
  }, []);

  const handleAnswerChange = useCallback((value) => {
    setAnswer(value);
    setError("");
  }, []);

  return {
    questionText: `What is ${question.a} + ${question.b}?`,
    answer,
    setAnswer: handleAnswerChange,
    error,
    validate,
    reset,
  };
}

export function MathChallengeField({ questionText, answer, onAnswerChange, error, idPrefix = "math" }) {
  const inputId = `${idPrefix}-answer`;
  const promptId = `${idPrefix}-prompt`;
  const errorId = `${idPrefix}-error`;

  return (
    <div className="mathChallenge">
      <label className="mathChallenge-field" htmlFor={inputId}>
        <span className="mathChallenge-label" id={promptId}>
          Human verification
        </span>
        <span className="mathChallenge-prompt" aria-hidden="true">
          {questionText}
        </span>
        <input
          id={inputId}
          className={`mathChallenge-input${error ? " mathChallenge-input--error" : ""}`}
          type="text"
          name="mathAnswer"
          inputMode="numeric"
          autoComplete="off"
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : promptId}
          placeholder="Your answer"
          required
        />
      </label>
      {error ? (
        <p className="formFeedback formFeedback--error mathChallenge-error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
