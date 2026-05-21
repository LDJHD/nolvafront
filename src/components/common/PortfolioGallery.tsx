"use client";
import { useState } from "react";

type Photo = { id?: number; url: string }

type Props = {
  photos: Photo[]
  title?: string
}

const PortfolioGallery = ({ photos, title = "Portfolio" }: Props) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  if (!photos?.length) return null

  const active = activeIndex !== null ? photos[activeIndex] : null

  return (
    <div className="gi-vendor-dashboard-card nolva-portfolio-card">
      <div className="gi-vendor-card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">{title}</h5>
        <span className="text-muted small">{photos.length} photo{photos.length > 1 ? "s" : ""}</span>
      </div>
      <div className="gi-vendor-card-body">
        <div className="nolva-portfolio-grid">
          {photos.map((photo, i) => (
            <button
              key={photo.id ?? i}
              type="button"
              className="nolva-portfolio-thumb"
              onClick={() => setActiveIndex(i)}
              aria-label={`Voir photo ${i + 1}`}
            >
              <img src={photo.url} alt={`Portfolio ${i + 1}`} />
            </button>
          ))}
        </div>
      </div>

      {active && (
        <div
          className="nolva-portfolio-lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveIndex(null)}
        >
          <div className="nolva-portfolio-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="nolva-portfolio-lightbox-close"
              onClick={() => setActiveIndex(null)}
              aria-label="Fermer"
            >
              ×
            </button>
            <img src={active.url} alt="Portfolio agrandi" />
            {photos.length > 1 && (
              <div className="nolva-portfolio-lightbox-nav">
                <button
                  type="button"
                  className="gi-btn-2 btn-sm"
                  disabled={activeIndex === 0}
                  onClick={() => setActiveIndex((i) => (i !== null && i > 0 ? i - 1 : 0))}
                >
                  Précédent
                </button>
                <span className="text-muted small">
                  {(activeIndex ?? 0) + 1} / {photos.length}
                </span>
                <button
                  type="button"
                  className="gi-btn-2 btn-sm"
                  disabled={activeIndex === photos.length - 1}
                  onClick={() =>
                    setActiveIndex((i) =>
                      i !== null && i < photos.length - 1 ? i + 1 : photos.length - 1
                    )
                  }
                >
                  Suivant
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PortfolioGallery
