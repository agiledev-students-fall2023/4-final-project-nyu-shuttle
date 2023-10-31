import { useEffect, useState , useContext } from "react";
import { TutorialContext } from "../App";

const TutorialComponent = () => {
    const {tutorialIndex, setTutorialIndex, firstTime, setFirstTime, tutorialOn, setTutorialOn} = useContext(TutorialContext); // index of the tutorial page

    return (
        <>
            <div className="tutorial-backdrop">
                <h1 className="text-3xl"> Welcome to the NYU Shuttle APP! </h1>
                <p className="text-center text-md pt-10"> Our app makes campus commutes quick and easy. Enjoy real-time shuttle tracking and optimized routes.</p>
                <p className="mt-10 text-center italic text-sm">Click for a quick intro to get you started</p>
                <button className="mt-10 text-center mb-20 text-sm text-white bg-darkTone rounded-md px-4 py-2" onClick={() => {setTutorialOn(false)}}>Skip Tutorial</button>
            </div>
        </>
    )
}
export default TutorialComponent;