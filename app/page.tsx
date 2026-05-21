"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";

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
  const [watchedVideos, setWatchedVideos] = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [showIndigena, setShowIndigena] = useState(false);


  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const trimmedName = name.trim();

    if (!trimmedName) {
      setFormError("Ingresa un nombre completo.");
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
        setFormError(result?.error ?? "No se registró en el form.");
        return;
      }

      const userId = result.userId ?? Date.now();
      const watched = Array.isArray(result.watchedVideos) ? result.watchedVideos : [];
      setUser({ name: trimmedName, age: 0, userId });
      setWatchedVideos(watched);
      setCompleted(watched.length === videos.length);
      setSaveMessage("Bienvenido/a. Ya puedes ver los videos y marcarlos como vistos.");
    } catch (error) {
      setFormError("No se registró en el form. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleWatched(videoIndex: number) {
    if (!user) return;
    if (watchedVideos.includes(videoIndex)) return;

    setIsSubmitting(true);
    try {
      const newWatchedVideos = [...watchedVideos, videoIndex];

      await fetch("/api/submit-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          watchedVideos: newWatchedVideos
        })
      });

      setWatchedVideos(newWatchedVideos);
      setCompleted(newWatchedVideos.length === videos.length);
    } catch (error) {
      setFormError("No se pudo guardar tu progreso. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <div className="indigena-pill">
        <button
          type="button"
          className="indigena-pill-btn"
          onClick={() => setShowIndigena((v) => !v)}
          aria-expanded={showIndigena}
        >
          <span className="indigena-dot" />
          <span className="indigena-label">Justicia Indígena</span>
        </button>
        {showIndigena && (
          <div className="indigena-popover">
            <p className="indigena-popover-text">
              ¿Te gustaría aprender sobre la Justicia Indígena? Explora nuestro curso.
            </p>
            <a
              href="https://cursoscepabol.indigena.bo"
              target="_blank"
              rel="noopener noreferrer"
              className="indigena-popover-link"
            >
              Ir al curso
            </a>
          </div>
        )}
      </div>
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

              <h1>PROGRAMA DE FORMACIÓN PARA REPORTEROS.</h1>

              <p className="hero-copy">
                Accede al material audiovisual seleccionado para tu capacitación como reportero.
              </p>
            </div>

            <form className="login-form" onSubmit={handleLogin}>
              <label>
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
            <img
              src="/1770729202965.webp"
              alt="Reporteros"
            />
          </div>

        </section>
      ) : (
        <section className="course-shell">
          <div className="course-header">
            <p className="eyebrow">Bienvenido/a, {user.name}</p>
            <h1>FORMACIÓN PARA REPORTEROS CEPABOL</h1>
            <p className="hero-copy">Mira los videos dentro de esta página y márcalos como vistos justo al acabar de ver el video.</p>
            <p>
              <strong>Nota:</strong> Al acabar puedes solicitar tu certificado y/o credencial de CEPABOL contactando al número 71539769.
            </p>
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
                <span>Progreso: {watchedVideos.length} de {videos.length} videos vistos</span>
                <h2>Marca los videos como vistos</h2>
              </div>

              <div className="options-list">
                {videos.map((video, index) => (
                  <label key={video.youtubeId} className="video-checkbox-label">
                    <input
                      type="checkbox"
                      checked={watchedVideos.includes(index)}
                      onChange={() => toggleWatched(index)}
                      disabled={isSubmitting || index !== activeVideo || watchedVideos.includes(index)}
                    />
                    <span className={watchedVideos.includes(index) ? "video-title watched" : "video-title"}>
                      {index + 1}. {video.title}
                      {index !== activeVideo && !watchedVideos.includes(index) && (
                        <span className="video-hint"> (mira este video para marcarlo)</span>
                      )}
                    </span>
                  </label>
                ))}
              </div>

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
