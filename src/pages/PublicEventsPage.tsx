// src/pages/PublicEventsPage.tsx
import React from "react";

type PublicEvent = {
  id: string;
  title: string;
  startAt: string; // ISO
  city?: string;
  country?: string;
  coverUrl?: string;
  attendeesCount?: number;
};

const mockEvents: PublicEvent[] = [
  {
    id: "evt-1",
    title: "Concierto en Lima",
    startAt: "2025-10-20T10:00:00-05:00",
    city: "Lima",
    country: "Perú",
    coverUrl: "https://umfworldwide.com/wp-content/uploads/2024/06/ultra.png",
    attendeesCount: 120,
  },
  {
    id: "evt-2",
    title: "Running Evento",
    startAt: "2025-12-01T11:00:00-05:00",
    city: "Cusco",
    country: "Perú",
    coverUrl:
      "https://elcomercio.pe/resizer/oOtgcO8rN0k-9-QI8qQh8QqxiOY=/980x528/smart/filters:format(jpeg):quality(75)/arc-anglerfish-arc2-prod-elcomercio.s3.amazonaws.com/public/QFTTDA62FRCITK5SYJ2DCCWGBA.jpg",
    attendeesCount: 85,
  },
  {
    id: "evt-3",
    title: "Aniversario de Arequipa: Festival Cultural",
    startAt: "2025-11-05T18:00:00-05:00",
    city: "Arequipa",
    country: "Perú",
    coverUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop",
    attendeesCount: 64,
  },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("es-PE", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const fallbackImg =
  "https://images.unsplash.com/photo-1515165562835-c3b8c2e3a9a1?q=80&w=1600&auto=format&fit=crop";

const PublicEventsPage: React.FC = () => {
  const now = Date.now();
  const upcomingEvents = mockEvents
    .filter((e) => new Date(e.startAt).getTime() >= now) // solo futuros
    .sort(
      (a, b) =>
        new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    ); // ascendente

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Eventos públicos</h2>
        <p className="text-muted mb-0">Descubre eventos en Perú</p>
      </div>

      <div className="row g-4">
        {upcomingEvents.map((ev) => (
          <div className="col-3" key={ev.id}>
            <div className="card h-100 shadow-sm border-0">
              <div className="position-relative">
                <img
                  src={ev.coverUrl || fallbackImg}
                  className="card-img-top"
                  alt={`Imagen del evento ${ev.title}`}
                  style={{ objectFit: "cover", height: 170 }}
                />
              </div>

              <div className="card-body d-flex flex-column">
                <h5 className="card-title mb-2">{ev.title}</h5>

                <div className="small text-muted mb-1">
                  <i className="bi bi-calendar-event me-2"></i>
                  {formatDate(ev.startAt)}
                </div>

                {(ev.city || ev.country) && (
                  <div className="small text-muted mb-1">
                    <i className="bi bi-geo-alt me-2"></i>
                    {[ev.city, ev.country].filter(Boolean).join(", ")}
                  </div>
                )}

                <div className="small text-muted">
                  <i className="bi bi-people me-2"></i>
                  {ev.attendeesCount ?? 0} asistentes
                </div>

                <div className="mt-auto pt-3">
                  <button type="button" className="btn btn-outline-light border">
                    Ver detalles <i className="bi bi-arrow-right ms-1"></i>
                  </button>
                  {/* sin funcionalidad por ahora */}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {upcomingEvents.length === 0 && (
        <div className="text-center text-muted py-5">
          No hay eventos públicos
        </div>
      )}
    </div>
  );
};

export default PublicEventsPage;
