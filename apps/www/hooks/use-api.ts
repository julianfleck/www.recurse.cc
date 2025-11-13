"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiService } from "@/services/api";

interface UseApiOptions {
	immediate?: boolean;
	baseUrl?: string;
}

interface UseApiResult<T> {
	data: T | null;
	loading: boolean;
	error: string | null;
	execute: () => Promise<void>;
	reset: () => void;
}

export function useApi<T>(
	apiCall: (service: ApiService) => Promise<T>,
	options: UseApiOptions = {},
): UseApiResult<T> {
	const { immediate = true, baseUrl = "https://jsonplaceholder.typicode.com" } =
		options;

	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const execute = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const apiService = new ApiService(baseUrl);
			const result = await apiCall(apiService);
			setData(result);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	}, [apiCall, baseUrl]);

	const reset = () => {
		setData(null);
		setError(null);
		setLoading(false);
	};

	useEffect(() => {
		if (immediate) {
			execute();
		}
	}, [immediate, execute]);

	return { data, loading, error, execute, reset };
}
