import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function HomeFeatures() {
  const MotionDiv = motion.div;
  const MotionImg = motion.img;

  // Variantes d'animation
  const fadeLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const fadeRight = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <section className="w-full py-20 bg-white">

      {/* ===== GRAND TITRE ===== */}
      <MotionDiv
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: { opacity: 0, y: 40 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.7, ease: "easeOut" },
          },
        }}
        className="text-center mb-16 px-4"
      >
        <h1 className="text-3xl md:text-5xl font-semibold text-blue-800 mb-3 leading-snug">
          Votre carrière mérite une plateforme à la hauteur
        </h1>
        <p className="text-gray-600 text-base md:text-xl max-w-2xl mx-auto leading-relaxed">
          Découvrez les entreprises de l’intérieur, laissez les recruteurs venir
          à vous et gérez toutes vos candidatures dans un espace simple,
          moderne et intelligent.
        </p>
      </MotionDiv>

      <div className="container mx-auto px-4 space-y-20">


        {/* ======== SECTION 1 ======== */}
        <div className="grid md:grid-cols-2 gap-10 items-center">

          <MotionImg
            src="/images/explore.jpg"
            className="rounded-xl shadow-lg w-full h-auto object-cover"
            alt="Explorer"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeLeft}
          />

          <MotionDiv
            className="text-center md:text-left px-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeRight}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-blue-800 mb-3">
              Explorez les entreprises de l’intérieur
            </h2>
            <p className="text-gray-600 mb-5 text-base md:text-lg leading-relaxed">
              Découvrez la culture, les valeurs et l’environnement de travail
              avant même de postuler. Explorez les coulisses des entreprises
              et trouvez celles qui vous correspondent vraiment.
            </p>
            <Link to="/entreprises" className="inline-block px-6 py-3 rounded-xl bg-blue-700 text-white hover:bg-blue-800 transition text-sm md:text-base">
              Découvrir les entreprises
            </Link>
          </MotionDiv>
        </div>


        {/* ======== SECTION 2 ======== */}
        <div className="grid md:grid-cols-2 gap-10 items-center">

          <MotionDiv
            className="order-2 md:order-1 text-center md:text-left px-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeLeft}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-blue-800 mb-3">
              Laissez les jobs venir à vous
            </h2>
            <p className="text-gray-600 mb-5 text-base md:text-lg leading-relaxed">
              Créez votre profil gratuitement, indiquez vos compétences et vos objectifs.
              Les recruteurs en recherche active pourront vous contacter directement.
            </p>
            <Link to="/dashboard" className="inline-block px-6 py-3 rounded-xl bg-blue-700 text-white hover:bg-blue-800 transition text-sm md:text-base">
              Activer les opportunités
            </Link>
          </MotionDiv>

          <MotionImg
            src="/images/opportunities.jpg"
            className="order-1 md:order-2 rounded-xl shadow-lg w-full h-auto object-cover"
            alt="Opportunités"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeRight}
          />
        </div>


        {/* ======== SECTION 3 ======== */}
        <div className="grid md:grid-cols-2 gap-10 items-center">

          <MotionImg
            src="/images/candidatures.jpg"
            className="rounded-xl shadow-lg w-full h-auto object-cover"
            alt="Candidatures"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeLeft}
          />

          <MotionDiv
            className="text-center md:text-left px-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeRight}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-blue-800 mb-3">
              Gérez vos candidatures facilement
            </h2>
            <p className="text-gray-600 mb-5 text-base md:text-lg leading-relaxed">
              Suivez l’évolution de vos candidatures, centralisez vos actions
              et restez organisé. Ne ratez plus aucune étape.
            </p>
            <Link to="/candidatures" className="inline-block px-6 py-3 rounded-xl bg-blue-700 text-white hover:bg-blue-800 transition text-sm md:text-base">
              Accéder à mes candidatures
            </Link>
          </MotionDiv>
        </div>


        {/* ======== SECTION 4 ======== */}
        <div className="grid md:grid-cols-2 gap-10 items-center">

          <MotionDiv
            className="order-2 md:order-1 text-center md:text-left px-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeLeft}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-blue-800 mb-3">
              Ne ratez plus aucune opportunité
            </h2>
            <p className="text-gray-600 mb-5 text-base md:text-lg leading-relaxed">
              Un profil complet remonte en priorité auprès des recruteurs.
              Prenez quelques minutes pour le mettre à jour.
            </p>
            <Link to="/profil" className="inline-block px-6 py-3 rounded-xl bg-blue-700 text-white hover:bg-blue-800 transition text-sm md:text-base">
              Compléter mon profil
            </Link>
          </MotionDiv>

          <MotionImg
            src="/images/alerts.jpg"
            className="order-1 md:order-2 rounded-xl shadow-lg w-full h-auto object-cover"
            alt="Alertes"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeRight}
          />
        </div>

      </div>
    </section>
  );
}
