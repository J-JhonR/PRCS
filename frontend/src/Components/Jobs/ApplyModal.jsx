import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { HiUser, HiMail, HiUpload } from "react-icons/hi";
import { FaSpinner, FaCheckCircle } from "react-icons/fa";

import FilePreview from "../../Components/UI/FilePreview";
import { useAuth } from "../../context/useAuth";
import { apiFetch } from "../../lib/api";

export default function ApplyModal({ open, setOpen, job }) {
  const MotionDiv = motion.div;
  const { user, isLoggedIn } = useAuth();
  const [cvFile, setCvFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [fileError, setFileError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const MAX_SIZE = 5 * 1024 * 1024;

  if (!open) return null;

  const resetInputValue = (e) => {
    e.target.value = "";
  };

  const getFileIcon = (file) => {
    const ext = file.name.split(".").pop().toLowerCase();

    if (ext === "pdf") return "https://cdn-icons-png.flaticon.com/512/337/337946.png";
    if (ext === "doc" || ext === "docx") return "https://cdn-icons-png.flaticon.com/512/888/888883.png";

    return "https://cdn-icons-png.flaticon.com/512/833/833524.png";
  };

  const handleCvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_SIZE) {
      setFileError("Fichier trop lourd (max 5MB).");
      return;
    }

    setFileError("");
    setCvFile({ raw: file, name: file.name, size: file.size, icon: getFileIcon(file) });
  };

  const handleClose = () => {
    setOpen(false);
    setSuccess(false);
    setSubmitError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isLoggedIn) {
      setSubmitError("Connectez-vous pour postuler a cette offre.");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");

      const formData = new FormData();
      formData.append("job_offer", job.id);
      formData.append("cover_letter", coverLetter);
      if (cvFile) {
        formData.append("cv_file", cvFile.raw);
      }

      const response = await apiFetch("/api/recruitment/applications/", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        const message = data.job_offer?.[0] || data.error || data.detail || "Impossible d'envoyer votre candidature.";
        throw new Error(message);
      }

      setSuccess(true);
      setCoverLetter("");
      setCvFile(null);
    } catch (error) {
      setSubmitError(error.message || "Impossible d'envoyer votre candidature.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-start overflow-y-auto py-10"
      >
        <MotionDiv
          initial={{ scale: 0.8, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 40 }}
          transition={{ type: "spring", damping: 18 }}
          className="bg-white w-full max-w-3xl rounded-xl shadow-2xl p-8 relative"
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-black"
          >
            <IoClose size={28} />
          </button>

          <h2 className="text-3xl font-bold mb-6 text-blue-700">Postuler pour : {job.title}</h2>

          {!isLoggedIn ? (
            <p className="text-gray-700">
              Vous devez etre connecte pour postuler. Fermez cette fenetre et connectez-vous a votre
              compte candidat.
            </p>
          ) : success ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <FaCheckCircle size={48} className="text-emerald-500" />
              <p className="text-lg font-semibold text-gray-800">Candidature envoyee avec succes !</p>
              <p className="text-gray-500">Vous pouvez suivre son statut depuis votre espace candidatures.</p>
              <button onClick={handleClose} className="mt-4 bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800">
                Fermer
              </button>
            </div>
          ) : (
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <HiUser size={22} className="text-blue-700" />
                  <h3 className="text-xl font-semibold">Mes informations</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <HiUser className="absolute left-3 top-3 text-gray-400" />
                    <input
                      disabled
                      value={user?.full_name || user?.username || ""}
                      className="border border-gray-200 bg-gray-50 pl-10 p-2 rounded-lg w-full text-gray-600"
                    />
                  </div>
                  <div className="relative">
                    <HiMail className="absolute left-3 top-3 text-gray-400" />
                    <input
                      disabled
                      value={user?.email || ""}
                      className="border border-gray-200 bg-gray-50 pl-10 p-2 rounded-lg w-full text-gray-600"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Ces informations proviennent de votre profil candidat.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">CV</h3>
                {fileError && <p className="mb-2 text-sm text-red-600">{fileError}</p>}

                {!cvFile && (
                  <label className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer shadow">
                    <HiUpload />
                    Importer mon CV
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={handleCvUpload}
                      onClick={resetInputValue}
                    />
                  </label>
                )}

                {cvFile && (
                  <FilePreview
                    file={cvFile}
                    progress={100}
                    onRemove={() => setCvFile(null)}
                  />
                )}

                <p className="text-gray-500 text-xs mt-1">
                  Max 5MB. Si aucun fichier n'est joint, le CV deja present sur votre profil sera utilise.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <HiMail size={22} className="text-blue-700" />
                  <h3 className="text-xl font-semibold">Lettre de motivation</h3>
                </div>

                <textarea
                  rows={5}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Ecrivez votre message..."
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-300"
                />
              </div>

              {submitError && <p className="text-sm text-red-600">{submitError}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 w-full shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin" /> Envoi en cours...
                  </>
                ) : (
                  "Envoyer ma candidature"
                )}
              </button>
            </form>
          )}
        </MotionDiv>
      </MotionDiv>
    </AnimatePresence>
  );
}
