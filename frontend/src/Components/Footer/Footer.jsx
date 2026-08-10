import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { MdEmail, MdLocationOn } from "react-icons/md";
import { FiPhoneCall } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-blue-900 to-blue-800 text-white pt-16 pb-10 mt-20 shadow-inner">
      <div className="container mx-auto px-6">

        {/* ================== TOP GRID ================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* LOGO + DESCRIPTION */}
          <div>
            <img src="/logo.png" alt="Logo" className="h-14 mb-5" />
            <p className="text-blue-200 text-sm leading-relaxed">
              Une plateforme moderne pour connecter les talents aux meilleures
              opportunités. Avancez dans votre carrière avec confiance.
            </p>
          </div>

          {/* LIENS RAPIDES */}
          <div>
            <h3 className="font-semibold text-2xl mb-4">Navigation</h3>

            <ul className="space-y-3">
              {[
                { link: "/jobs", label: "Offres d'emploi" },
                { link: "/entreprises", label: "Entreprises" },
                { link: "/auth", label: "Espace Candidats" },
                { link: "/recruteur", label: "Espace Recruteurs" },
              ].map((item, i) => (
                <li key={i}>
                  <Link
                    to={item.link}
                    className="text-blue-200 hover:text-white transition duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="font-semibold text-2xl mb-4">Contact</h3>

            <div className="space-y-3 text-blue-200 text-sm">
              <p className="flex items-center gap-2">
                <MdEmail size={18} className="text-blue-300" />
                contact@Uniq.com
              </p>

              <p className="flex items-center gap-2">
                <FiPhoneCall size={18} className="text-blue-300" />
                +(509) 3633 5128
              </p>

              <p className="flex items-center gap-2">
                <MdLocationOn size={20} className="text-blue-300" />
                Port-au-Prince, Haiti
              </p>
            </div>
          </div>

          {/* RÉSEAUX SOCIAUX */}
          <div>
            <h3 className="font-semibold text-2xl mb-4">Suivez-nous</h3>

            <div className="flex space-x-4">
              {[
                { icon: FaFacebookF, link: "#" },
                { icon: FaTwitter, link: "#" },
                { icon: FaInstagram, link: "#" },
                { icon: FaLinkedinIn, link: "#" },
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  className="bg-white/10 backdrop-blur-md p-3 rounded-xl hover:bg-white/20 transition duration-300"
                >
                  <item.icon className="text-white" size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>


        {/* ================== BOTTOM ================== */}
        <div className="border-t border-blue-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">

            <p className="text-blue-300 text-sm">
              © {new Date().getFullYear()} Uniq. Tous droits réservés.
            </p>

          </div>
        </div>

      </div>
    </footer>
  );
}
