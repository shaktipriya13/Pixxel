// // custom hook

// import { useEffect, useState } from "react";

// export const useParallax=()=>{
//     const[scrollY,setScrollY]=useState(0);
//     // useEffect will be run whenever the component is loaded for the very first time
//     useEffect(()=>{
//         const handleScroll=()=>setScrollY(window.scrollY);
//         window.addEventListener("scroll",handleScroll);


//         // whenever the event unmounts we hv to clean up the event
//         return ()=>window.removeEventListener("scroll",handleScroll);
//     })
//     return scrollY;
// }
"use client";

import { useState, useEffect } from "react";

export const useParallax = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return scrollY;
};
