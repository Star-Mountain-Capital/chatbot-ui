import { BusinessEntity } from "@/store/slices";

export async function fetchBusinessEntitiesFromApi(
  apiBaseUrl?: string
): Promise<{
  assets: BusinessEntity[];
  funds: BusinessEntity[];
}> {
  const baseUrl =
    apiBaseUrl ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://172.173.148.66:8000";
  const response = await fetch(`${baseUrl}/business-entities`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}
