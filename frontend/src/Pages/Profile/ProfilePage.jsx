import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FaBriefcase,
  FaBuilding,
  FaCalendarAlt,
  FaCheckCircle,
  FaEdit,
  FaFilePdf,
  FaGlobe,
  FaGraduationCap,
  FaLinkedin,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaPlus,
  FaSave,
  FaSpinner,
  FaTimes,
  FaTrash,
  FaUpload,
  FaUser,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";

import { useAuth } from "../../context/useAuth";
import { API_ORIGIN, apiFetch } from "../../lib/api";

const API = "/api/recruitment/profile/";

const emptyProfile = {
  full_name: "",
  first_name: "",
  last_name: "",
  user_email: "",
  headline: "",
  phone: "",
  location: "",
  bio: "",
  skills: [],
  experiences: [],
  education: [],
  availability_status: "open",
  linkedin_url: "",
  portfolio_url: "",
  cv: null,
  photo_profil: null,
};

const availabilityOptions = [
  { value: "open", label: "Disponible", tone: "bg-emerald-100 text-emerald-700" },
  { value: "interviewing", label: "En entretien", tone: "bg-blue-100 text-blue-700" },
  { value: "closed", label: "Non disponible", tone: "bg-slate-200 text-slate-700" },
];

function profileFromUser(user) {
  const fallbackName = splitFullName(user?.full_name);
  const firstName = user?.first_name || fallbackName.firstName;
  const lastName = user?.last_name || fallbackName.lastName;

  return {
    ...emptyProfile,
    first_name: firstName,
    last_name: lastName,
    full_name:
      user?.full_name ||
      `${firstName} ${lastName}`.trim() ||
      user?.username ||
      "",
    user_email: user?.email || "",
  };
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-24 right-6 z-50 px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 ${
        type === "success"
          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
          : "bg-red-50 text-red-800 border border-red-200"
      }`}
    >
      <FaCheckCircle className={type === "success" ? "text-emerald-500" : "text-red-500"} />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(emptyProfile);
  const [initialData, setInitialData] = useState(emptyProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await apiFetch(API);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || data.error || "Impossible de charger le profil.");
        }

        const normalized = normalizeProfile(data, user);
        setProfileData(normalized);
        setInitialData(normalized);
      } catch (error) {
        setToast({ type: "error", message: error.message });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(photoFile);
    setPhotoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photoFile]);

  const profileIdentity = useMemo(
    () => getProfileIdentity(profileData, user),
    [profileData, user]
  );
  const profileEmail = profileData.user_email || user?.email || "";
  const displayName = profileIdentity.fullName || "Utilisateur";
  const avatarUrl = photoPreview || resolveMediaUrl(profileData.photo_profil);
  const availability = availabilityOptions.find(
    (option) => option.value === profileData.availability_status
  ) || availabilityOptions[0];
  const roleLabel =
    user?.role === "recruteur"
      ? "Recruteur"
      : user?.role === "admin"
      ? "Administrateur"
      : "Candidat";

  const completionRate = useMemo(() => {
    const checks = [
      !!profileIdentity.firstName,
      !!profileIdentity.lastName,
      !!profileData.phone,
      !!profileData.location,
      !!profileData.headline,
      !!profileData.bio,
      profileData.skills.length > 0,
      profileData.experiences.length > 0,
      profileData.education.length > 0,
      !!profileData.linkedin_url || !!profileData.portfolio_url,
      !!profileData.cv || !!cvFile,
    ];
    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
  }, [profileData, profileIdentity, cvFile]);

  const completionSteps = [
    { label: "Prénom", done: !!profileIdentity.firstName },
    { label: "Nom", done: !!profileIdentity.lastName },
    { label: "Téléphone", done: !!profileData.phone },
    { label: "Localisation", done: !!profileData.location },
    { label: "Titre professionnel", done: !!profileData.headline },
    { label: "Présentation", done: !!profileData.bio },
    { label: "Competences", done: profileData.skills.length > 0 },
    { label: "Expériences", done: profileData.experiences.length > 0 },
    { label: "Formations", done: profileData.education.length > 0 },
    { label: "Liens professionnels", done: !!profileData.linkedin_url || !!profileData.portfolio_url },
    { label: "CV", done: !!profileData.cv || !!cvFile },
  ];

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayItemChange = (key, index, field, value) => {
    setProfileData((prev) => {
      const next = [...prev[key]];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, [key]: next };
    });
  };

  const addArrayItem = (key, item) => {
    setProfileData((prev) => ({ ...prev, [key]: [...prev[key], item] }));
  };

  const removeArrayItem = (key, index) => {
    setProfileData((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (!trimmed || profileData.skills.includes(trimmed)) return;
    setProfileData((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
  };

  const removeSkill = (skill) => {
    setProfileData((prev) => ({
      ...prev,
      skills: prev.skills.filter((item) => item !== skill),
    }));
  };

  const handleCancel = () => {
    setProfileData(initialData);
    setCvFile(null);
    setPhotoFile(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const formData = new FormData();
      formData.append("first_name", profileData.first_name || profileIdentity.firstName);
      formData.append("last_name", profileData.last_name || profileIdentity.lastName);
      formData.append("full_name", profileIdentity.fullName);
      formData.append("headline", profileData.headline || "");
      formData.append("phone", profileData.phone || "");
      formData.append("location", profileData.location || "");
      formData.append("bio", profileData.bio || "");
      formData.append("availability_status", profileData.availability_status || "open");
      formData.append("linkedin_url", profileData.linkedin_url || "");
      formData.append("portfolio_url", profileData.portfolio_url || "");
      formData.append("skills", JSON.stringify(profileData.skills));
      formData.append("experiences", JSON.stringify(profileData.experiences));
      formData.append("education", JSON.stringify(profileData.education));
      formData.append("remove_cv", String(!profileData.cv && !!initialData.cv && !cvFile));
      formData.append("remove_photo", String(!profileData.photo_profil && !!initialData.photo_profil && !photoFile));

      if (cvFile) {
        formData.append("cv", cvFile);
      }
      if (photoFile) {
        formData.append("photo_profil", photoFile);
      }

      const response = await apiFetch(API, {
        method: "PUT",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || "Impossible de sauvegarder le profil.");
      }

      const normalized = normalizeProfile(data, user);
      setProfileData(normalized);
      setInitialData(normalized);
      setCvFile(null);
      setPhotoFile(null);
      setIsEditing(false);
      updateUser({
        ...user,
        first_name: normalized.first_name,
        last_name: normalized.last_name,
        full_name: normalized.full_name,
        cv: normalized.cv,
        photo_profil: normalized.photo_profil,
      });
      setToast({ type: "success", message: "Profil mis à jour avec succès." });
    } catch (error) {
      setToast({ type: "error", message: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <FaSpinner className="animate-spin" />
          Chargement du profil...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8 px-4 sm:px-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto space-y-8">
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="h-36 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500" />
          <div className="px-6 sm:px-8 pb-8 -mt-16">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="flex items-end gap-5">
                <div className="relative">
                  <div className="w-32 h-32 rounded-3xl bg-white shadow-xl border-4 border-white flex items-center justify-center overflow-hidden text-4xl font-bold text-blue-700">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      displayName.charAt(0).toUpperCase()
                    )}
                  </div>
                  {isEditing && (
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => setPhotoFile(event.target.files?.[0] || null)}
                      />
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-medium shadow hover:bg-blue-700"
                      >
                        Photo
                      </button>
                      {(profileData.photo_profil || photoFile) && (
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoFile(null);
                            setProfileData((prev) => ({ ...prev, photo_profil: null }));
                          }}
                          className="px-3 py-1.5 rounded-full bg-white text-red-600 text-xs font-medium shadow border"
                        >
                          Retirer
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="pb-2">
                  <p className="text-sm uppercase tracking-[0.2em] text-white font-semibold">
                    Profil candidat
                  </p>
                  <h1 className="text-3xl font-bold text-slate-900 mt-1">
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {displayName}
                    </span>
                  </h1>
                  <p className="text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                    <span>{roleLabel}</span>
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${availability.tone}`}>
                      {availability.label}
                    </span>
                    {profileData.headline && (
                      <>
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                        <span>{profileData.headline}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl px-5 py-4 border border-slate-200 min-w-[280px]">
                <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                  <span>Profil complété</span>
                  <span className="font-semibold text-slate-900">{completionRate}%</span>
                </div>
                <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Complétez votre profil pour être plus visible auprès des recruteurs.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.9fr] gap-8">
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Informations du profil</h2>
                <p className="text-slate-500 mt-1">Cette page utilise maintenant des données backend.</p>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition flex items-center gap-2"
                    >
                      <FaTimes size={14} /> Annuler
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-70"
                    >
                      {isSaving ? (
                        <>
                          <FaSpinner className="animate-spin" size={14} /> Sauvegarde...
                        </>
                      ) : (
                        <>
                          <FaSave size={14} /> Sauvegarder
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <FaEdit size={14} /> Modifier
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField icon={<FaUser />} label="Prénom" name="first_name" value={profileData.first_name || profileIdentity.firstName} isEditing={isEditing} onChange={handleFieldChange} placeholder="Votre prénom" />
              <InfoField icon={<FaUser />} label="Nom" name="last_name" value={profileData.last_name || profileIdentity.lastName} isEditing={isEditing} onChange={handleFieldChange} placeholder="Votre nom" />
              <InfoField icon={<MdEmail />} label="Adresse email" value={profileEmail} placeholder="Votre email" />
              <InfoField icon={<FaPhoneAlt />} label="Téléphone" name="phone" value={profileData.phone} isEditing={isEditing} onChange={handleFieldChange} placeholder="Ajoutez votre numéro" />
              <InfoField icon={<FaMapMarkerAlt />} label="Localisation" name="location" value={profileData.location} isEditing={isEditing} onChange={handleFieldChange} placeholder="Ville, pays" />
              <InfoField icon={<FaBriefcase />} label="Titre professionnel" name="headline" value={profileData.headline} isEditing={isEditing} onChange={handleFieldChange} placeholder="Ex: Développeur Full Stack" />
              <AvailabilityField value={profileData.availability_status} isEditing={isEditing} onChange={handleFieldChange} />
              <InfoField icon={<FaLinkedin />} label="LinkedIn" name="linkedin_url" value={profileData.linkedin_url} isEditing={isEditing} onChange={handleFieldChange} placeholder="https://linkedin.com/in/..." />
              <InfoField icon={<FaGlobe />} label="Portfolio" name="portfolio_url" value={profileData.portfolio_url} isEditing={isEditing} onChange={handleFieldChange} placeholder="https://monsite.com" />
            </div>

            <div className="mt-6">
              <label className="text-sm font-medium text-slate-700">A propos</label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleFieldChange}
                  rows={4}
                  className="mt-2 w-full px-4 py-3 text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
                  placeholder="Parlez de vous, de votre parcours et de vos objectifs..."
                />
              ) : (
                <p className="text-slate-600 leading-7 mt-2 bg-slate-50 p-4 rounded-xl">
                  {profileData.bio || "Aucune présentation pour le moment."}
                </p>
              )}
            </div>

            <SkillsEditor
              skills={profileData.skills}
              isEditing={isEditing}
              onAddSkill={addSkill}
              onRemoveSkill={removeSkill}
            />

            <DynamicListSection
              title="Expérience professionnelle"
              icon={<FaBriefcase />}
              items={profileData.experiences}
              isEditing={isEditing}
              emptyItem={{ title: "", company: "", period: "" }}
              fields={[
                { key: "title", placeholder: "Titre du poste" },
                { key: "company", placeholder: "Entreprise" },
                { key: "period", placeholder: "Période" },
              ]}
              onAdd={(item) => addArrayItem("experiences", item)}
              onChange={(index, field, value) => handleArrayItemChange("experiences", index, field, value)}
              onRemove={(index) => removeArrayItem("experiences", index)}
            />

            <DynamicListSection
              title="Formation"
              icon={<FaGraduationCap />}
              items={profileData.education}
              isEditing={isEditing}
              emptyItem={{ degree: "", school: "", year: "" }}
              fields={[
                { key: "degree", placeholder: "Diplôme ou formation" },
                { key: "school", placeholder: "École ou université" },
                { key: "year", placeholder: "Année" },
              ]}
              onAdd={(item) => addArrayItem("education", item)}
              onChange={(index, field, value) => handleArrayItemChange("education", index, field, value)}
              onRemove={(index) => removeArrayItem("education", index)}
            />

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Curriculum Vitae</h3>
              {(profileData.cv || cvFile) ? (
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                    <FaFilePdf size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{cvFile?.name || getFilename(profileData.cv)}</p>
                    <p className="text-xs text-slate-500">
                      {cvFile ? `${Math.round(cvFile.size / 1024)} KB` : "CV enregistré"}
                    </p>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => {
                        setCvFile(null);
                        setProfileData((prev) => ({ ...prev, cv: null }));
                      }}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <FaTrash size={16} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center">
                  <FaUpload className="mx-auto text-slate-400 mb-3" size={24} />
                  <p className="text-slate-600 font-medium">Aucun CV téléchargé</p>
                </div>
              )}

              {isEditing && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(event) => setCvFile(event.target.files?.[0] || null)}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition flex items-center gap-2"
                  >
                    <FaUpload size={14} /> Choisir un CV PDF
                  </button>
                </>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <FaCheckCircle className="text-emerald-500" /> Checklist
              </h3>
              <div className="space-y-2 mt-5">
                {completionSteps.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3 bg-slate-50/50"
                  >
                    <span className="text-sm text-slate-700">{item.label}</span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        item.done ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {item.done ? "Terminé" : "En attente"}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-sm p-6 text-white">
              <h3 className="text-lg font-semibold">État actuel du profil</h3>
              <p className="text-slate-300 mt-3 leading-7">
                Cette page n'utilise plus de données locales simulées. Les informations sont
                chargées depuis Django et peuvent être sauvegardées.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function InfoField({ icon, label, value, isEditing, onChange, name, placeholder }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
      <div className="flex items-center gap-3 text-slate-500">
        <span className="text-blue-600 text-lg">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      {isEditing && name ? (
        <input
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          className="mt-3 w-full px-3 py-2 text-slate-900 font-medium bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
        />
      ) : (
        <p className="text-slate-900 font-medium mt-3">{value || placeholder || "-"}</p>
      )}
    </div>
  );
}

function AvailabilityField({ value, isEditing, onChange }) {
  const current = availabilityOptions.find((option) => option.value === value) || availabilityOptions[0];

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
      <div className="flex items-center gap-3 text-slate-500">
        <span className="text-blue-600 text-lg"><FaCheckCircle /></span>
        <span className="text-sm font-medium">Disponibilité</span>
      </div>
      {isEditing ? (
        <select
          name="availability_status"
          value={value || "open"}
          onChange={onChange}
          className="mt-3 w-full px-3 py-2 text-slate-900 font-medium bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
        >
          {availabilityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <p className="mt-3">
          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${current.tone}`}>
            {current.label}
          </span>
        </p>
      )}
    </div>
  );
}

function SkillsEditor({ skills, isEditing, onAddSkill, onRemoveSkill }) {
  const [newSkill, setNewSkill] = useState("");

  const handleAdd = () => {
    onAddSkill(newSkill);
    setNewSkill("");
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Competences</h3>
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {skills.map((skill, index) => (
          <span
            key={`${skill}-${index}`}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100"
          >
            {skill}
            {isEditing && (
              <button onClick={() => onRemoveSkill(skill)} className="text-blue-400 hover:text-red-500 transition-colors">
                <FaTimes size={12} />
              </button>
            )}
          </span>
        ))}
      </div>
      {isEditing && (
        <div className="flex items-center gap-2 mt-3">
          <input
            value={newSkill}
            onChange={(event) => setNewSkill(event.target.value)}
            placeholder="Ajouter une compétence"
            className="px-3 py-2 text-sm border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <button onClick={handleAdd} className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
            <FaPlus size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

function DynamicListSection({ title, icon, items, isEditing, emptyItem, fields, onAdd, onChange, onRemove }) {
  const [draft, setDraft] = useState(emptyItem);
  const canAdd = Object.values(draft).some((value) => String(value).trim() !== "");

  const handleAdd = () => {
    if (!canAdd) return;
    onAdd(draft);
    setDraft(emptyItem);
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
        {icon} {title}
      </h3>
      <div className="space-y-4">
        {items.length === 0 && !isEditing && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
            Aucune information pour le moment.
          </div>
        )}

        {items.map((item, index) => (
          <div key={index} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              {title.includes("Formation") ? <FaBuilding /> : <FaBriefcase />}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  {fields.map((field) => (
                    <input
                      key={field.key}
                      value={item[field.key] || ""}
                      onChange={(event) => onChange(index, field.key, event.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  ))}
                </div>
              ) : (
                <>
                  <h4 className="font-semibold text-slate-900">{item[fields[0].key] || "-"}</h4>
                  <p className="text-slate-600 text-sm">{item[fields[1].key] || "-"}</p>
                  <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                    <FaCalendarAlt size={12} /> {item[fields[2].key] || "-"}
                  </p>
                </>
              )}
            </div>
            {isEditing && (
              <button onClick={() => onRemove(index)} className="text-red-500 hover:text-red-700">
                <FaTrash size={14} />
              </button>
            )}
          </div>
        ))}

        {isEditing && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {fields.map((field) => (
                <input
                  key={field.key}
                  value={draft[field.key] || ""}
                  onChange={(event) => setDraft((prev) => ({ ...prev, [field.key]: event.target.value }))}
                  placeholder={field.placeholder}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-xl"
                />
              ))}
            </div>
            <button onClick={handleAdd} className="mt-3 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
              <FaPlus size={12} /> Ajouter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function normalizeProfile(data, user) {
  const userDefaults = profileFromUser(user);
  const profileNameFallback = splitFullName(data.full_name);
  const firstName = data.first_name || userDefaults.first_name || profileNameFallback.firstName;
  const lastName = data.last_name || userDefaults.last_name || profileNameFallback.lastName;
  return {
    ...userDefaults,
    ...data,
    first_name: firstName,
    last_name: lastName,
    full_name:
      `${firstName} ${lastName}`.trim() ||
      data.full_name ||
      userDefaults.full_name,
    user_email: data.user_email || userDefaults.user_email,
    availability_status: data.availability_status || "open",
    cv: resolveMediaUrl(data.cv ?? userDefaults.cv),
    photo_profil: resolveMediaUrl(data.photo_profil ?? userDefaults.photo_profil),
    skills: Array.isArray(data.skills) ? data.skills : [],
    experiences: Array.isArray(data.experiences) ? data.experiences : [],
    education: Array.isArray(data.education) ? data.education : [],
  };
}

function getProfileIdentity(profileData, user) {
  const userProfile = profileFromUser(user);
  const profileFullName = splitFullName(profileData.full_name);
  const userFullName = splitFullName(user?.full_name);
  const firstName =
    profileData.first_name ||
    userProfile.first_name ||
    profileFullName.firstName ||
    userFullName.firstName;
  const lastName =
    profileData.last_name ||
    userProfile.last_name ||
    profileFullName.lastName ||
    userFullName.lastName;

  return {
    firstName,
    lastName,
    fullName:
      `${firstName} ${lastName}`.trim() ||
      profileData.full_name ||
      user?.full_name ||
      user?.username ||
      "",
  };
}

function splitFullName(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
}

function getFilename(filePath) {
  if (!filePath) return "";
  const parts = String(filePath).split("/");
  return parts[parts.length - 1];
}

function resolveMediaUrl(path) {
  if (!path) return null;
  const value = String(path);
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("blob:")) {
    return value;
  }
  return `${API_ORIGIN}${value.startsWith("/") ? value : `/${value}`}`;
}
