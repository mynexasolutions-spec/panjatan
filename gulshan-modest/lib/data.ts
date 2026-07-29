export const SITE = {
  name: "Panjatan Ayurveda",
  tagline: "Pure Ayurvedic Medicines for a Healthy Today & Better Tomorrow",
  email: "care@panjatanayurveda.com",
  phone: "+91 73000 70707",
  phoneHref: "+917300070707",
  whatsapp: "917300070707",
  whatsappMessage: "Hi Panjatan Ayurveda! I would like to inquire about your Ayurvedic products.",
  city: "India",
};

export type Category = {
  id: string;
  name: string;
  description?: string;
  image: string;
  count?: string;
};

export const categories: Category[] = [
  {
    id: "digestive-care",
    name: "Digestive Care",
    description: "Natural herbal formulations for acidity, bloating, and indigestion",
    image: "/categories/digestive-care.png",
    count: "12 products",
  },
  {
    id: "joint-pain-relief",
    name: "Joint & Pain Relief",
    description: "Ayurvedic oils and supplements for joint flexibility and pain relief",
    image: "/categories/joint-pain.png",
    count: "8 products",
  },
  {
    id: "womens-health",
    name: "Women's Health",
    description: "Hormonal balance and overall vitality care for women",
    image: "/categories/womens-health.png",
    count: "10 products",
  },
  {
    id: "diabetes-care",
    name: "Diabetes Care",
    description: "Herbal support for maintaining healthy blood sugar levels",
    image: "/categories/diabetes-care.png",
    count: "6 products",
  },
  {
    id: "immunity-booster",
    name: "Immunity Booster",
    description: "Pure herbs to strengthen body defense and overall wellness",
    image: "/categories/immunity-booster.png",
    count: "9 products",
  },
  {
    id: "liver-care",
    name: "Liver Care",
    description: "Detoxifying Ayurvedic remedies for optimal liver health",
    image: "/categories/liver-care.png",
    count: "5 products",
  },
  {
    id: "hair-care",
    name: "Hair Care",
    description: "Nourishing herbal oils & powders for strong and healthy hair",
    image: "/categories/hair-care.png",
    count: "7 products",
  },
  {
    id: "skin-care",
    name: "Skin Care",
    description: "Natural herbal glow formulations and skin purifying herbs",
    image: "/categories/skin-care.png",
    count: "8 products",
  },
  {
    id: "respiratory-care",
    name: "Respiratory Care",
    description: "Herbal syrups & powders for lung and cough relief",
    image: "/categories/respiratory-care.png",
    count: "6 products",
  },
];

export type Product = {
  id: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: string;
  rating: number;
  reviewsCount: number;
};

export const featuredProducts: Product[] = [
  {
    id: "pachan-plus-chatni",
    name: "Pachan Plus Chatni",
    category: "Digestive Care",
    description: "Complete Digestive Care",
    price: 230,
    image: "/products/pachan-plus-chatni.png",
    rating: 5,
    reviewsCount: 240,
  },
  {
    id: "pachan-plus-powder",
    name: "Pachan Plus Powder",
    category: "Digestive Care",
    description: "Improves Digestion & Relief",
    price: 210,
    image: "/products/pachan-plus-powder.png",
    rating: 5,
    reviewsCount: 190,
  },
  {
    id: "diabex-plus-capsule",
    name: "Diabex Plus Capsule",
    category: "Diabetes Care",
    description: "Helps Manage Blood Sugar",
    price: 290,
    image: "/products/diabex-plus-capsule.png",
    rating: 5,
    reviewsCount: 210,
  },
  {
    id: "livoplus-capsule",
    name: "Livoplus Capsule",
    category: "Liver Care",
    description: "Supports Liver Health",
    price: 275,
    image: "/products/livoplus-capsule.png",
    rating: 5,
    reviewsCount: 180,
  },
  {
    id: "rog-mukt-syrup",
    name: "Rog Mukt Syrup",
    category: "Immunity Booster",
    description: "Immunity Booster",
    price: 200,
    image: "/products/rog-mukt-syrup.png",
    rating: 5,
    reviewsCount: 160,
  },
];

export const products: Product[] = featuredProducts;

export type Ingredient = {
  name: string;
  image: string;
};

export const naturalIngredients: Ingredient[] = [
  { name: "Amla", image: "/ingredients/amla.png" },
  { name: "Giloy", image: "/ingredients/giloy.png" },
  { name: "Ashwagandha", image: "/ingredients/ashwagandha.png" },
  { name: "Kalmegh", image: "/ingredients/kalmegh.png" },
  { name: "Tulsi", image: "/ingredients/tulsi.png" },
  { name: "Neem", image: "/ingredients/neem.png" },
  { name: "Harad", image: "/ingredients/harad.png" },
];

export type Testimonial = {
  name: string;
  quote: string;
  rating: number;
};

export const testimonials: Testimonial[] = [
  {
    name: "Rahul Sharma",
    quote: "Pachan Plus Chatni has given me great relief from acidity and indigestion. Highly recommended!",
    rating: 5,
  },
  {
    name: "Neha Verma",
    quote: "Very effective and natural product. No side effects, only positive results.",
    rating: 5,
  },
  {
    name: "Mohd. Imran",
    quote: "I have been using Diabex Plus for 3 months. My sugar levels are more controlled now.",
    rating: 5,
  },
];

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/shop" },
  { label: "Categories", href: "#categories" },
  { label: "About Us", href: "/about" },
  { label: "Blog", href: "#blog" },
  { label: "Contact", href: "/contact" },
];

export const lookbook: string[] = [];

