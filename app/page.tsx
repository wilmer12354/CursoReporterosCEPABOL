"use client";

import { FormEvent, useState } from "react";

const videos = [
  { title: "Introducción a Reporteros CEPABOL", youtubeId: "dQw4w9WgXcQ" },
  { title: "Cómo hacer una buena entrevista", youtubeId: "M7lc1UVf-VE" },
  { title: "Consejos para producir contenido audiovisual", youtubeId: "kJQP7kiw5Fk" }
];

const questions = [
  {
    question: "¿Qué título describe mejor el curso?",
    options: ["Curso de reporteros digitales", "Curso de jardinería", "Curso de cocina tradicional"]
  },
  {
    question: "¿Cuál es una buena práctica cuando haces una entrevista?",
    options: ["Escuchar con atención", "Interrumpir al entrevistado", "Hablar más fuerte que la cámara"]
  },
  {
    question: "¿Qué elemento es clave para un video de calidad?",
    options: ["Buena iluminación", "Sonido saturado", "Fondo desordenado"]
  }
];

type User = {
  name: string;
  age: number;
  userId: number;
};

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeVideo, setActiveVideo] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [completed, setCompleted] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const currentQuestion = questions[questionIndex];

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const trimmedName = name.trim();
    const ageNumber = Number(age);

    if (!trimmedName || !ageNumber) {
      setFormError("Ingresa un nombre completo y una edad válidos.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, age: ageNumber })
      });

      const result = await response.json();
      if (!response.ok) {
        setFormError(result?.error ?? "No se registró en el form.");
        return;
      }

      setUser({ name: trimmedName, age: ageNumber, userId: result.userId ?? Date.now() });
      setSaveMessage("Bienvenido/a. Ya puedes ver los videos y responder las preguntas.");
    } catch (error) {
      setFormError("No se registró en el form. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAnswer() {
    if (!selectedAnswer || !user) return;

    setIsSubmitting(true);
    try {
      await fetch("/api/submit-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          questionId: questionIndex,
          answer: selectedAnswer
        })
      });

      const nextIndex = questionIndex + 1;
      if (nextIndex >= questions.length) {
        setCompleted(true);
      } else {
        setQuestionIndex(nextIndex);
        setSelectedAnswer("");
      }
    } catch (error) {
      setFormError("No se pudo guardar tu respuesta. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      {!user ? (
        <section className="hero-card">
          <div className="hero-header">
            <p className="eyebrow">Curso Reporteros CEPABOL</p>
            <h1>Ingresa tu nombre completo y edad para entrar</h1>
            <p className="hero-copy">Accede al curso, mira los videos y responde las preguntas.</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <label>
              Nombre completo
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Ana Luisa Marca Tapia" />
            </label>
            <label>
              Edad
              <input value={age} onChange={(event) => setAge(event.target.value)} placeholder="Ej. 18" type="number" min="5" />
            </label>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Ingresando..." : "Entrar al curso"}
            </button>
            {formError ? <p className="form-error">{formError}</p> : null}
          </form>
        </section>
      ) : (
        <section className="course-shell">
          <div className="course-header">
            <p className="eyebrow">Bienvenido/a, {user.name}</p>
            <h1>Curso Reporteros CEPABOL</h1>
            <p className="hero-copy">Mira los videos dentro de esta página y responde cada pregunta para avanzar.</p>
          </div>

          <div className="course-grid">
            <div className="video-card">
              <div className="video-top">
                <span>{videos[activeVideo].title}</span>
                <div className="video-tabs">
                  {videos.map((video, index) => (
                    <button
                      key={video.youtubeId}
                      type="button"
                      className={index === activeVideo ? "video-tab active" : "video-tab"}
                      onClick={() => setActiveVideo(index)}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="video-frame">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${videos[activeVideo].youtubeId}?rel=0&modestbranding=1&controls=1&disablekb=1`}
                  title={videos[activeVideo].title}
                  allow="autoplay; encrypted-media"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </div>

            <div className="questions-card">
              <div className="question-header">
                <span>Pregunta {questionIndex + 1} de {questions.length}</span>
                <h2>{currentQuestion.question}</h2>
              </div>

              <div className="options-list">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={option === selectedAnswer ? "option-button selected" : "option-button"}
                    onClick={() => setSelectedAnswer(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <button
                className="next-button"
                onClick={handleAnswer}
                disabled={!selectedAnswer || isSubmitting || completed}
              >
                {isSubmitting ? "Guardando..." : questionIndex + 1 === questions.length ? "Finalizar" : "Responder y continuar"}
              </button>

              {completed ? (
                <div className="completion-box">
                  <h3>¡Listo!</h3>
                  <p>Has terminado las preguntas. Vuelve a ver los videos si quieres reforzar tu aprendizaje.</p>
                </div>
              ) : null}

              {saveMessage ? <p className="form-success">{saveMessage}</p> : null}
              {formError ? <p className="form-error">{formError}</p> : null}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
