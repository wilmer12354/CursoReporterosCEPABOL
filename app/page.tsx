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
  const [quizStep, setQuizStep] = useState(0);
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
    setQuizStep(0);
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
      setQuizStep(0);
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

            <div className="whatsapp-cta hide-desktop">
              <svg className="whatsapp-cta-icon" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <p className="whatsapp-cta-text">Únete al siguiente grupo para más información 👉</p>
              <a className="whatsapp-cta-link" href="https://chat.whatsapp.com/JNh9Kasyygz2rzEqzp7KGb" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Grupo WhatsApp
              </a>
            </div>

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

              <div className="whatsapp-cta">
                <svg className="whatsapp-cta-icon" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <p className="whatsapp-cta-text">Por si aún no te uniste al grupo 👉 </p>
                <a className="whatsapp-cta-link" href="https://chat.whatsapp.com/JNh9Kasyygz2rzEqzp7KGb" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Grupo WhatsApp
                </a>
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
                  <p className="quiz-step-indicator">Pregunta {quizStep + 1} de 3</p>
                  {(() => {
                    const topic = questionsData.find((t) => t.topicIndex === showQuizForTopic);
                    if (!topic) return null;
                    const q = topic.questions[quizStep];
                    const isAnswered = quizAnswers[q.id] !== undefined;
                    return (
                      <>
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
                        <div className="quiz-nav">
                          {quizStep < 2 ? (
                            <button
                              type="button"
                              className="quiz-next-btn"
                              onClick={() => setQuizStep(quizStep + 1)}
                              disabled={!isAnswered}
                            >
                              Siguiente
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="quiz-submit-btn"
                              onClick={(e) => {
                                e.currentTarget.disabled = true;
                                handleSubmitQuiz();
                              }}
                              disabled={!isAnswered}
                            >
                              Enviar respuestas
                            </button>
                          )}
                        </div>
                      </>
                    );
                  })()}
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
