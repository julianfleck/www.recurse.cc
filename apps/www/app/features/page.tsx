"use client";

import { useEffect } from "react";

/**
 * Features page - redirects to homepage features section
 */
export default function FeaturesPage() {
	useEffect(() => {
		window.location.href = "/#features";
	}, []);

	return null;
}
