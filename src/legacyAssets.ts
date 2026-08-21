// Keep legacy asset URLs emitted in production so existing MySQL/API records
// that reference the previous hashed image files continue to resolve while the
// public default images use optimized WebP assets.
import legacyLogo from "./assets/images/logo.png";
import legacyQasim from "./assets/images/Qasim.png";
import legacyDawood from "./assets/images/dawood.png";
import legacyShaban from "./assets/images/MrShaban.jpeg";
import legacySarah from "./assets/images/Sarah-Khan.jpeg";
import legacyMahaz from "./assets/images/mahaz.jpeg";
import legacyAshir from "./assets/images/ashir.jpeg";

export const legacyAssetManifest = [
  legacyLogo,
  legacyQasim,
  legacyDawood,
  legacyShaban,
  legacySarah,
  legacyMahaz,
  legacyAshir,
];
