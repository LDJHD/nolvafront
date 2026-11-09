"use client";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface Props {
  provider: any;
}

const ProfileCompletion = ({ provider }: Props) => {
  if (!provider) return null;

  let score = 0;
  const items: { label: string; done: boolean; bonus: number }[] = [
    { label: "Nom commercial", done: !!provider.businessName, bonus: 10 },
    { label: "Type d'activité", done: !!provider.type && provider.type !== "autre", bonus: 10 },
    { label: "Ville", done: !!provider.city, bonus: 10 },
    { label: "Description", done: !!provider.description, bonus: 15 },
    { label: "Photo/Logo", done: !!provider.profilePhoto, bonus: 10 },
    { label: "Au moins 1 offre", done: (provider.offers?.length || 0) > 0, bonus: 15 },
    { label: "Disponibilités", done: (provider.availabilities?.length || 0) > 0, bonus: 10 },
    { label: "Vidéo de présentation", done: !!provider.videoUrl, bonus: 10 },
    { label: "Photos de réalisations", done: (provider.photos?.length || 0) > 0, bonus: 10 },
  ];

  items.forEach((item) => {
    if (item.done) score += item.bonus;
  });

  const suggestions = items.filter((i) => !i.done);

  return (
    <div className="nolva-profile-completion">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="fw-bold">Profil complété à {score}%</span>
        {score < 100 && <span className="text-muted small">Complétez pour plus de visibilité</span>}
      </div>
      <div className="nolva-completion-bar">
        <div className="nolva-completion-fill" style={{ width: `${score}%` }}></div>
      </div>
      {suggestions.length > 0 && (
        <div className="mt-2">
          <small className="text-muted">Suggestions :</small>
          <ul className="small mb-0">
            {suggestions.slice(0, 3).map((s) => (
              <li key={s.label}>Ajoutez {s.label.toLowerCase()} — +{s.bonus}%</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileCompletion;
