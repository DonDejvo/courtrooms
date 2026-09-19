import React, { ReactNode, useContext } from "react";

export interface JsonResponse<T> {
    success: boolean;
    data?: T;
    error?: { message: string }[];
}

interface ApiState {
    sendJsonRequest<T>(path: string, method: string, body?: any, options?: any, isMultipart?: boolean): Promise<JsonResponse<T>>;
}

type QueryOptions = {
    method: string;
    headers?: Record<string, string>;
    body?: any;
    signal?: AbortSignal;
};

const ApiContext = React.createContext<ApiState>({} as ApiState);

export const useApi = () => useContext(ApiContext);

interface ApiProviderProps {
    baseUrl: string;
    children: ReactNode;
}

const ApiProvider = ({ baseUrl, children }: ApiProviderProps) => {

    const fetchQuery = async (
        path: string,
        options: QueryOptions,
        isMultipart: boolean = false
    ): Promise<Response> => {
        const headers: Record<string, string> = { ...options.headers };
        let body: BodyInit | undefined;

        if (options.method !== "GET") {
            if (isMultipart) {
                const formData = new FormData();
                if (options.body) {
                    for (const k in options.body) {
                        formData.append(k, options.body[k]);
                    }
                }
                body = formData;
            } else {
                headers["Content-Type"] = "application/json";
                body = JSON.stringify(options.body);
            }
        }

        return fetch(baseUrl + path, {
            method: options.method,
            credentials: "include",
            mode: "cors",
            headers,
            body,
            signal: options.signal,
        });
    };

    const sendJsonRequest = async function <T>(
        path: string,
        method: string,
        body: any = {},
        options: any = {},
        isMultipart: boolean = false
    ): Promise<JsonResponse<T>> {
        try {
            const response = await fetchQuery(
                path,
                { method, body, ...options },
                isMultipart
            );

            const json = await response.json() as JsonResponse<T>;

            return json;
        } catch {
            return { success: false, error: [{ message: "Požadavek se nepodařilo odeslat" }] };
        }
    };

    return (
        <ApiContext.Provider value={{ sendJsonRequest }}>
            {children}
        </ApiContext.Provider>
    );
};

export default ApiProvider; 