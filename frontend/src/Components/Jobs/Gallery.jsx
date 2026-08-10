import React from "react";

export default function Gallery({ job }) {
  const defaultImages = {
    Tech: [
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
      "https://images.unsplash.com/photo-1556157382-97eda2d62296",
    ],
    Banque: [
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0",
    ],
    Sante: [
      "https://images.unsplash.com/photo-1580281657527-47d54c6e7bc7",
      "https://images.unsplash.com/photo-1580281658623-0493e8edf580",
    ],
    ONG: [
      "https://images.unsplash.com/photo-1587502537745-84b6a5a5e57b",
      "https://images.unsplash.com/photo-1587502536374-0f3e7b5a71c7",
    ],
    Industrie: [
      "https://images.unsplash.com/photo-1581093588401-22d82d93e6c2",
      "https://images.unsplash.com/photo-1581092333081-1b94c8099211",
    ],
    Logistique: [
      "https://images.unsplash.com/photo-1590658268037-6fd9dff034dc",
      "https://images.unsplash.com/photo-1581091215367-59ab532c43c3",
    ],
    Administration: [
      "https://images.unsplash.com/photo-1560264418-c4445382edbc",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
    ],
    default: [
      "https://images.unsplash.com/photo-1521791136064-7986c2920216",
      "https://images.unsplash.com/photo-1556761175-4b46a572b786",
    ],
  };

  const imagesToShow = defaultImages[job.sector] || defaultImages.default;

  return (
    <section className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">Galerie & environnement de travail</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {imagesToShow.map((src, index) => (
          <img
            key={index}
            src={src}
            alt="Work environment"
            className="w-full h-52 object-cover rounded-lg shadow"
          />
        ))}
      </div>

      {job.video && (
        <div className="mt-6">
          <iframe
            src={job.video}
            title="Presentation video"
            className="w-full h-64 rounded-lg shadow"
            allowFullScreen
          ></iframe>
        </div>
      )}
    </section>
  );
}
