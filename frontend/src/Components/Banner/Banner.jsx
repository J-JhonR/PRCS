import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GrGroup } from "react-icons/gr"
import { CiSearch } from "react-icons/ci"

export const Banner = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();
    const params = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
    navigate(`/jobs${params}`);
  };

  return (
    <div className='w-full min-h-[550px] h-full bg-blue-50 bg-cover bg-center bg-no-repeat flex items-center justify-center'>
      <div className='lg:container mx-auto w-full px-4'>
        <div className='flex flex-col items-center justify-center w-full space-y-8'>
          <div className='max-w-[744px] w-full space-y-6'>
            <h3 className='text-6xl text-blue-800 font-semibold capitalize text-center'>
              Trouvez le job de vos rêves
            </h3>
            <p className='text-xl text-blue-700 font-normal text-center'>
              Explorez des opportunités dans votre domaine et postulez en quelques clics.
            </p>
          </div>
          {/* Barre de recherche centrée */}
          <form onSubmit={handleSearch} className="w-full max-w-xl mx-auto flex bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="flex items-center px-4">
              <CiSearch className="text-blue-800" size={24} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="flex-1 px-4 py-3 text-base outline-none border-none bg-transparent"
              placeholder="Cherchez un job par intitulé de poste, mot-clé ou entreprise"
            />
            <button
              type="submit"
              className="bg-blue-800 text-white px-6 py-3 font-semibold text-base capitalize hover:bg-blue-900 transition"
            >
              Trouver un job
            </button>
          </form>
          {/* Bouton centré */}
          <Link to="/auth" className='max-w-[320px] w-full h-[62px] rounded-4xl  flex items-center justify-center gap-3 text-xl bg-[#334a523d] text-white font-semibold capitalize mx-auto'>
            Recevoir des opportunités <GrGroup size={'1.5rem'} color={'white'}/>
          </Link>
        </div>
      </div>
    </div>
  )
}