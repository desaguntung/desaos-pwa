 "use client";
 
 import { useEffect } from "react";
 
 export default function ConsoleSilencer() {
   useEffect(() => {
     const origError = console.error as (...args: any[]) => void;
     console.error = (...args: any[]) => {
       const first = args[0];
       const msg = typeof first === "string" ? first : "";
       if (
         msg.includes("Invalid source map") ||
         msg.includes("sourceMapURL could not be parsed") ||
         msg.includes("baseline-browser-mapping")
       ) {
         return;
       }
       origError(...args);
     };
     return () => {
       console.error = origError;
     };
   }, []);
   return null;
 }
