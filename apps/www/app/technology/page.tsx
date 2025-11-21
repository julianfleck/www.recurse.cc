"use client";

import { useEffect } from "react";

/**
 * Technology page - redirects to homepage build section
 */
export default function TechnologyPage() {
	useEffect(() => {
		window.location.href = "/#build";
	}, []);

	return null;
}
