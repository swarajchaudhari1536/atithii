"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";

interface LoadingContextType {
    startLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
    const context = useContext(LoadingContext);
    if (!context) throw new Error("useLoading must be used within LoadingProvider");
    return context;
}

export default function LoadingProvider({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Only trigger on initial app mount if needed, or remove to prevent forced delays
        // setLoading(true); 
    }, []);

    const startLoading = () => setLoading(true);

    return (
        <LoadingContext.Provider value={{ startLoading }}>
            {loading && <LoadingScreen onDone={() => setLoading(false)} />}
            <div
                style={{
                    opacity: loading ? 0 : 1,
                    transition: "opacity 0.6s ease",
                    pointerEvents: loading ? "none" : "auto",
                }}
            >
                {children}
            </div>
        </LoadingContext.Provider>
    );
}
