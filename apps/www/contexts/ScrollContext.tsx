"use client";

import type React from "react";
import { createContext, useCallback, useContext } from "react";

interface ScrollContextType {
	scrollToElement: (elementId: string, offset?: number) => void;
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export function ScrollProvider({ children }: { children: React.ReactNode }) {
	const scrollToElement = useCallback((elementId: string, offset?: number) => {
		const element = document.getElementById(elementId);
		if (element) {
			const elementPosition =
				element.getBoundingClientRect().top + window.pageYOffset;

			// If no offset provided, calculate to center the element on screen
			const finalOffset =
				offset !== undefined
					? offset
					: window.innerHeight / 2 - element.offsetHeight / 2;

			const offsetPosition = elementPosition - finalOffset;

			window.scrollTo({
				top: offsetPosition,
				behavior: "smooth",
			});
		}
	}, []);

	return (
		<ScrollContext.Provider value={{ scrollToElement }}>
			{children}
		</ScrollContext.Provider>
	);
}

export function useScroll() {
	const context = useContext(ScrollContext);
	if (context === undefined) {
		throw new Error("useScroll must be used within a ScrollProvider");
	}
	return context;
}
