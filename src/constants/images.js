// src/constants/images.js


// src/constants/images.js

export { default as logo } from '../assets/PNG/logo/logo_dantas_studio_01.png';



// --- HERO CAROUSEL ---
import carousel1 from '../assets/PNG/carousel/nail_carousel_1.png';
import carousel2 from '../assets/PNG/carousel/nail_carousel_2.png';
import carousel3 from '../assets/PNG/carousel/nail_carousel_3.png';
import carousel4 from '../assets/PNG/carousel/nail_carousel_4.png';

// --- GALERIA ---
import gallery1 from '../assets/PNG/galery/nail_galery_1.png';
import gallery2 from '../assets/PNG/galery/nail_galery_2.png';
import gallery3 from '../assets/PNG/galery/nail_galery_3.png';
import gallery4 from '../assets/PNG/galery/nail_galery_4.png';
import gallery5 from '../assets/PNG/galery/nail_galery_5.png';
import gallery6 from '../assets/PNG/galery/nail_galery_6.png';
import gallery7 from '../assets/PNG/galery/nail_galery_7.png';
import gallery8 from '../assets/PNG/galery/nail_galery_8.png';

// --- SERVIÇOS ---
import serviceFoot1 from '../assets/PNG/services/nail_foot_service_1.png';
import serviceHand1 from '../assets/PNG/services/nail_hand_service_1.png';
import serviceHand2 from '../assets/PNG/services/nail_hand_service_2.png';
import serviceHand3 from '../assets/PNG/services/nail_hand_service_3.png';
import serviceHand4 from '../assets/PNG/services/nail_hand_service_4.png';

// Criamos objetos organizados para exportar tudo de uma vez
export const CAROUSEL_IMAGES = [carousel1, carousel2, carousel3, carousel4];

export const GALLERY_IMAGES = [
  gallery1, gallery2, gallery3, gallery4, 
  gallery5, gallery6, gallery7, gallery8
];

export const SERVICE_IMAGES = {
  manicure: serviceHand1,
  pedicure: serviceFoot1,
  gel: serviceHand2,
  art: serviceHand3,
  acrylic: serviceHand4
};