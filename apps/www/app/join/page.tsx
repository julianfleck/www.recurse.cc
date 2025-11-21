"use client";

import { useEffect } from "react";

/**
 * Join page - redirects to homepage signup form
 */
export default function JoinPage() {
	useEffect(() => {
		window.location.href = "/#signup";
	}, []);

	return null;
}
