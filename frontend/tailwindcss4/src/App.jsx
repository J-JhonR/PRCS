import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
      <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">PRCS Recrutement</h1>
          <nav className="space-x-4">
            <a href="#" className="text-gray-600 hover:text-blue-600">Accueil</a>
            <a href="#" className="text-gray-600 hover:text-blue-600">Offres</a>
            <a href="#" className="text-gray-600 hover:text-blue-600">Candidats</a>
            <a href="#" className="text-gray-600 hover:text-blue-600">Connexion</a>
          </nav>
        </div>
      </header>

      {/* Hero section */}
      <section className="bg-blue-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-blue-800">Trouvez le job de vos rêves</h2>
          <p className="text-lg text-blue-700 mb-6">
            Explorez des opportunités dans votre domaine et postulez en quelques clics.
          </p>
          <div className="flex justify-center gap-4">
            <input
              type="text"
              placeholder="Recherchez un poste ou une compétence"
              className="w-96 px-4 py-2 rounded-lg border border-gray-300"
            />
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Rechercher
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-2xl font-semibold text-center mb-12">Pourquoi choisir PRCS ?</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h4 className="text-lg font-bold mb-2">Offres sélectionnées</h4>
            <p className="text-gray-600">Accès à des offres triées sur le volet par nos experts RH.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h4 className="text-lg font-bold mb-2">Candidature rapide</h4>
            <p className="text-gray-600">Postulez directement avec votre CV en ligne en un seul clic.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h4 className="text-lg font-bold mb-2">Suivi des entretiens</h4>
            <p className="text-gray-600">Visualisez l’état de vos candidatures et vos rendez-vous.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-500">
          &copy; 2025 PRCS. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
  
}

export default App
