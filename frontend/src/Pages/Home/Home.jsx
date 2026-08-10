 import React from 'react'
import { Banner } from '../../Components/Banner/Banner'
import ExploreEntreprise from "../../Components/ExploreEntreprises/ExploreEntreprises";
import HomeFeatures from '../../Components/HomeFeatures/HomeFeatures';
 
 const Home = () => {
   return (
    <div>
        {/* banner component */}
        <div>
            <Banner />
            <ExploreEntreprise />
            <HomeFeatures />
        </div>
    </div>
     
   )
 }
 
 export default Home