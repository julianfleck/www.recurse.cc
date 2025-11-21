"use client";

import { useEffect } from "react";
import { getDocsUrl } from "@/lib/utils";

/**
 * Quickstart page - redirects to docs quickstart
 */
export default function QuickstartPage() {
	useEffect(() => {
		window.location.href = getDocsUrl("/docs/getting-started/quickstart");
	}, []);

	return null;
}
