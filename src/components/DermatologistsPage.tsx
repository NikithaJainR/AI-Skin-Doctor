import React, { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  Phone,
  Clock,
  Star,
  ExternalLink,
  Navigation,
  Search,
  Building2,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Stethoscope,
  Compass,
  RefreshCw,
  CheckCircle2,
  User,
  Hospital,
} from "lucide-react";
import {
  NearbyDoctor,
  findNearbyDoctors,
  geocodeCityAndFindDoctors,
} from "../services/doctorLocatorService";

type LocationStatus =
  | "idle"
  | "checking"
  | "requesting"
  | "granted"
  | "denied"
  | "blocked"
  | "unavailable"
  | "timeout"
  | "error";

interface DermatologistsPageProps {
  isOpen?: boolean;
}

export const DermatologistsPage: React.FC<DermatologistsPageProps> = ({ isOpen = true }) => {
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasRetriedTimeout, setHasRetriedTimeout] = useState(false);

  // Doctors Search State
  const [isSearchingDoctors, setIsSearchingDoctors] = useState(false);
  const [doctors, setDoctors] = useState<NearbyDoctor[]>([]);
  const [doctorsError, setDoctorsError] = useState<string | null>(null);

  // Manual City Search State
  const [manualCity, setManualCity] = useState("");
  const [searchedCityName, setSearchedCityName] = useState<string | null>(null);
  const [showManualSearch, setShowManualSearch] = useState(false);

  // Filter & Pagination inside modal
  const [activeCategory, setActiveCategory] = useState<"all" | "dermatologist" | "clinic" | "hospital">("all");
  const [visibleCount, setVisibleCount] = useState(6);

  // Fetch nearby doctors using coordinates
  const searchNearbyDoctors = async (lat: number, lon: number) => {
    console.log("[LOCATION] Searching nearby doctors for coordinates:", lat, lon);
    setIsSearchingDoctors(true);
    setDoctorsError(null);
    setSearchedCityName(null);

    try {
      // First try server proxy route
      const res = await fetch(`/api/nearby-doctors?lat=${lat}&lon=${lon}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.doctors)) {
          setDoctors(data.doctors);
          setIsSearchingDoctors(false);
          return;
        }
      }

      // Client-side fallback if server fails
      const clientDocs = await findNearbyDoctors(lat, lon);
      setDoctors(clientDocs);
    } catch (err) {
      console.error("[LOCATION] Failed to fetch nearby doctors:", err);
      try {
        // Client fallback
        const clientDocs = await findNearbyDoctors(lat, lon);
        setDoctors(clientDocs);
      } catch (clientErr) {
        setDoctorsError("We couldn't load nearby doctors right now.");
      }
    } finally {
      setIsSearchingDoctors(false);
    }
  };

  // Request user location with fallback logic and iframe detection
  const requestLocation = useCallback((highAccuracy = true) => {
    const isSecure = typeof window !== "undefined" ? window.isSecureContext : false;
    const hasGeo = typeof navigator !== "undefined" && !!navigator.geolocation;
    const isIframe = typeof window !== "undefined" ? window.self !== window.top : false;

    console.log("[LOCATION] Requesting location");
    console.log("[LOCATION] Secure context:", isSecure);
    console.log("[LOCATION] Geolocation available:", hasGeo);
    console.log("[LOCATION] Iframe:", isIframe);

    if (!isSecure) {
      console.log("[LOCATION] Secure context required for geolocation");
      setLocationStatus("error");
      setErrorMessage("Location access requires a secure connection (HTTPS).");
      return;
    }

    if (!hasGeo) {
      console.log("[LOCATION] Geolocation not supported by browser");
      setLocationStatus("error");
      setErrorMessage("Geolocation is not supported by your browser.");
      return;
    }

    setLocationStatus("requesting");
    setErrorMessage(null);

    console.log("[LOCATION] Browser permission request initiated");

    const geoOptions = {
      enableHighAccuracy: highAccuracy,
      timeout: 15000,
      maximumAge: 300000,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // SUCCESS CALLBACK
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        console.log("[LOCATION] Location success");
        console.log("[LOCATION] Latitude received:", lat);
        console.log("[LOCATION] Longitude received:", lon);

        setCoords({ latitude: lat, longitude: lon });
        setLocationStatus("granted");
        setErrorMessage(null);

        // Immediately search nearby doctors
        searchNearbyDoctors(lat, lon);
      },
      (error) => {
        console.log("[LOCATION] Location error");
        console.log("[LOCATION] Error code:", error.code);
        console.log("[LOCATION] Error message:", error.message);

        if (error.code === error.TIMEOUT && !hasRetriedTimeout && highAccuracy) {
          console.log("[LOCATION] Timeout on high accuracy, retrying with standard accuracy...");
          setHasRetriedTimeout(true);
          requestLocation(false);
          return;
        }

        switch (error.code) {
          case 1: // PERMISSION_DENIED
            if (isIframe) {
              console.log("[LOCATION] Possible iframe/Permissions Policy restriction");
              setLocationStatus("blocked");
              setErrorMessage("Location access is blocked in the current preview environment.");
            } else {
              console.log("[LOCATION] Permission denied by user or browser setting");
              setLocationStatus("denied");
              setErrorMessage("Location permission was denied.");
            }
            break;

          case 2: // POSITION_UNAVAILABLE
            setLocationStatus("unavailable");
            setErrorMessage("Your location could not be determined.");
            break;

          case 3: // TIMEOUT
            setLocationStatus("timeout");
            setErrorMessage("Location request timed out.");
            break;

          default:
            setLocationStatus("error");
            setErrorMessage(error.message || "Unable to determine your location.");
            break;
        }
      },
      geoOptions
    );
  }, [hasRetriedTimeout]);

  // Perform manual city search
  const handleManualSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCity.trim()) return;

    setIsSearchingDoctors(true);
    setDoctorsError(null);

    try {
      const res = await fetch(`/api/search-doctors-city?city=${encodeURIComponent(manualCity.trim())}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.doctors)) {
          setDoctors(data.doctors);
          setSearchedCityName(data.cityFormatted || manualCity.trim());
          setIsSearchingDoctors(false);
          return;
        }
      }

      // Client fallback
      const result = await geocodeCityAndFindDoctors(manualCity.trim());
      setDoctors(result.doctors);
      setSearchedCityName(result.cityFormatted);
    } catch (err) {
      console.error("[LOCATION] Manual city search error:", err);
      setDoctorsError("We couldn't load doctors for this location right now.");
    } finally {
      setIsSearchingDoctors(false);
    }
  };

  // Diagnostic Startup & Permission Check on Modal Open
  useEffect(() => {
    if (isOpen) {
      const isSecure = typeof window !== "undefined" ? window.isSecureContext : false;
      const hasGeo = typeof navigator !== "undefined" && !!navigator.geolocation;
      const isIframe = typeof window !== "undefined" ? window.self !== window.top : false;

      console.log("[LOCATION] Application initialized / Doctors modal opened");
      console.log("[LOCATION] Secure context:", isSecure);
      console.log("[LOCATION] Geolocation available:", hasGeo);
      console.log("[LOCATION] Iframe:", isIframe);

      if (!isSecure) {
        console.log("[LOCATION] Insecure context detected");
        setLocationStatus("error");
        setErrorMessage("Location access requires a secure connection (HTTPS).");
        return;
      }

      if (typeof navigator !== "undefined" && navigator.permissions && navigator.permissions.query) {
        navigator.permissions
          .query({ name: "geolocation" as PermissionName })
          .then((permissionStatus) => {
            console.log("[LOCATION] Permission state:", permissionStatus.state);
            if (permissionStatus.state === "granted") {
              console.log("[LOCATION] Permission already granted, requesting position automatically...");
              requestLocation(true);
            } else if (permissionStatus.state === "denied") {
              if (isIframe) {
                console.log("[LOCATION] Geolocation state denied in preview iframe context");
                setLocationStatus("blocked");
                setErrorMessage("Location access is blocked in the current preview environment.");
              } else {
                setLocationStatus("denied");
                setErrorMessage("Location permission is blocked for this site in browser settings.");
              }
            } else {
              // "prompt" or unknown -> KEEP IDLE
              setLocationStatus("idle");
            }
          })
          .catch((err) => {
            console.log("[LOCATION] Permissions API check caught error, remaining idle:", err);
            setLocationStatus("idle");
          });
      }
    }
  }, [isOpen, requestLocation]);

  // Open standalone app window helper
  const handleOpenStandaloneApp = () => {
    if (typeof window !== "undefined") {
      window.open(window.location.href, "_blank", "noopener,noreferrer");
    }
  };

  // Filter doctors by category
  const filteredDoctors = doctors.filter((doc) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "dermatologist") return doc.type === "dermatologist" || doc.isDermatologySpecialist;
    if (activeCategory === "clinic") return doc.type === "clinic";
    if (activeCategory === "hospital") return doc.type === "hospital";
    return true;
  });

  const displayedDoctors = filteredDoctors.slice(0, visibleCount);

  return (
    <div className="space-y-4 py-1 max-w-4xl mx-auto">
      {/* LOCATION STATUS & ACTIONS CARD */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md space-y-4">
        {/* STATE 1: IDLE / UNREQUESTED */}
        {locationStatus === "idle" && (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Find a Dermatologist Near You
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Allow location access to find dermatologists, skin clinics and hospitals near your current location.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => requestLocation(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <MapPin className="w-4 h-4" />
                <span>Allow Location Access</span>
              </button>

              <button
                type="button"
                onClick={() => setShowManualSearch(!showManualSearch)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Search by City</span>
              </button>
            </div>
          </div>
        )}

        {/* STATE 2: CHECKING / REQUESTING */}
        {(locationStatus === "checking" || locationStatus === "requesting") && (
          <div className="flex items-center gap-3 py-2">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center shrink-0">
              <Loader2 className="w-5 h-5 animate-spin text-teal-400" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>Finding your location...</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Waiting for browser location prompt...
              </p>
            </div>
          </div>
        )}

        {/* STATE 3: GRANTED */}
        {locationStatus === "granted" && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-emerald-400 flex items-center gap-2">
                  <span>Location found ✓</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {searchedCityName ? `Showing results in ${searchedCityName}` : "Displaying nearby healthcare providers"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setHasRetriedTimeout(false);
                  requestLocation(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Location</span>
              </button>

              <button
                type="button"
                onClick={() => setShowManualSearch(!showManualSearch)}
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search by City</span>
              </button>
            </div>
          </div>
        )}

        {/* STATE 4: BLOCKED BY IFRAME / PREVIEW ENVIRONMENT */}
        {locationStatus === "blocked" && (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Compass className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-amber-300">
                  Location access is blocked in this preview
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  The embedded preview frame is restricting browser location access. You can open the application in a standalone browser tab or search for doctors by city name.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleOpenStandaloneApp}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Standalone App</span>
              </button>

              <button
                type="button"
                onClick={() => setShowManualSearch(true)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search by City</span>
              </button>
            </div>
          </div>
        )}

        {/* STATE 5: DENIED / ERROR / TIMEOUT / UNAVAILABLE */}
        {(locationStatus === "denied" ||
          locationStatus === "unavailable" ||
          locationStatus === "timeout" ||
          locationStatus === "error") && (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-rose-300">
                  {errorMessage || "Location access was not granted."}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  You can try again or search by entering a city name below.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setHasRetriedTimeout(false);
                  requestLocation(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>

              <button
                type="button"
                onClick={() => setShowManualSearch(true)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search by City</span>
              </button>
            </div>
          </div>
        )}

        {/* Manual City Search Expandable Box */}
        {showManualSearch && (
          <form
            onSubmit={handleManualSearchSubmit}
            className="pt-2 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={manualCity}
              onChange={(e) => setManualCity(e.target.value)}
              placeholder="Enter city or area (e.g. Bengaluru, Indiranagar)..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-800 text-white text-xs border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!manualCity.trim() || isSearchingDoctors}
              className="px-4 py-2 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 disabled:opacity-50 transition shrink-0 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </form>
        )}

        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 border-t border-slate-800/80 pt-2">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span>🔒 Your location is used only to find nearby healthcare providers and is not stored.</span>
        </div>
      </div>

      {/* SEARCHING DOCTORS LOADING STATE */}
      {isSearchingDoctors && (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 dark:text-teal-400 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <Search className="w-4 h-4 text-teal-500 animate-pulse" />
              <span>Finding nearby dermatologists...</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Querying OpenStreetMap healthcare records within 5–10 km...
            </p>
          </div>
        </div>
      )}

      {/* NETWORK / API ERROR STATE */}
      {!isSearchingDoctors && doctorsError && (
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-rose-900 dark:text-rose-200">
              We couldn't load nearby doctors right now.
            </h4>
            <p className="text-xs text-rose-700 dark:text-rose-300">{doctorsError}</p>
          </div>
          <div className="flex justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                if (coords) searchNearbyDoctors(coords.latitude, coords.longitude);
                else requestLocation(true);
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-xs"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => setShowManualSearch(true)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Search by City
            </button>
          </div>
        </div>
      )}

      {/* NO RESULTS STATE */}
      {!isSearchingDoctors && !doctorsError && doctors.length === 0 && locationStatus === "granted" && (
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-3">
          <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
              No nearby dermatologists were found within 10 km.
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Try searching another city or area name manually.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowManualSearch(true)}
            className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-500 transition"
          >
            Search by City / Area
          </button>
        </div>
      )}

      {/* RESULTS LIST SECTION */}
      {!isSearchingDoctors && !doctorsError && doctors.length > 0 && (
        <div className="space-y-3">
          {/* Header & Category Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Nearby Healthcare Providers</span>
              </h4>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {searchedCityName ? `Showing results in ${searchedCityName}` : "Based on your current location"} · {filteredDoctors.length} found
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  activeCategory === "all"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                All ({doctors.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("dermatologist")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  activeCategory === "dermatologist"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                Dermatology
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("clinic")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  activeCategory === "clinic"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                Clinics
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("hospital")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  activeCategory === "hospital"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                Hospitals
              </button>
            </div>
          </div>

          {/* DOCTOR CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {displayedDoctors.map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 hover:border-teal-500/60 transition shadow-2xs space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  {/* Doctor Name / Category Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 dark:text-white">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span>{doc.doctorName || doc.facilityName}</span>
                      </div>

                      {doc.doctorName && (
                        <p className="text-[11px] font-bold text-teal-700 dark:text-teal-300 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-teal-500 shrink-0" />
                          <span>{doc.facilityName}</span>
                        </p>
                      )}

                      {!doc.doctorName && (
                        <p className="text-[10px] text-slate-400 italic mt-0.5">
                          Doctor information unavailable
                        </p>
                      )}
                    </div>

                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 shrink-0">
                      📍 {doc.distanceKm} km
                    </span>
                  </div>

                  {/* Address & Contact Info */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-1">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-tight line-clamp-2 text-slate-700 dark:text-slate-200">
                        {doc.address}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Phone className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                        {doc.phone ? (
                          <a
                            href={`tel:${doc.phone}`}
                            className="font-bold text-teal-600 dark:text-teal-400 hover:underline truncate"
                          >
                            {doc.phone}
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">Phone unavailable in OSM</span>
                        )}
                      </div>

                      {/* Web / Search lookup link */}
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(
                          `${doc.facilityName || doc.doctorName || "Dermatologist"} ${doc.address || ""}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-0.5 shrink-0"
                        title="Search clinic details and contact online"
                      >
                        <span>Find info</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Card Action: Directions & Call Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-2">
                  <a
                    href={doc.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
                  >
                    <Navigation className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Directions</span>
                    <ExternalLink className="w-3 h-3 text-teal-500" />
                  </a>

                  {doc.phone && (
                    <a
                      href={`tel:${doc.phone}`}
                      className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-extrabold flex items-center justify-center gap-1 transition shadow-2xs shrink-0"
                      title="Call clinic"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Show More Pagination Control */}
          {filteredDoctors.length > visibleCount && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Show More ({filteredDoctors.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
