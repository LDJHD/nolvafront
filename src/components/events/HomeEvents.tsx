"use client";
import useSWR from "swr";
import fetcher from "../fetcher-api/Fetcher";
import { normalizeList } from "@/lib/nolvaData";
import Spinner from "../button/Spinner";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { getTypeLabel, useEventTypes } from "@/lib/useCatalog";

const EventCard = ({ event, eventTypes }: { event: any; eventTypes: any[] }) => {
  const dateStr = event.eventDate || event.event_date;
  const price = Number(event.ticketPrice ?? event.ticket_price ?? 0);
  const eventType = event.eventType || event.event_type;
  const sold = Number(event.ticketsSold || event.tickets_sold || 0);
  const ticketCount = Number(event.ticketCount || event.ticket_count || 0);

  return (
    <div className="nolva-event-card">
      <div className="nolva-event-image">
        {event.image || event.cover_image ? (
          <img src={event.image || event.cover_image} alt={event.title} />
        ) : (
          <div className="nolva-event-placeholder">
            <i className="fi fi-rr-calendar-star"></i>
          </div>
        )}
        <div className="nolva-event-date-badge">
          <span className="day">
            {dateStr ? new Date(dateStr).getDate() : "--"}
          </span>
          <span className="month">
            {dateStr
              ? new Date(dateStr).toLocaleDateString("fr-FR", { month: "short" })
              : ""}
          </span>
        </div>
        {eventType && (
          <span className="nolva-event-corner-badge">
            {getTypeLabel(eventTypes, eventType)}
          </span>
        )}
        {price > 0 ? (
          <span className="nolva-event-price-tag">
            {price.toLocaleString()} FCFA
          </span>
        ) : (
          <span className="nolva-event-price-tag free">Gratuit</span>
        )}
      </div>
      <div className="nolva-event-content">
        <h5 className="nolva-event-title">{event.title}</h5>
        <div className="nolva-event-meta">
          <span>
            <i className="fi fi-rr-marker"></i>
            {event.location || event.city || "Benin"}
          </span>
          <span>
            <i className="fi fi-rr-clock"></i>
            {dateStr
              ? new Date(dateStr).toLocaleDateString("fr-FR", {
                  weekday: "short",
                  day: "numeric",
                  month: "long",
                })
              : "Date a confirmer"}
          </span>
        </div>
        {event.description && (
          <p className="nolva-event-desc">
            {event.description.length > 90
              ? event.description.substring(0, 90) + "..."
              : event.description}
          </p>
        )}
        <div className="nolva-event-actions">
          <Link href={`/evenements/${event.id}`} className="nolva-event-btn">
            Découvrir <i className="fi fi-rr-arrow-small-right"></i>
          </Link>
        </div>
        <div className="nolva-event-social-proof">
          {ticketCount > 0 && ticketCount - sold <= 20
            ? "Places limitées"
            : `${Math.max(sold, ticketCount || 80)} participants attendus`}
        </div>
      </div>
    </div>
  );
};

const HomeEvents = () => {
  const { data, error } = useSWR("/api/events/upcoming", fetcher);
  const { types: eventTypes } = useEventTypes();

  if (error) return null;
  if (!data) return <div className="text-center py-4"><Spinner /></div>;

  const events = normalizeList(data);

  if (events.length === 0) return null;

  return (
    <section className="nolva-events-section padding-tb-40">
      <div className="container">
        <div className="section-title-2 text-center mb-4">
          <h2 className="gi-title">
            Evenements <span>a venir</span>
          </h2>
          <p>Decouvrez les prochains evenements au Benin</p>
        </div>

        {/* Desktop: Grid classique */}
        <div className="nolva-events-grid d-none d-md-grid">
          {events.slice(0, 10).map((event: any, index: number) => (
            <EventCard key={event.id || index} event={event} eventTypes={eventTypes} />
          ))}
        </div>

        {/* Mobile: Carousel Swiper avec boutons prev/next */}
        <div className="d-md-none nolva-mobile-carousel">
          <Swiper
            modules={[Navigation]}
            spaceBetween={16}
            slidesPerView={1.15}
            centeredSlides={false}
            navigation={{
              prevEl: ".nolva-events-prev",
              nextEl: ".nolva-events-next",
            }}
            breakpoints={{
              400: { slidesPerView: 1.3 },
              500: { slidesPerView: 1.6 },
            }}
          >
            {events.slice(0, 10).map((event: any, index: number) => (
              <SwiperSlide key={event.id || index}>
                <EventCard event={event} eventTypes={eventTypes} />
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="nolva-carousel-nav">
            <button className="nolva-carousel-btn nolva-events-prev" aria-label="Précédent">
              <i className="fi fi-rr-angle-left"></i>
            </button>
            <button className="nolva-carousel-btn nolva-events-next" aria-label="Suivant">
              <i className="fi fi-rr-angle-right"></i>
            </button>
          </div>
        </div>

        <div className="text-center mt-4">
          <Link href="/evenements" className="gi-btn-2">
            Tous les evenements <i className="fi fi-rr-angle-double-small-right"></i>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeEvents;
