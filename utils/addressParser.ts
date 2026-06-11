export interface AddressComponents {
  houseNumber: string;
  street: string;
  neighborhood: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  formattedAddress: string;
  lat: number;
  lng: number;
}

export function extractPincodeFromAddress(address: string): string | null {
  const match = address.match(/\b[1-9][0-9]{5}\b/);
  return match ? match[0] : null;
}

export async function extractFullAddress(lat: number, lng: number, mapsKey?: string): Promise<AddressComponents> {
  const key = mapsKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const resp = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`
  );
  const data = await resp.json();
  const result = data.results?.[0];
  const components: Record<string, string> = {};
  for (const comp of result?.address_components || []) {
    for (const type of comp.types) {
      if (!components[type]) components[type] = comp.long_name;
    }
  }

  return {
    houseNumber: components.street_number || "",
    street: components.route || "",
    neighborhood: components.sublocality || components.neighborhood || "",
    city: components.locality || components.sublocality || "",
    district: components.administrative_area_level_2 || components.locality || "",
    state: components.administrative_area_level_1 || "",
    pincode: components.postal_code || "",
    formattedAddress: result?.formatted_address || "",
    lat,
    lng,
  };
}
