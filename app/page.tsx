"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Swal from "sweetalert2";
import questionsData from "@/data/questions.json";

const videos = [
  { title: "ÉTICA PERIODISTICA", youtubeId: "SWfr2NsHwl8" },
  { title: "LENGUAJE DE LA IMAGEN", youtubeId: "gTlzGiOvX58" },
  { title: "REDACCIÓN", youtubeId: "7Z0T6Z7ZIyQ" },
  { title: "FOTOGRAFÍA", youtubeId: "cTYzdHW8eFM" },
  { title: "CAMAROGRAFÍA", youtubeId: "V1tSPemt1iM" },
  { title: "MANEJO DE REDES SOCIALES", youtubeId: "YKfODFzAjE" },
  { title: "TRANSMISIÓN EN VIVO", youtubeId: "Xf6DKIG3-vk" }
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
  const [saveMessage, setSaveMessage] = useState("");
  const [showQuizForTopic, setShowQuizForTopic] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmittedTopics, setQuizSubmittedTopics] = useState<number[]>([]);
  const [topicScores, setTopicScores] = useState<Record<number, { score: number; total: number }>>({});
  const completed = quizSubmittedTopics.length === videos.length;

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const trimmedName = name.trim();

    if (!trimmedName) {
      Swal.fire({ icon: "warning", title: "Campo vacío", text: "Ingresa un nombre completo." });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName })
      });

      const result = await response.json();
      if (!response.ok) {
        Swal.fire({ icon: "error", title: "Acceso denegado", text: result?.error ?? "No se registró en el form." });
        return;
      }

      const userId = result.userId ?? Date.now();
      setUser({ name: trimmedName, age: 0, userId });
      setSaveMessage("Bienvenido/a. Ya puedes ver los videos.");

      const scoresRes = await fetch(`/api/submit-score?userId=${userId}`);
      if (scoresRes.ok) {
        const scoresData = await scoresRes.json();
        const scoresMap: Record<number, { score: number; total: number }> = {};
        const submitted: number[] = [];
        for (const s of scoresData.scores) {
          scoresMap[s.topicIndex] = { score: s.score, total: s.total };
          submitted.push(s.topicIndex);
        }
        setTopicScores(scoresMap);
        setQuizSubmittedTopics(submitted);
      }
    } catch (error) {
      setFormError("No se registró en el form. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReadyForExam() {
    if (!user) return;
    if (quizSubmittedTopics.includes(activeVideo)) return;
    setShowQuizForTopic(activeVideo);
    setQuizAnswers({});
  }

  function handleAnswerSelect(questionId: number, optionIndex: number) {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  }

  async function handleSubmitQuiz() {
    if (showQuizForTopic === null || !user) return;
    const topic = questionsData.find((t) => t.topicIndex === showQuizForTopic);
    if (!topic) return;

    let correct = 0;
    for (const q of topic.questions) {
      if (quizAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    }
    const total = topic.questions.length;

    if (correct < 2) {
      Swal.fire({
        icon: "error",
        title: "Respuestas insuficientes",
        text: `Obtuviste ${correct} de ${total}. Necesitas al menos 2 correctas. Vuelve a ver el video y responde nuevamente.`,
        confirmButtonText: "Reintentar"
      });
      setQuizAnswers({});
      setShowQuizForTopic(null);
      return;
    }

    await fetch("/api/submit-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.userId,
        topicIndex: showQuizForTopic,
        topicName: topic.topicName,
        score: correct,
        total
      })
    });

    setTopicScores((prev) => ({ ...prev, [showQuizForTopic]: { score: correct, total } }));
    setQuizSubmittedTopics((prev) => [...prev, showQuizForTopic]);
    setShowQuizForTopic(null);

    const nextVideo = showQuizForTopic + 1;
    if (nextVideo < videos.length) {
      setActiveVideo(nextVideo);
    }

    Swal.fire({
      icon: "success",
      title: "¡Respuestas correctas!",
      text: `Obtuviste ${correct} de ${total} en "${topic.topicName}".`,
      confirmButtonText: "Continuar"
    });
  }

  return (
    <main className="page-shell">

      {!user ? (
        <section className="hero-card hero-layout">

          {/* IZQUIERDA */}
          <div className="hero-content">
            <div className="hero-header">
              <div className="eyebrow-brand">
                <Image
                  src="/logo-cepabol.webp"
                  alt="LOGO CEPABOL"
                  width={40}
                  height={40}
                  className="brand-logo"
                />

                <p className="eyebrow">
                  CEPABOL
                </p>
              </div>

              <h1>CURSO DE CAPACITACIÓN "REPORTEROS POPULARES"</h1>

              <p className="hero-copy">
                Programa de formación gratuito, dirigido a líderes de organizaciones sociales, indígenas y activistas.
              </p>
            </div>

            <form className="login-form" onSubmit={handleLogin}>
              <label className="label-nombre">
                Nombre completo

                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ej. Ana Luisa Marca Tapia"
                />
              </label>

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Ingresando..." : "Ingresar"}
              </button>

              {formError ? (
                <p className="form-error">{formError}</p>
              ) : null}
            </form>

          </div>

          {/* DERECHA */}
          <div className="hero-image">
            <span className="hero-image-label">CURSO: JUSTICIA INDÍGENA, MÁS INFORMACIÓN 👇 </span>
            <br />
            <a href="https://cursoscepabol.indigena.bo" target="_blank" rel="noopener noreferrer">
              <img
                src="/fondo_jioc.webp"
                alt="Reporteros"
              />
            </a>
          </div>

        </section>
      ) : (
        <section className="course-shell">
          <div className="course-header">
            <p className="eyebrow">Bienvenido/a, {user.name}</p>
            <h1>CURSO DE CAPACITACIÓN "REPORTEROS POPULARES"</h1>
            <p className="hero-copy">Mira los videos dentro de esta página y presiona "Listo para mi examen" al acabar de ver el material audiovisual.</p>
            <p>
              <strong>Nota:</strong> Al acabar puedes solicitar tu certificado y/o credencial de CEPABOL contactando al número 71539769.
            </p>
          </div>

          <div className="course-grid">
            <div className="video-card">
              <div className="video-top">
                <span>{videos[activeVideo].title}</span>
                <div className="video-tabs">
                  {videos.map((video, index) => {
                    const isUnlocked = index === 0 || quizSubmittedTopics.includes(index - 1);
                    return (
                      <button
                        key={video.youtubeId}
                        type="button"
                        className={`video-tab${index === activeVideo ? " active" : ""}${!isUnlocked ? " locked" : ""}`}
                        onClick={() => isUnlocked && setActiveVideo(index)}
                        disabled={!isUnlocked}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
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
                <span>Progreso: {quizSubmittedTopics.length} de {videos.length} videos completados</span>
                <h2>Avance del curso</h2>
              </div>

              {showQuizForTopic === null && !quizSubmittedTopics.includes(activeVideo) && (
                <div className="ready-section">
                  <p>Después de ver el video, presiona el botón para responder las preguntas.</p>
                  <button type="button" className="ready-btn" onClick={handleReadyForExam}>
                    Listo para mi examen
                  </button>
                  <p className="quiz-info">Necesitas al menos 2 respuestas correctas para avanzar al siguiente video.</p>
                </div>
              )}

              {quizSubmittedTopics.includes(activeVideo) && showQuizForTopic === null && (
                <div className="completed-section">
                  <p>Video completado. Pasa al siguiente video.</p>
                </div>
              )}

              {showQuizForTopic !== null && !quizSubmittedTopics.includes(showQuizForTopic) && (
                <div className="quiz-section">
                  <h3>Cuestionario: {videos[showQuizForTopic].title}</h3>
                  <p>Responde correctamente al menos 2 de 3 preguntas para avanzar.</p>
                  {questionsData
                    .find((t) => t.topicIndex === showQuizForTopic)
                    ?.questions.map((q) => (
                      <div key={q.id} className="quiz-question">
                        <p className="quiz-question-text">{q.question}</p>
                        <div className="quiz-options">
                          {q.options.map((opt, oi) => (
                            <label key={oi} className="quiz-option-label">
                              <input
                                type="radio"
                                name={`q_${q.id}`}
                                checked={quizAnswers[q.id] === oi}
                                onChange={() => handleAnswerSelect(q.id, oi)}
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  <button
                    type="button"
                    className="quiz-submit-btn"
                    onClick={handleSubmitQuiz}
                    disabled={!showQuizForTopic || questionsData.find((t) => t.topicIndex === showQuizForTopic)?.questions.some((q) => quizAnswers[q.id] === undefined)}
                  >
                    Enviar respuestas
                  </button>
                </div>
              )}

              {quizSubmittedTopics.map((ti) => (
                topicScores[ti] ? (
                  <div key={ti} className="quiz-score-box">
                    <span className="quiz-score-topic">{videos[ti].title}:</span>{" "}
                    <span className="quiz-score-result">{topicScores[ti].score}/{topicScores[ti].total}</span>
                  </div>
                ) : null
              ))}

              {completed ? (
                <div className="completion-box">
                  <h3>¡Felicidades!</h3>
                  <p>Has completado todos los videos del curso.</p>
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
