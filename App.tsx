import React, { useState, useEffect, useMemo } from "react";
import Navbar, { MarijuanaLeaf } from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import GrowAssistant from "./components/GrowAssistant";
import ShopAssistant from "./components/ShopAssistant";
import About from "./components/About";
import StrainArt from "./components/StrainArt";
import SeedPack from "./components/SeedPack";
import GeneticsLibrary from "./components/GeneticsLibrary";
import ProductPage from "./components/ProductPage";
import CommandPalette from "./components/CommandPalette";
import UiHost from "./components/UiHost";
import { Aurora, CountUp, Reveal } from "./components/Motion";
import { ui } from "./lib/ui";
import { themeFor } from "./lib/strainTheme";
import {
  Product,
  CartItem,
  ViewState,
  StrainType,
  PastOrder,
  Stash,
} from "./types";
import {
  SEED_CATALOG,
  CLONE_CATALOG,
  MEDICINE_CATALOG,
  POLLEN_CATALOG,
} from "./constants";
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Check,
  Dna,
  ArrowUpRight,
  Lock,
  Mail,
  Truck,
  Search,
  Grid,
  List,
  CreditCard,
  Sparkles,
  X,
  Package,
  Plus,
  Edit2,
  Archive,
  GitFork,
  Printer,
  Leaf,
  Sprout,
  Wind,
  Pill,
  ShoppingBag,
  Bot,
  Gift,
  Copy,
  Minus,
  FlaskConical,
  Microscope,
  SlidersHorizontal,
  ChevronDown,
  Heart,
  Ticket,
} from "lucide-react";

/* ───────────── Small presentational helpers ───────────── */

const SectionHead: React.FC<{
  eyebrow: string;
  title: React.ReactNode;
  sub?: string;
  action?: React.ReactNode;
  center?: boolean;
}> = ({ eyebrow, title, sub, action, center }) => (
  <div className={`flex ${center ? "flex-col items-center text-center" : "flex-col md:flex-row md:items-end md:justify-between"} gap-5 mb-10 md:mb-14`}>
    <div className={center ? "max-w-2xl" : ""}>
      <div className="eyebrow mb-4">{eyebrow}</div>
      <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-[1.02] text-gradient-silver text-balance">{title}</h2>
      {sub && <p className="text-zinc-400 text-lg mt-4 max-w-xl">{sub}</p>}
    </div>
    {action}
  </div>
);

const PageTitle: React.FC<{ icon: React.ElementType; title: string; sub?: string; right?: React.ReactNode }> = ({ icon: Icon, title, sub, right }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
    <div className="flex items-center gap-5">
      <div className="w-16 h-16 rounded-3xl glass flex items-center justify-center shrink-0 shadow-glow">
        <Icon className="w-8 h-8 text-emerald-300" />
      </div>
      <div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-gradient-silver leading-none">{title}</h1>
        {sub && <p className="text-zinc-400 mt-2">{sub}</p>}
      </div>
    </div>
    {right}
  </div>
);

const EmptyState: React.FC<{ icon: React.ElementType; title: string; text: string; cta: string; onCta: () => void }> = ({ icon: Icon, title, text, cta, onCta }) => (
  <div className="glass rounded-[2rem] text-center py-24 px-6 border-dashed">
    <div className="w-24 h-24 rounded-full glass flex items-center justify-center mx-auto mb-6 animate-floaty">
      <Icon className="w-10 h-10 text-zinc-400" />
    </div>
    <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
    <p className="text-zinc-400 mb-8 max-w-md mx-auto">{text}</p>
    <button onClick={onCta} className="btn-primary px-8 py-3.5">{cta}</button>
  </div>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>("HOME");

  // --- Stash (Multi-Cart) State ---
  const [stashes, setStashes] = useState<Stash[]>(() => {
    const saved = localStorage.getItem("clean_genetics_stashes");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "default",
            name: "Main Stash",
            items: [],
            updatedAt: Date.now(),
          },
        ];
  });
  const [activeStashId, setActiveStashId] = useState<string>(() => {
    return localStorage.getItem("clean_genetics_active_stash") || "default";
  });

  // Derived Active Cart
  const activeStash = stashes.find((s) => s.id === activeStashId) || stashes[0];
  const cart = activeStash.items;

  // Persist Stashes
  useEffect(() => {
    localStorage.setItem("clean_genetics_stashes", JSON.stringify(stashes));
  }, [stashes]);

  useEffect(() => {
    localStorage.setItem("clean_genetics_active_stash", activeStashId);
  }, [activeStashId]);

  // --- Favorites (persisted) ---
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("clean_genetics_favorites") || "[]");
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("clean_genetics_favorites", JSON.stringify(favorites));
    } catch {}
  }, [favorites]);
  const toggleFavorite = (id: string) =>
    setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  const [favOnly, setFavOnly] = useState(false);

  // Product page navigation
  const [productId, setProductId] = useState<string | null>(null);
  const [prevView, setPrevView] = useState<ViewState>("SHOP");
  const restoreScroll = React.useRef<number | null>(null);

  // Phones render fewer cards up-front (lighter on memory); a button reveals the rest.
  const lite = useMemo(() => typeof window !== "undefined" && !!window.matchMedia?.("(max-width: 767px), (pointer: coarse)").matches, []);
  const [homeLimit, setHomeLimit] = useState(lite ? 6 : 999);
  const [shopLimit, setShopLimit] = useState(lite ? 6 : 999);

  // Home collection browser state
  const [homeQ, setHomeQ] = useState("");
  const [homeType, setHomeType] = useState<StrainType | "All">("All");
  const [homeFav, setHomeFav] = useState(false);
  const [homeMode, setHomeMode] = useState<"GRID" | "LIST">("GRID");

  // Free Seed Picker State
  const [showFreeSeedPicker, setShowFreeSeedPicker] = useState(false);
  const [randomSeedOptions, setRandomSeedOptions] = useState<Product[]>([]);
  
  // Custom Promo Popups
  const [showWelcomePromo, setShowWelcomePromo] = useState(false);
  
  // Fake Purchase Notifications
  const [purchaseNotification, setPurchaseNotification] = useState<{name: string, location: string, strain: string} | null>(null);

  // Initialize Welcome Promo
  useEffect(() => {
     const timer = setTimeout(() => {
        setShowWelcomePromo(true);
     }, 1500); // 1.5s after load
     return () => clearTimeout(timer);
  }, []);

  // Purchase Notifications System
  useEffect(() => {
     const names = ["John", "Michael", "David", "Sarah", "Emily", "Jessica", "James", "William", "Ashley", "Brian", "Alex", "Jordan", "Taylor", "Morgan"];
     const locations = ["California, USA", "New York, USA", "Ontario, Canada", "London, UK", "Texas, USA", "Melbourne, Australia", "Berlin, Germany", "Amsterdam, Netherlands", "Colorado, USA", "Barcelona, Spain"];
     
     const showRandomNotification = () => {
         const randomName = names[Math.floor(Math.random() * names.length)];
         const randomLocation = locations[Math.floor(Math.random() * locations.length)];
         const randomStrain = SEED_CATALOG[Math.floor(Math.random() * SEED_CATALOG.length)].name;
         
         setPurchaseNotification({ name: randomName, location: randomLocation, strain: randomStrain });
         
         // Hide after 5 seconds
         setTimeout(() => {
            setPurchaseNotification(null);
         }, 5000);
     };

     // First notification after 10s
     const initialTimer = setTimeout(() => {
        showRandomNotification();
        // Then every 15-30s
        const intervalTimer = setInterval(() => {
           showRandomNotification();
        }, Math.random() * 15000 + 15000);
        return () => clearInterval(intervalTimer);
     }, 10000);
     
     return () => clearTimeout(initialTimer);
  }, []);

  // Handle Free Seed Rewards Check
  useEffect(() => {
    if (!cart) return;

    const paidSeedCount = cart
       .filter(item => !item.isPromo && SEED_CATALOG.some(s => s.id === item.id))
       .reduce((sum, item) => sum + item.quantity, 0);
    
    const currentFreeSeedsCount = cart
       .filter(item => item.isPromo)
       .reduce((sum, item) => sum + item.quantity, 0);

    const eligibleFreeSeeds = Math.floor(paidSeedCount / 4);

    if (eligibleFreeSeeds > currentFreeSeedsCount && !showFreeSeedPicker) {
       // Need to pick a seed
       // Generate 3 random seeds
       const shuffled = [...SEED_CATALOG].sort(() => 0.5 - Math.random());
       setRandomSeedOptions(shuffled.slice(0, 3));
       setShowFreeSeedPicker(true);
    } else if (eligibleFreeSeeds < currentFreeSeedsCount) {
       // Need to remove excessive free seeds. Just drop them from stash from the end.
       let toRemove = currentFreeSeedsCount - eligibleFreeSeeds;
       setStashes((prev) =>
          prev.map((stash) => {
            if (stash.id === activeStashId) {
               let newItems = [...stash.items];
               for (let i = newItems.length - 1; i >= 0 && toRemove > 0; i--) {
                  if (newItems[i].isPromo) {
                     if (newItems[i].quantity > toRemove) {
                        newItems[i] = { ...newItems[i], quantity: newItems[i].quantity - toRemove };
                        toRemove = 0;
                     } else {
                        toRemove -= newItems[i].quantity;
                        newItems.splice(i, 1);
                     }
                  }
               }
               return { ...stash, items: newItems, updatedAt: Date.now() };
            }
            return stash;
          })
       );
    }
  }, [cart, activeStashId, showFreeSeedPicker]);

  const [filterType, setFilterType] = useState<StrainType | "All">("All");

  // Shop State
  const [viewMode, setViewMode] = useState<"GRID" | "LIST">("GRID");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "FEATURED" | "PRICE_LOW" | "PRICE_HIGH" | "THC_HIGH" | "THC_LOW"
  >("FEATURED");
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  const [medCategory, setMedCategory] = useState<"HONEY" | "OILS">("HONEY");

  // Promo State
  const [showPromoModal, setShowPromoModal] = useState(false);

  // Cart & Checkout State
  const [highlightedProduct, setHighlightedProduct] = useState<string | null>(
    null,
  );
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [shippingCountry, setShippingCountry] = useState("USA");
  const [zipCode, setZipCode] = useState("");
  const [invoiceSent, setInvoiceSent] = useState(false);
  const [hasSpunWheel, setHasSpunWheel] = useState(false);
  const [showWheel, setShowWheel] = useState(false);

  // Customer Info State
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  // Command palette (⌘K / Ctrl+K)
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Cursor spotlight: feed pointer position into any .spot element
  useEffect(() => {
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (e.pointerType !== "touch") {
          const light = document.getElementById("cursor-light");
          if (light) {
            light.style.setProperty("--cx", `${e.clientX}px`);
            light.style.setProperty("--cy", `${e.clientY}px`);
          }
          const fan = document.getElementById("hero-fan");
          if (fan) {
            fan.style.setProperty("--px", ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
            fan.style.setProperty("--py", ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
          }
        }
        const el = (e.target as HTMLElement | null)?.closest?.(".spot") as HTMLElement | null;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Scroll progress hairline
  useEffect(() => {
    const onScroll = () => {
      const bar = document.getElementById("scroll-progress");
      if (!bar) return;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${h > 0 ? (window.scrollY / h).toFixed(4) : 0})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [currentView]);

  // Scroll to top on every view change
  useEffect(() => {
    if (currentView !== "PRODUCT" && restoreScroll.current !== null) {
      const y = restoreScroll.current;
      restoreScroll.current = null;
      requestAnimationFrame(() => window.scrollTo({ top: y, behavior: "auto" }));
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [currentView, productId]);

  // Show wheel after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasSpunWheel) {
        setShowWheel(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [hasSpunWheel]);

  // Order History State
  const [orderHistory, setOrderHistory] = useState<PastOrder[]>([]);

  // Load Order History on Mount
  useEffect(() => {
    const savedOrders = localStorage.getItem("clean_genetics_orders");
    if (savedOrders) {
      try {
        setOrderHistory(JSON.parse(savedOrders));
      } catch (e) {
        console.error("Failed to parse orders", e);
      }
    }
  }, []);

  // --- Stash Manager Logic ---
  const createNewStash = async () => {
    const name = await ui.prompt("Name your new stash", {
      placeholder: "e.g. Outdoor 2026, Sativas",
      confirmLabel: "Create stash",
    });
    if (name) {
      const newStash: Stash = {
        id: Date.now().toString(),
        name,
        items: [],
        updatedAt: Date.now(),
      };
      setStashes((prev) => [...prev, newStash]);
      setActiveStashId(newStash.id);
    }
  };

  const renameStash = async () => {
    const newName = await ui.prompt("Rename stash", {
      defaultValue: activeStash.name,
      confirmLabel: "Rename",
    });
    if (newName) {
      setStashes((prev) =>
        prev.map((s) =>
          s.id === activeStashId
            ? { ...s, name: newName, updatedAt: Date.now() }
            : s,
        ),
      );
    }
  };

  const deleteStash = async () => {
    if (stashes.length <= 1) {
      ui.toast("You must keep at least one stash active.", "error");
      return;
    }
    const ok = await ui.confirm(`Delete "${activeStash.name}"?`, {
      description: "Everything inside this stash will be removed. This cannot be undone.",
      confirmLabel: "Delete stash",
      danger: true,
    });
    if (ok) {
      const newStashes = stashes.filter((s) => s.id !== activeStashId);
      setStashes(newStashes);
      setActiveStashId(newStashes[0].id);
    }
  };

  // --- Cart Logic (Refactored for Stashes) ---
  const addToCart = (product: Product, quantity: number = 1) => {
    setStashes((prev) =>
      prev.map((stash) => {
        if (stash.id === activeStashId) {
          const existing = stash.items.find(
            (item) => item.id === product.id && !item.isPromo,
          );
          const newItems = existing
            ? stash.items.map((item) =>
                item.id === product.id && !item.isPromo
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              )
            : [...stash.items, { ...product, quantity, isPromo: false }];
          return { ...stash, items: newItems, updatedAt: Date.now() };
        }
        return stash;
      }),
    );
  };

  const addPromoItem = (product: Product) => {
    setStashes((prev) =>
      prev.map((stash) => {
        if (stash.id === activeStashId) {
          // Promo items get a unique ID suffix to distinguish from paid items
          const promoId = `${product.id}_promo`;
          const existing = stash.items.find((item) => item.id === promoId);

          let newItems;
          if (existing) {
            newItems = stash.items.map(item => item.id === promoId ? { ...item, quantity: item.quantity + 1 } : item);
          } else {
            newItems = [
              ...stash.items,
              { ...product, id: promoId, quantity: 1, isPromo: true, price: 0 },
            ];
          }
          return { ...stash, items: newItems, updatedAt: Date.now() };
        }
        return stash;
      }),
    );
  };

  const updateQuantity = (id: string, newQty: number) => {
    setStashes((prev) =>
      prev.map((stash) => {
        if (stash.id === activeStashId) {
          if (newQty < 1)
            return { ...stash, items: stash.items.filter((i) => i.id !== id) };
          return {
            ...stash,
            items: stash.items.map((i) =>
              i.id === id ? { ...i, quantity: newQty } : i,
            ),
          };
        }
        return stash;
      }),
    );
  };

  const removeFromCart = (id: string) => {
    setStashes((prev) =>
      prev.map((stash) => {
        if (stash.id === activeStashId) {
          return { ...stash, items: stash.items.filter((i) => i.id !== id) };
        }
        return stash;
      }),
    );
  };

  // Helper to compute discount
  const getDiscounts = () => {
    const baseTotal = cart.reduce(
      (sum, item) => sum + (item.isPromo ? 0 : item.price * item.quantity),
      0,
    );

    let manualDiscountAmount = 0;
    if (appliedCoupon === "FREESEED") {
      manualDiscountAmount = 24.99;
    } else if (appliedCoupon === "10CLEANME") {
      manualDiscountAmount = baseTotal * 0.1;
    }

    return {
      baseTotal,
      autoDiscountAmount: 0,
      manualDiscountAmount,
      totalDiscountAmount: manualDiscountAmount,
    };
  };

  const { baseTotal: cartTotal, totalDiscountAmount } = getDiscounts();
  const discountedTotal = Math.max(0, cartTotal - totalDiscountAmount);

  // --- Checkout Logic ---
  const applyCoupon = () => {
    const code = couponCode.toUpperCase();
    if (code === "FREESEED" || code === "10CLEANME") {
      setAppliedCoupon(code);
      ui.toast(`Code applied: ${code}`, "success");
    } else {
      ui.toast("That code isn't valid", "error");
      setAppliedCoupon("");
    }
  };

  const PAYPAL_EMAIL = "divercityrecords@gmail.com";
  const [checkoutMethod, setCheckoutMethod] = useState<"PAYPAL" | "EMAIL">("PAYPAL");

  const completeCheckout = (method: "PAYPAL" | "EMAIL" = "EMAIL") => {
    if (cart.length === 0) return;

    if (!customerName || !address || !city || !state || !zipCode) {
      ui.toast("Please fill in all shipping details.", "error");
      return;
    }

    setCheckoutMethod(method);
    setInvoiceSent(true);

    // Calculate Totals for Email
    const { baseTotal: subtotal, totalDiscountAmount: discount } =
      getDiscounts();
    const tax = Math.max(0, subtotal - discount) * 0.1;
    const requiresShippingFee =
      subtotal - discount < 100 && subtotal - discount > 0;
    const shippingAmount = requiresShippingFee ? 10 : 0;
    const total = Math.max(0, subtotal - discount) + tax + shippingAmount;

    // Construct Mailto Link
    const orderId = `ORD-${Date.now()}`;
    const itemsList = cart
      .map(
        (i) =>
          `- ${i.name} (x${i.quantity}): $${(i.price * i.quantity).toFixed(2)}`,
      )
      .join("\r\n");
    const rawBody = `
ORDER REQUEST: ${orderId}
--------------------------------
CUSTOMER INFO:
Name: ${customerName}
Address: ${address}
City: ${city}
State: ${state}
Zip: ${zipCode}
Country: ${shippingCountry}
--------------------------------
ITEMS:
${itemsList}
--------------------------------
Subtotal: $${subtotal.toFixed(2)}
Tax (10%): $${tax.toFixed(2)}
Discount: -$${discount.toFixed(2)}
Shipping: ${requiresShippingFee ? `$${shippingAmount.toFixed(2)}` : "FREE"}
TOTAL: $${total.toFixed(2)}
--------------------------------
Please send invoice and payment instructions.
    `.trim();

    const openLink = (href: string, target: string) => {
      const link = document.createElement("a");
      link.href = href;
      link.target = target;
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    if (method === "PAYPAL") {
      // PayPal "Add to cart / Buy now" upload: every paid item becomes a line, totals match the stash exactly.
      const [first, ...rest] = customerName.trim().split(/\s+/);
      const country = ({ USA: "US", Canada: "CA", UK: "GB" } as Record<string, string>)[shippingCountry] || "US";
      const q = new URLSearchParams({
        cmd: "_cart",
        upload: "1",
        business: PAYPAL_EMAIL,
        currency_code: "USD",
        invoice: orderId,
        no_note: "1",
        charset: "utf-8",
        first_name: first || "",
        last_name: rest.join(" "),
        address1: address,
        city,
        state,
        zip: zipCode,
        country,
        address_override: "1",
        tax_cart: tax.toFixed(2),
        handling_cart: shippingAmount.toFixed(2),
      });
      if (discount > 0) q.set("discount_amount_cart", discount.toFixed(2));
      const paid = cart.filter((i) => !i.isPromo);
      paid.forEach((i, n) => {
        q.set(`item_name_${n + 1}`, i.name);
        q.set(`amount_${n + 1}`, i.price.toFixed(2));
        q.set(`quantity_${n + 1}`, String(i.quantity));
      });
      const freeNames = cart.filter((i) => i.isPromo).map((i) => i.name);
      if (freeNames.length) q.set("custom", `Free seeds included: ${freeNames.join(", ")}`);
      openLink(`https://www.paypal.com/cgi-bin/webscr?${q.toString()}`, "_blank");
    } else {
      const subject = encodeURIComponent(`Order Request ${orderId}`);
      const body = encodeURIComponent(rawBody);
      openLink(`mailto:${PAYPAL_EMAIL}?subject=${subject}&body=${body}`, "_self");
    }

    // Add to history
    const newOrder: PastOrder = {
      id: orderId,
      date: Date.now(),
      total: total,
      items: cart.map((i) => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        type: i.type,
      })),
    };
    const updatedHistory = [newOrder, ...orderHistory];
    setOrderHistory(updatedHistory);
    localStorage.setItem(
      "clean_genetics_orders",
      JSON.stringify(updatedHistory),
    );

    // Clear cart
    setStashes((prev) =>
      prev.map((stash) => {
        if (stash.id === activeStashId) {
          return { ...stash, items: [] };
        }
        return stash;
      }),
    );

    setTimeout(() => {
      setInvoiceSent(false);
      setCurrentView("ORDERS");
    }, 3000);
  };

  const openProduct = (p: Product) => {
    if (currentView !== "PRODUCT") {
      setPrevView(currentView);
      restoreScroll.current = window.scrollY;
    }
    setProductId(p.id);
    setCurrentView("PRODUCT");
  };
  const closeProduct = () => setCurrentView(prevView);
  const BACK_LABEL: Partial<Record<ViewState, string>> = {
    HOME: "Back to home",
    SHOP: "Back to Seed Bank",
    MEDICINES: "Back to Medicines",
    POLLEN: "Back to Pollen",
    CLONES: "Back to Mothers",
    ASSISTANT: "Back to AI Grow",
    CART: "Back to stash",
    ORDERS: "Back to orders",
    ABOUT: "Back to About",
  };
  const paidSeedCount = cart
    .filter((i) => !i.isPromo && SEED_CATALOG.some((s) => s.id === i.id))
    .reduce((sum, i) => sum + i.quantity, 0);

  // --- Filtering & Sorting ---
  const getFilteredProducts = (catalog: Product[]) => {
    let filtered = [...catalog];
    if (filterType !== "All") {
      filtered = filtered.filter((p) => p.type === filterType);
    }
    if (favOnly) {
      filtered = filtered.filter((p) => favorites.includes(p.id));
    }
    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return filtered.sort((a, b) => {
      if (sortBy === "PRICE_LOW") return a.price - b.price;
      if (sortBy === "PRICE_HIGH") return b.price - a.price;
      if (sortBy === "THC_LOW") {
        const getPotency = (p: Product) =>
          p.thc === "N/A" ? 0 : parseFloat(p.thc) || 0;
        return getPotency(a) - getPotency(b);
      }
      if (sortBy === "THC_HIGH") {
        const getPotency = (p: Product) =>
          p.thc === "N/A" ? 0 : parseFloat(p.thc) || 0;
        return getPotency(b) - getPotency(a);
      }
      return 0; // Featured default order
    });
  };


  // --- Render Views ---
  const renderHome = () => {
    const hero = [SEED_CATALOG[1], SEED_CATALOG[2], SEED_CATALOG[0]].filter(Boolean);
    const tape = [...SEED_CATALOG.map((p) => p.name)];
    const collections = [
      { title: "Seeds", icon: Sprout, view: "SHOP", desc: "Premium feminized & regular seeds, pheno-hunted in small batches.", tag: `${SEED_CATALOG.length} genetics`, from: "#0f766e", to: "#10b981", big: true },
      { title: "Clones", icon: GitFork, view: "CLONES", desc: "The mothers behind every seed.", tag: "Mother library", from: "#134e4a", to: "#14b8a6" },
      { title: "Pollen", icon: Wind, view: "POLLEN", desc: "Every male line, every cross.", tag: "Pollen library", from: "#064e3b", to: "#34d399" },
      { title: "Medicines", icon: Pill, view: "MEDICINES", desc: "Organic natural remedies, THC-free.", tag: `${MEDICINE_CATALOG.length} remedies`, from: "#115e59", to: "#2dd4bf", wide: true },
    ];
    return (
      <div className="flex flex-col">
        {/* ───────── HERO ───────── */}
        <section className="relative px-5 md:px-10 min-h-[calc(100svh-6rem)] md:min-h-[88vh] flex items-center pb-16">
          <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-[1.08fr_0.92fr] gap-14 lg:gap-8 items-center">
            <div className="relative z-10">
              <div className="chip mb-8 animate-in fade-in slide-in-from-bottom-3 duration-700 !normal-case !tracking-wide !text-[12px] text-zinc-200 !py-1.5 !px-3.5">
                <span className="relative flex w-2 h-2">
                  <span className="absolute inset-0 rounded-full bg-emerald-300 animate-ping opacity-75" />
                  <span className="relative w-2 h-2 rounded-full bg-emerald-300" />
                </span>
                Est. 2026 · Las Vegas · Small-batch genetics
              </div>
              <h1 className="font-extrabold tracking-tighter leading-[0.88] text-[3.9rem] sm:text-7xl md:text-[6.5rem] lg:text-[7.4rem] animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <span className="block text-gradient-silver">Clean</span>
                <span className="block text-gradient pb-2">Genetics</span>
              </h1>
              <p className="mt-7 text-xl md:text-[1.7rem] leading-snug text-zinc-300 max-w-xl font-light animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">
                Small batch. Organic. Pheno-hunted.
                <br />
                <span className="font-display italic text-[1.15em] text-white">Strictly for the connoisseur.</span>
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-3.5 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
                <button onClick={() => document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" })} className="btn-primary h-14 px-8 text-[15px]">
                  Browse all seeds <ArrowRight className="w-5 h-5" />
                </button>
                <button onClick={() => setCurrentView("ASSISTANT")} className="btn-glass h-14 px-8 text-[15px]">
                  <Sparkles className="w-5 h-5 text-amber-300" /> AI Grow Guide
                </button>
              </div>
              <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm text-zinc-400 animate-in fade-in duration-1000 delay-500">
                {[
                  { i: ShieldCheck, t: "Germination guarantee" },
                  { i: Dna, t: "Verified genotypes" },
                  { i: Truck, t: "Stealth shipping" },
                ].map((x) => (
                  <span key={x.t} className="inline-flex items-center gap-2">
                    <x.i className="w-4 h-4 text-emerald-300" /> {x.t}
                  </span>
                ))}
              </div>
            </div>

            {/* floating product fan */}
            <div id="hero-fan" className="relative h-[430px] sm:h-[520px] lg:h-[600px] animate-in fade-in zoom-in-95 duration-1000 delay-200">
              <div className="absolute inset-0 -z-10 rounded-full blur-3xl opacity-60" style={{ background: "radial-gradient(circle at 50% 50%, rgba(20,184,166,0.28), rgba(16,185,129,0.22) 45%, transparent 70%)" }} />
              {hero.map((p, i) => {
                const pos = [
                  "left-[-3%] top-[12%] -rotate-[10deg] w-[39%] z-10",
                  "right-[-3%] top-[6%] rotate-[9deg] w-[39%] z-10",
                  "left-[29%] top-[16%] w-[43%] z-20",
                ][i];
                return (
                  <div key={p.id} className={`absolute ${pos}`}>
                    <div style={{ transform: `translate3d(calc(var(--px,0) * ${(i + 1) * -9}px), calc(var(--py,0) * ${(i + 1) * -7}px), 0)`, transition: "transform .25s ease-out" }}>
                      <button
                        onClick={() => openProduct(p)}
                        className="group block w-full"
                        style={{ animation: `floaty ${7 + i * 1.3}s ease-in-out ${-i * 2}s infinite` }}
                        aria-label={`View ${p.name}`}
                      >
                        <SeedPack product={p} className="w-full transition-transform duration-500 group-hover:scale-[1.05]" />
                      </button>
                    </div>
                  </div>
                );
              })}
              <div className="absolute -left-1 bottom-[6%] z-30 glass-bar rounded-2xl px-4 py-3 flex items-center gap-3 animate-floaty" style={{ animationDelay: "-3s" }}>
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-200 to-teal-400 flex items-center justify-center text-black"><Gift className="w-5 h-5" /></span>
                <span className="leading-tight">
                  <span className="block text-sm font-extrabold text-white">Buy 4, get 1 free</span>
                  <span className="block text-[11px] text-zinc-400">Auto-applied in your stash</span>
                </span>
              </div>
              <div className="absolute right-0 bottom-[14%] z-30 glass-bar rounded-2xl px-4 py-3 hidden sm:flex items-center gap-3 animate-floaty" style={{ animationDelay: "-5s" }}>
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-300 to-emerald-500 flex items-center justify-center text-black"><Microscope className="w-5 h-5" /></span>
                <span className="leading-tight">
                  <span className="block text-sm font-extrabold text-white">98% cull rate</span>
                  <span className="block text-[11px] text-zinc-400">Only the titans survive</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── MARQUEE ───────── */}
        <div className="marquee relative py-5 border-y border-white/[0.07] bg-white/[0.02] overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
          <div className="marquee-track">
            {[0, 1].map((k) => (
              <div key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
                {tape.map((n, i) => (
                  <span key={`${k}-${i}`} className="flex items-center text-sm md:text-base font-bold uppercase tracking-[0.28em] text-zinc-400">
                    <span className="px-8 whitespace-nowrap">{n}</span>
                    <Leaf className="w-4 h-4" style={{ color: ["#34d399", "#2dd4bf", "#6ff3c1", "#14b8a6"][i % 4] }} />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ───────── STATS ───────── */}
        <section className="px-5 md:px-10 pt-20 md:pt-28">
          <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { n: 10, s: "k+", l: "Seeds popped", c: "from-emerald-300 to-teal-400" },
              { n: 98, s: "%", l: "Cull rate", c: "from-teal-200 to-emerald-400" },
              { n: SEED_CATALOG.length, s: "", l: "Elite genetics", c: "from-amber-200 to-rose-300" },
              { n: 12, s: " yrs", l: "Of grow journals", c: "from-emerald-200 to-teal-300" },
            ].map((x, i) => (
              <Reveal key={x.l} delay={i * 90}>
                <div className="spot glass rounded-3xl p-6 md:p-8 h-full">
                  <div className={`text-5xl md:text-6xl font-extrabold tracking-tighter bg-gradient-to-br ${x.c} bg-clip-text text-transparent`}>
                    <CountUp to={x.n} suffix={x.s} />
                  </div>
                  <div className="text-xs md:text-sm text-zinc-400 uppercase tracking-[0.18em] font-semibold mt-3">{x.l}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ───────── COLLECTIONS ───────── */}
        <section className="px-5 md:px-10 pt-28 md:pt-40">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <SectionHead eyebrow="Collections" title={<>Explore the <span className="font-display italic font-normal text-gradient">library</span></>} sub="Four departments, one obsession: genetics you can trace and trust." />
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 md:h-[520px]">
              {collections.map((c, i) => (
                <Reveal key={c.title} delay={i * 100} className={c.big ? "md:col-span-2 md:row-span-2" : (c as any).wide ? "md:col-span-2" : ""}>
                  <button
                    onClick={() => setCurrentView(c.view as ViewState)}
                    className="spot group relative w-full h-full min-h-[200px] rounded-[2rem] overflow-hidden text-left border border-white/10 p-7 md:p-8 flex flex-col justify-end transition-transform duration-500 hover:-translate-y-1"
                    style={{ background: `radial-gradient(120% 90% at 85% 0%, ${c.to}cc, transparent 60%), linear-gradient(160deg, ${c.from}, #030807 92%)` }}
                  >
                    <c.icon className={`absolute -right-6 -top-6 text-white/[0.12] group-hover:text-white/20 group-hover:rotate-6 group-hover:scale-110 transition-all duration-700 ${c.big ? "w-72 h-72" : "w-44 h-44"}`} strokeWidth={1} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="relative z-10">
                      <span className="chip mb-4 text-white !bg-black/25">{c.tag}</span>
                      <h3 className={`font-extrabold tracking-tighter text-white ${c.big ? "text-5xl md:text-6xl" : "text-3xl"}`}>{c.title}</h3>
                      <p className={`text-white/75 mt-2 ${c.big ? "text-base max-w-sm" : "text-sm"}`}>{c.desc}</p>
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white">
                        Explore <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                      </span>
                    </div>
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── FULL COLLECTION ───────── */}
        {(() => {
          const list = SEED_CATALOG.filter(
            (p) =>
              (homeType === "All" || p.type === homeType) &&
              (!homeFav || favorites.includes(p.id)) &&
              (p.name + p.type + (p.malePollen || "") + (p.femalePlant || "")).toLowerCase().includes(homeQ.toLowerCase()),
          );
          const chips: { v: StrainType | "All"; c: string }[] = [
            { v: "All", c: "#e5e7eb" },
            { v: StrainType.INDICA, c: themeFor(StrainType.INDICA).accent },
            { v: StrainType.SATIVA, c: themeFor(StrainType.SATIVA).accent },
            { v: StrainType.HYBRID, c: themeFor(StrainType.HYBRID).accent },
          ];
          return (
            <section id="collection" className="px-5 md:px-10 pt-28 md:pt-40">
              <div className="max-w-7xl mx-auto">
                <Reveal>
                  <SectionHead
                    eyebrow={`The full collection · ${SEED_CATALOG.length} genetics`}
                    title={<>Every seed, <span className="font-display italic font-normal text-gradient">one wall</span></>}
                    sub="Search by name or lineage, filter by type, and tap the heart to save the ones you want."
                  />
                </Reveal>

                <div className="glass rounded-[1.75rem] p-3 mb-8 flex flex-col lg:flex-row gap-3 lg:items-center lg:sticky lg:top-24 z-30 lg:!bg-[rgba(3,9,8,0.7)]">
                  <div className="relative flex-1 min-w-0">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      value={homeQ}
                      onChange={(e) => setHomeQ(e.target.value)}
                      placeholder="Search name, pollen or mother…"
                      className="w-full bg-white/[0.06] border border-white/10 rounded-full pl-11 pr-10 h-12 text-sm text-white"
                    />
                    {homeQ && (
                      <button onClick={() => setHomeQ("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                    <button
                      onClick={() => setHomeFav((v) => !v)}
                      aria-pressed={homeFav}
                      className={`h-12 px-5 rounded-full text-sm font-semibold whitespace-nowrap border transition-all duration-300 flex items-center gap-2 ${homeFav ? "text-teal-100 border-teal-300/50 bg-teal-300/15 shadow-[0_0_24px_-6px_rgba(45,212,191,0.8)]" : "text-zinc-400 border-white/10 bg-white/[0.04] hover:text-white hover:bg-white/10"}`}
                    >
                      <Heart className={`w-4 h-4 ${homeFav ? "fill-current" : ""}`} /> Favorites
                      <span className="text-[11px] font-mono px-1.5 rounded-full bg-white/10">{favorites.length}</span>
                    </button>
                    {chips.map((t) => {
                      const on = homeType === t.v;
                      return (
                        <button
                          key={t.v}
                          onClick={() => setHomeType(t.v)}
                          aria-pressed={on}
                          className={`h-12 px-5 rounded-full text-sm font-semibold whitespace-nowrap border transition-all duration-300 flex items-center gap-2 ${on ? "text-white border-white/30 bg-white/15" : "text-zinc-400 border-white/10 bg-white/[0.04] hover:text-white hover:bg-white/10"}`}
                        >
                          <span className="w-2 h-2 rounded-full" style={{ background: t.c, boxShadow: on ? `0 0 10px ${t.c}` : "none" }} />
                          {t.v === "All" ? "All" : t.v}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-3 justify-between lg:justify-start">
                    <span className="text-sm text-zinc-400 font-mono whitespace-nowrap">{list.length} / {SEED_CATALOG.length}</span>
                    <div className="bg-white/[0.06] border border-white/10 rounded-full p-1 flex shrink-0">
                      {([["GRID", Grid], ["LIST", List]] as const).map(([m, Ic]) => (
                        <button key={m} onClick={() => setHomeMode(m)} aria-label={`${m.toLowerCase()} view`} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${homeMode === m ? "bg-white/20 text-white" : "text-zinc-500 hover:text-white"}`}>
                          <Ic className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {list.length === 0 ? (
                  <EmptyState
                    icon={homeFav ? Heart : Search}
                    title={homeFav && !favorites.length ? "No favorites yet" : "No genetics match"}
                    text={homeFav && !favorites.length ? "Tap the heart on any seed to save it here." : "Try a different search or clear the filters."}
                    cta="Reset filters"
                    onCta={() => { setHomeQ(""); setHomeType("All"); setHomeFav(false); }}
                  />
                ) : (
                  <div className={homeMode === "GRID" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 [perspective:1200px]" : "flex flex-col gap-4"}>
                    {list.slice(0, homeLimit).map((product, i) => (
                      <div key={product.id} className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both" style={{ animationDelay: `${Math.min(i, 9) * 50}ms`, animationDuration: "500ms" }}>
                        <ProductCard product={product} onAddToCart={addToCart} viewMode={homeMode} favorite={favorites.includes(product.id)} onToggleFavorite={toggleFavorite} onOpen={openProduct} />
                      </div>
                    ))}
                  </div>
                )}
                {list.length > homeLimit && (
                  <div className="flex justify-center mt-10">
                    <button onClick={() => setHomeLimit((n) => n + 6)} className="btn-glass h-14 px-8 text-[15px]">
                      Show more seeds <span className="font-mono text-zinc-400">{Math.min(homeLimit, list.length)}/{list.length}</span> <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </section>
          );
        })()}

        {/* ───────── THE CLEAN STANDARD ───────── */}
        <section className="px-5 md:px-10 pt-28 md:pt-40">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Reveal>
              <div className="eyebrow mb-4">The clean standard</div>
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-[1.02] text-gradient-silver mb-8">
                Preserve the gas.
                <br />
                <span className="font-display italic font-normal text-gradient">Amplify the frost.</span>
              </h2>
              <div className="space-y-5 text-zinc-300/90 text-lg leading-relaxed">
                <p>
                  At <span className="text-white font-bold">Clean Genetics</span>, we don't just breed cannabis; we engineer legacy. Founded in 2026 by a collective of old-school growers and modern botanists.
                </p>
                <p>
                  Every seed and clone in our catalog is the result of rigorous pheno-hunting and stress-testing. We grow strictly organic, using living soil systems that express the truest terpene profiles nature intended.
                </p>
              </div>
              <div className="grid gap-3 mt-9">
                {[
                  { i: ShieldCheck, t: "100% Germination Guarantee", c: "#34d399" },
                  { i: Dna, t: "Verified Genotypes", c: "#5eead4" },
                  { i: Truck, t: "Stealth Worldwide Shipping", c: "#22d3ee" },
                ].map((x) => (
                  <div key={x.t} className="glass rounded-2xl px-5 py-4 flex items-center gap-4">
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${x.c}1f`, color: x.c, boxShadow: `0 0 24px -6px ${x.c}` }}>
                      <x.i className="w-5 h-5" />
                    </span>
                    <span className="font-semibold text-white">{x.t}</span>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div className="relative">
                <div className="absolute -inset-6 -z-10 rounded-[3rem] blur-3xl opacity-60" style={{ background: "conic-gradient(from 90deg, rgba(18,210,143,.35), rgba(16,185,129,.35), rgba(20,184,166,.3), rgba(18,210,143,.35))" }} />
                <div className="edge-glow relative h-[480px] md:h-[600px] rounded-[2.5rem] overflow-hidden">
                  <StrainArt id="clean-standard" type={StrainType.HYBRID} glyph={0.85} className="absolute inset-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute left-7 bottom-7 right-7 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-white/70 font-mono text-xs tracking-[0.3em]">EST. 2026</p>
                      <p className="text-white font-extrabold text-2xl tracking-tight">LAS VEGAS, USA</p>
                    </div>
                    <div className="glass-bar rounded-2xl px-4 py-3 text-center">
                      <MarijuanaLeaf className="w-6 h-6 mx-auto text-emerald-300 mb-1" />
                      <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-300">ORGANIC</span>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ───────── CTA ───────── */}
        <section className="px-5 md:px-10 py-28 md:py-40">
          <Reveal>
            <div className="edge-glow max-w-5xl mx-auto relative rounded-[2.5rem] overflow-hidden text-center px-6 py-16 md:py-24" style={{ background: "radial-gradient(90% 120% at 50% 0%, rgba(20,184,166,0.22), transparent 60%), radial-gradient(70% 100% at 100% 100%, rgba(16,185,129,0.28), transparent 60%), radial-gradient(70% 100% at 0% 100%, rgba(18,210,143,0.26), transparent 60%), rgba(3,9,8,0.6)" }}>
              <div className="eyebrow mb-5">Your first grow starts here</div>
              <h2 className="text-4xl md:text-7xl font-extrabold tracking-tighter text-gradient-silver leading-[1.02] text-balance">
                Four seeds in.
                <br />
                <span className="font-display italic font-normal text-gradient">One on the house.</span>
              </h2>
              <p className="text-zinc-300 text-lg mt-6 max-w-xl mx-auto">Free shipping over $100, plus code <span className="font-mono font-bold text-white">10CLEANME</span> for 10% off.</p>
              <div className="mt-10 flex flex-col sm:flex-row gap-3.5 justify-center">
                <button onClick={() => setCurrentView("SHOP")} className="btn-primary h-14 px-9 text-[15px]">Start shopping <ArrowRight className="w-5 h-5" /></button>
                <button onClick={() => setCurrentView("ABOUT")} className="btn-glass h-14 px-9 text-[15px]">Our story</button>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ───────── FOOTER ───────── */}
        <footer className="px-5 md:px-10 pb-12">
          <div className="max-w-7xl mx-auto border-t border-white/[0.08] pt-8 flex flex-col md:flex-row items-center justify-between gap-5 text-sm text-zinc-500">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-300 to-teal-500 flex items-center justify-center"><MarijuanaLeaf className="w-4 h-4 text-[#04140e]" /></span>
              <span>© 2026 Clean Genetics · Las Vegas, NV</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {([["Seeds", "SHOP"], ["Medicines", "MEDICINES"], ["AI Grow", "ASSISTANT"], ["About", "ABOUT"]] as [string, ViewState][]).map(([l, v]) => (
                <button key={l} onClick={() => setCurrentView(v)} className="hover:text-white transition-colors">{l}</button>
              ))}
            </div>
          </div>
        </footer>
      </div>
    );
  };

  const renderShop = (catalog: Product[], title: string, icon: any, subtitle: string, topSlot?: React.ReactNode, opts: { noun?: string; hideTypes?: boolean } = {}) => {
    const results = getFilteredProducts(catalog);
    const typeChips: { v: StrainType | "All"; c: string }[] = [
      { v: "All", c: "#e5e7eb" },
      { v: StrainType.INDICA, c: themeFor(StrainType.INDICA).accent },
      { v: StrainType.SATIVA, c: themeFor(StrainType.SATIVA).accent },
      { v: StrainType.HYBRID, c: themeFor(StrainType.HYBRID).accent },
    ];
    return (
      <div className="max-w-7xl mx-auto pb-24 px-4 md:px-10">
        <PageTitle
          icon={icon}
          title={title}
          sub={catalog.length ? `${results.length} ${results.length === 1 ? (opts.noun ?? "genetic") : (opts.noun === "remedy" ? "remedies" : "genetics")} available · ${subtitle}` : subtitle}
          right={
            catalog.length > 0 ? (
              <button onClick={() => setIsAiSidebarOpen(true)} className="btn-primary h-12 px-6 text-sm self-start md:self-auto">
                <Bot className="w-4 h-4" /> AI Budtender
              </button>
            ) : undefined
          }
        />

        {topSlot}

        {catalog.length > 0 && (
          <div className="glass rounded-[1.75rem] p-3 md:p-3.5 mb-8 flex flex-col lg:flex-row gap-3 lg:items-center lg:sticky lg:top-24 z-30 lg:!bg-[rgba(4,11,10,0.6)]">
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder={opts.noun ? `Search ${opts.noun === "remedy" ? "remedies" : opts.noun + "s"}…` : "Search strains…"}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/[0.06] border border-white/10 rounded-full pl-11 pr-10 h-12 text-sm text-white"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className={`flex gap-1.5 overflow-x-auto no-scrollbar ${opts.hideTypes ? "hidden" : ""}`} role="tablist" aria-label="Strain type">
              <button
                onClick={() => setFavOnly((v) => !v)}
                aria-pressed={favOnly}
                className={`h-12 px-5 rounded-full text-sm font-semibold whitespace-nowrap border transition-all duration-300 flex items-center gap-2 ${favOnly ? "text-teal-100 border-teal-300/50 bg-teal-300/15 shadow-[0_0_24px_-6px_rgba(45,212,191,0.8)]" : "text-zinc-400 border-white/10 bg-white/[0.04] hover:text-white hover:bg-white/10"}`}
              >
                <Heart className={`w-4 h-4 ${favOnly ? "fill-current" : ""}`} /> Favorites
                <span className="text-[11px] font-mono px-1.5 rounded-full bg-white/10">{favorites.length}</span>
              </button>
              {typeChips.map((t) => {
                const on = filterType === t.v;
                return (
                  <button
                    key={t.v}
                    role="tab"
                    aria-selected={on}
                    onClick={() => setFilterType(t.v)}
                    className={`h-12 px-5 rounded-full text-sm font-semibold whitespace-nowrap border transition-all duration-300 flex items-center gap-2 ${
                      on ? "text-white border-white/30 bg-white/15 shadow-[0_0_24px_-6px_var(--c)]" : "text-zinc-400 border-white/10 bg-white/[0.04] hover:text-white hover:bg-white/10"
                    }`}
                    style={{ ["--c" as any]: t.c }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: t.c, boxShadow: on ? `0 0 10px ${t.c}` : "none" }} />
                    {t.v === "All" ? "All types" : t.v}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 lg:flex-none">
                <SlidersHorizontal className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  aria-label="Sort"
                  className="appearance-none w-full lg:w-auto bg-white/[0.06] border border-white/10 rounded-full pl-10 pr-9 h-12 text-sm text-white"
                >
                  <option value="FEATURED">Featured</option>
                  <option value="PRICE_LOW">Price: low → high</option>
                  <option value="PRICE_HIGH">Price: high → low</option>
                  <option value="THC_HIGH">THC: high → low</option>
                  <option value="THC_LOW">THC: low → high</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
              <div className="bg-white/[0.06] border border-white/10 rounded-full p-1 flex shrink-0">
                {([["GRID", Grid], ["LIST", List]] as const).map(([m, Ic]) => (
                  <button
                    key={m}
                    onClick={() => setViewMode(m)}
                    aria-label={`${m.toLowerCase()} view`}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${viewMode === m ? "bg-white/20 text-white shadow-inner" : "text-zinc-500 hover:text-white"}`}
                  >
                    <Ic className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {catalog.length === 0 ? (
          <div className="glass rounded-[2.5rem] text-center py-28 px-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-70" style={{ background: "radial-gradient(60% 80% at 50% 0%, rgba(16,185,129,0.25), transparent 70%)" }} />
            <div className="relative">
              <div className="w-28 h-28 glass rounded-full flex items-center justify-center mx-auto mb-7 animate-floaty shadow-glow">
                {React.createElement(icon, { className: "w-12 h-12 text-teal-200" })}
              </div>
              <span className="chip mb-5 text-teal-200">In the lab</span>
              <h3 className="text-4xl font-extrabold text-white tracking-tight mb-3">Coming soon</h3>
              <p className="text-zinc-400 max-w-md mx-auto">Our genetics team is currently pheno-hunting this collection. Check back soon.</p>
              <button onClick={() => setCurrentView("HOME")} className="btn-glass h-12 px-7 mt-9 text-sm">Return home</button>
            </div>
          </div>
        ) : results.length === 0 ? (
          <EmptyState icon={favOnly ? Heart : Search} title={favOnly && !favorites.length ? "No favorites yet" : "No genetics match"} text={favOnly && !favorites.length ? "Tap the heart on any seed to save it here." : "Try a different search or clear the filters."} cta="Reset filters" onCta={() => { setSearchTerm(""); setFilterType("All"); setFavOnly(false); }} />
        ) : (
          <div className={viewMode === "GRID" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 [perspective:1200px]" : "flex flex-col gap-4"}>
            {results.slice(0, shopLimit).map((product, i) => (
              <div key={product.id} className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both" style={{ animationDelay: `${Math.min(i, 9) * 60}ms`, animationDuration: "600ms" }}>
                <ProductCard product={product} onAddToCart={addToCart} viewMode={viewMode} favorite={favorites.includes(product.id)} onToggleFavorite={toggleFavorite} onOpen={openProduct} />
              </div>
            ))}
            {results.length > shopLimit && (
              <div className="col-span-full flex justify-center mt-6">
                <button onClick={() => setShopLimit((n) => n + 6)} className="btn-glass h-14 px-8 text-[15px]">
                  Show more <span className="font-mono text-zinc-400">{Math.min(shopLimit, results.length)}/{results.length}</span> <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderFreeSeedPicker = () => {
    if (!showFreeSeedPicker) return null;
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 overflow-y-auto">
        <div className="absolute inset-0 bg-black/75" />
        <div className="glass-strong edge-glow relative rounded-[2.5rem] w-full max-w-4xl p-7 md:p-12 text-center animate-in zoom-in-95 fade-in duration-500 my-auto">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-200 via-teal-300 to-emerald-500 flex items-center justify-center mb-6 shadow-[0_0_50px_-6px_rgba(20,184,166,0.8)] animate-floaty">
            <Gift className="w-8 h-8 text-black" />
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-gradient mb-4">You earned a free seed</h2>
          <p className="text-zinc-300 mb-10 max-w-xl mx-auto md:text-lg">For every 4 seeds you buy, you get 1 free. Pick your reward from these three random genetics.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {randomSeedOptions.map((seed) => {
              const th = themeFor(seed.type);
              return (
                <button
                  key={seed.id}
                  onClick={() => {
                    addPromoItem(seed);
                    setShowFreeSeedPicker(false);
                    ui.toast(`${seed.name} added free`, "success");
                  }}
                  className="spot glass group rounded-3xl overflow-hidden text-left flex flex-col transition-transform duration-500 hover:-translate-y-1.5"
                >
                  <StrainArt id={seed.id} type={seed.type} noGlyph still className="h-48 w-full"><div className="absolute inset-x-0 top-4 bottom-4 flex justify-center"><SeedPack product={seed} className="h-full" /></div></StrainArt>
                  <div className="p-5 flex flex-col flex-1 relative z-10">
                    <h3 className="text-lg font-extrabold text-white leading-tight line-clamp-2">{seed.name}</h3>
                    <div className="text-xs font-mono mt-1" style={{ color: th.tint }}>{seed.type} · {seed.floweringTime}</div>
                    <p className="text-xs text-zinc-400 line-clamp-3 mt-3 mb-5">{seed.description}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-sm font-black uppercase tracking-widest text-emerald-300">Select</span>
                      <span className="w-9 h-9 rounded-full bg-white/10 group-hover:bg-emerald-300 group-hover:text-black flex items-center justify-center transition-colors">
                        <Plus className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderWelcomePromo = () => {
    if (!showWelcomePromo) return null;
    const notch = "radial-gradient(circle 13px at 0 var(--cut), #0000 98%, #000), radial-gradient(circle 13px at 100% var(--cut), #0000 98%, #000)";
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/75 animate-in fade-in duration-500" onClick={() => setShowWelcomePromo(false)} />
        <div className="relative w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-8 fade-in duration-500" style={{ filter: "drop-shadow(0 40px 60px rgba(0,0,0,0.7))" }}>
          <div
            className="relative rounded-[2rem] overflow-hidden"
            style={{ ["--cut" as any]: "63%", WebkitMask: notch, WebkitMaskComposite: "source-in", mask: notch, maskComposite: "intersect", background: "linear-gradient(160deg, rgba(14,34,30,0.97), rgba(3,9,8,0.98))", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            {/* top */}
            <div className="relative px-8 pt-9 pb-8 text-center overflow-hidden" style={{ height: "63%", minHeight: 0 }}>
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(80% 90% at 50% 0%, rgba(45,212,191,0.35), transparent 70%)" }} />
              <button onClick={() => setShowWelcomePromo(false)} aria-label="Close" className="absolute top-4 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition-colors z-10">
                <X className="w-4 h-4" />
              </button>
              <div className="relative">
                <span className="chip text-teal-200 mb-5"><Ticket className="w-3.5 h-3.5" /> Welcome offer</span>
                <div className="text-[5.2rem] leading-none font-extrabold tracking-tighter text-gradient">10%</div>
                <div className="font-display italic text-3xl text-white -mt-1">off your first stash</div>
                <div className="mt-6 flex items-center justify-center gap-5 text-[11px] uppercase tracking-[0.18em] font-bold text-zinc-300">
                  <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-teal-300" /> Free ship $100+</span>
                  <span className="flex items-center gap-1.5"><Gift className="w-4 h-4 text-teal-300" /> Buy 4 get 1</span>
                </div>
              </div>
            </div>
            {/* perforation */}
            <div className="absolute left-7 right-7" style={{ top: "63%", borderTop: "2px dashed rgba(255,255,255,0.18)" }} />
            {/* stub */}
            <div className="px-8 pt-10 pb-8">
              <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-500 font-bold mb-2 text-center">Promo code</div>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText("10CLEANME");
                  ui.toast("Code copied. Paste it in your stash", "success");
                }}
                className="group w-full rounded-2xl border border-dashed border-teal-300/40 bg-teal-300/[0.07] hover:bg-teal-300/[0.14] transition-colors h-16 flex items-center justify-center gap-3"
              >
                <span className="font-mono font-bold text-2xl tracking-[0.18em] text-white">10CLEANME</span>
                <Copy className="w-4 h-4 text-teal-300 group-hover:scale-110 transition-transform" />
              </button>
              <button onClick={() => { setShowWelcomePromo(false); document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" }); }} className="btn-primary w-full h-14 text-[15px] mt-5">
                Start shopping <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPurchaseNotification = () => {
    if (!purchaseNotification) return null;
    return (
      <div className="fixed left-4 md:left-6 bottom-28 md:bottom-6 z-[54] animate-in slide-in-from-left-6 fade-in duration-500 max-w-[calc(100vw-2rem)]">
        <div className="glass-bar rounded-2xl p-3 pr-5 flex items-center gap-3.5 max-w-sm">
          <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-300 to-teal-400 flex items-center justify-center shrink-0">
            <Leaf className="w-5 h-5 text-[#04140e]" />
          </span>
          <div className="min-w-0">
            <div className="text-[13px] text-zinc-300 truncate">
              <span className="font-bold text-white">{purchaseNotification.name}</span> from {purchaseNotification.location}
            </div>
            <div className="text-xs text-zinc-500 mt-0.5 truncate">
              Just bought <span className="font-bold text-emerald-300 uppercase">{purchaseNotification.strain}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCart = () => {
    const {
      baseTotal: subtotal,
      totalDiscountAmount: discount,
      autoDiscountAmount,
      manualDiscountAmount,
    } = getDiscounts();
    const taxAmount = Math.max(0, subtotal - discount) * 0.1;
    const finalTotal = Math.max(0, subtotal - discount) + taxAmount;
    const requiresShippingFee = subtotal - discount < 100 && subtotal - discount > 0;
    const shippingAmount = requiresShippingFee ? 10 : 0;
    const finalWithShipping = finalTotal + shippingAmount;
    const progress = Math.min(100, ((subtotal - discount) / 100) * 100);

    const steps = [
      { icon: List, t: "Place order", d: "Pay with PayPal" },
      { icon: Search, t: "Confirmation", d: "We confirm your order" },
      { icon: CreditCard, t: "Receipt", d: "PayPal emails you" },
      { icon: Package, t: "We ship", d: "Your order is mailed" },
    ];
    const field = "w-full bg-white/[0.06] border border-white/10 rounded-2xl px-4 h-12 text-sm text-white";

    return (
      <div className="max-w-6xl mx-auto px-4 md:px-10 pb-24">
        <PageTitle
          icon={ShoppingCart}
          title="Your stash"
          sub={`${cart.reduce((a, b) => a + b.quantity, 0)} ${cart.reduce((a, b) => a + b.quantity, 0) === 1 ? "item" : "items"} in “${activeStash.name}”`}
          right={
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={activeStashId}
                  onChange={(e) => setActiveStashId(e.target.value)}
                  aria-label="Active stash"
                  className="appearance-none bg-white/[0.06] border border-white/10 rounded-full pl-5 pr-9 h-11 text-white text-sm"
                >
                  {stashes.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.items.length})</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
              <button onClick={createNewStash} className="btn-glass w-11 h-11" title="New stash" aria-label="New stash"><Plus className="w-4 h-4" /></button>
              <button onClick={renameStash} className="btn-glass w-11 h-11" title="Rename stash" aria-label="Rename stash"><Edit2 className="w-4 h-4" /></button>
              <button onClick={deleteStash} className="w-11 h-11 rounded-full bg-rose-500/10 border border-rose-400/20 text-rose-300 hover:bg-rose-500/20 flex items-center justify-center transition-colors" title="Delete stash" aria-label="Delete stash"><Trash2 className="w-4 h-4" /></button>
            </div>
          }
        />

        {cart.length === 0 ? (
          <EmptyState icon={ShoppingBag} title="Your stash is empty" text="Your journey to the perfect grow starts with a single seed." cta="Browse genetics" onCta={() => setCurrentView("SHOP")} />
        ) : (
          <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
            <div className="space-y-4">
              <div className="glass rounded-[2rem] p-6 md:p-7">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="eyebrow">How ordering works</h3>
                  <span className="text-xs text-zinc-500 hidden sm:block">Payment is completed securely on PayPal</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative">
                  {steps.map((s, i) => (
                    <div key={s.t} className="relative rounded-2xl bg-white/[0.04] border border-white/[0.08] p-4">
                      <span className={`absolute -top-2.5 -left-2 w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center ${i === 0 ? "bg-gradient-to-br from-emerald-300 to-teal-400 text-black shadow-[0_0_14px_rgba(20,184,166,.7)]" : "bg-zinc-800 text-zinc-300 border border-white/10"}`}>{i + 1}</span>
                      <s.icon className="w-5 h-5 text-emerald-300 mb-2.5" />
                      <div className="text-sm font-bold text-white">{s.t}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{s.d}</div>
                    </div>
                  ))}
                </div>
              </div>

              {cart.map((item) => (
                <div key={item.id} className="spot glass rounded-[1.75rem] p-4 md:p-5 flex items-center gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
                  <StrainArt id={item.id.replace("_promo", "")} type={item.type} still glyph={0.7} className="w-20 h-20 md:w-28 md:h-28 rounded-2xl shrink-0" />
                  <div className="flex-1 min-w-0 relative z-10">
                    <div className="flex justify-between items-start gap-3 mb-1">
                      <h4 className="font-extrabold text-white text-lg md:text-xl tracking-tight leading-tight">{item.name}</h4>
                      {item.isPromo ? (
                        <span className="chip !text-amber-200 !border-amber-300/40 !bg-amber-300/15 shrink-0"><Gift className="w-3 h-3" /> Free</span>
                      ) : (
                        <span className="font-mono text-white font-bold text-lg shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-500 mb-4 font-mono uppercase tracking-widest">{item.type}{!item.isPromo && ` · $${item.price} ea`}</div>
                    <div className="flex items-center justify-between">
                      {!item.isPromo ? (
                        <div className="flex items-center rounded-full bg-white/[0.06] border border-white/10 h-10">
                          <button aria-label="Decrease" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-10 h-full flex items-center justify-center text-zinc-400 hover:text-white"><Minus className="w-3.5 h-3.5" /></button>
                          <span className="text-sm font-mono text-white w-7 text-center tabular-nums">{item.quantity}</span>
                          <button aria-label="Increase" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-10 h-full flex items-center justify-center text-zinc-400 hover:text-white"><Plus className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-500">Reward · ×{item.quantity}</span>
                      )}
                      <button onClick={() => removeFromCart(item.id)} className="text-xs text-zinc-500 hover:text-rose-300 flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-rose-500/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout */}
            <aside className="lg:sticky lg:top-28">
              <div className="glass-strong edge-glow rounded-[2rem] p-6 md:p-8">
                <h3 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-3 tracking-tight">
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-300 to-teal-400 flex items-center justify-center"><CreditCard className="w-5 h-5 text-black" /></span>
                  Checkout
                </h3>

                {/* free shipping meter */}
                <div className="mb-7">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-zinc-400">{requiresShippingFee ? <>Add <b className="text-white">${(100 - (subtotal - discount)).toFixed(2)}</b> for free shipping</> : <span className="text-emerald-300 font-bold">You unlocked free shipping 🎉</span>}</span>
                    <span className="font-mono text-zinc-500">{Math.floor(progress)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-teal-500 transition-all duration-700 ease-out shadow-[0_0_14px_rgba(20,184,166,.7)]" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="space-y-3 mb-7">
                  <h4 className="eyebrow !text-zinc-500 !text-[10px]">Shipping details</h4>
                  <input type="text" placeholder="Full name" autoComplete="name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={field} />
                  <input type="text" placeholder="Street address" autoComplete="street-address" value={address} onChange={(e) => setAddress(e.target.value)} className={field} />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="City" autoComplete="address-level2" value={city} onChange={(e) => setCity(e.target.value)} className={field} />
                    <input type="text" placeholder="State" autoComplete="address-level1" value={state} onChange={(e) => setState(e.target.value)} className={field} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Zip code" autoComplete="postal-code" value={zipCode} onChange={(e) => setZipCode(e.target.value)} className={field} />
                    <select value={shippingCountry} onChange={(e) => setShippingCountry(e.target.value)} className={field}>
                      <option value="USA">USA</option>
                      <option value="Canada">Canada</option>
                      <option value="UK">UK</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 mb-7">
                  <input type="text" placeholder="Promo code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && applyCoupon()} className={`${field} flex-1 font-mono uppercase tracking-wider`} />
                  <button onClick={applyCoupon} className="btn-glass h-12 px-5 text-sm">Apply</button>
                </div>

                <div className="space-y-3 border-t border-white/10 pt-6 mb-7 text-sm">
                  <div className="flex justify-between text-zinc-400"><span>Subtotal</span><span className="font-mono text-zinc-200">${subtotal.toFixed(2)}</span></div>
                  {autoDiscountAmount > 0 && <div className="flex justify-between text-emerald-300"><span>Auto discount (free seeds)</span><span className="font-mono">-${autoDiscountAmount.toFixed(2)}</span></div>}
                  {manualDiscountAmount > 0 && <div className="flex justify-between text-emerald-300"><span>Promo ({appliedCoupon})</span><span className="font-mono">-${manualDiscountAmount.toFixed(2)}</span></div>}
                  <div className="flex justify-between text-zinc-400">
                    <span>Shipping</span>
                    <span className={`font-mono ${requiresShippingFee ? "text-zinc-200" : "text-emerald-300 font-bold"}`}>{requiresShippingFee ? `$${shippingAmount.toFixed(2)}` : "FREE"}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400"><span>Tax (10%)</span><span className="font-mono text-zinc-200">${taxAmount.toFixed(2)}</span></div>
                  <div className="border-t border-white/10 pt-4 flex justify-between items-end">
                    <span className="text-white font-bold text-lg">Total</span>
                    <span className="text-4xl font-extrabold tracking-tighter text-gradient-silver font-mono">${finalWithShipping.toFixed(2)}</span>
                  </div>
                </div>

                <button onClick={() => completeCheckout("PAYPAL")} className="btn-primary w-full h-14 text-[15px] mb-3">
                  Pay with PayPal <ArrowRight className="w-5 h-5" />
                </button>
                <button onClick={() => completeCheckout("EMAIL")} className="btn-glass w-full h-12 text-sm mb-5">
                  <Mail className="w-4 h-4" /> Or request an invoice by email
                </button>
                <div className="flex items-center gap-2.5 justify-center text-zinc-500">
                  <Lock className="w-3.5 h-3.5" />
                  <p className="text-[10px] uppercase tracking-[0.22em]">Secure encrypted transaction</p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    );
  };

  const renderOrders = () => (
    <div className="max-w-5xl mx-auto px-4 md:px-10 pb-24">
      <PageTitle icon={Package} title="Order history" sub={orderHistory.length ? `${orderHistory.length} past ${orderHistory.length === 1 ? "order" : "orders"}` : "Everything you've ordered, in one place"} />

      {orderHistory.length === 0 ? (
        <EmptyState icon={Archive} title="No orders yet" text="Your order history will appear here once you've made a purchase." cta="Start shopping" onCta={() => setCurrentView("SHOP")} />
      ) : (
        <div className="space-y-5">
          {orderHistory.map((order) => (
            <div key={order.id} className="spot glass rounded-[2rem] p-6 md:p-8">
              <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                    <span className="font-mono font-bold text-white">{order.id}</span>
                    <span className="chip !text-emerald-200 !border-emerald-300/30 !bg-emerald-300/10"><Check className="w-3 h-3" strokeWidth={3} /> Completed</span>
                  </div>
                  <div className="text-zinc-500 text-sm">{new Date(order.date).toLocaleDateString(undefined, { dateStyle: "long" })} · {new Date(order.date).toLocaleTimeString(undefined, { timeStyle: "short" })}</div>
                </div>
                <div className="md:text-right">
                  <div className="text-[11px] text-zinc-500 uppercase tracking-[0.2em] mb-1">Total</div>
                  <div className="text-3xl font-extrabold tracking-tighter text-gradient-silver font-mono">${order.total.toFixed(2)}</div>
                </div>
              </div>
              <div className="relative z-10 border-t border-white/10 pt-5 grid gap-2.5">
                {order.items.map((item, idx) => (
                  <div key={`${order.id}-${idx}`} className="flex items-center justify-between rounded-2xl bg-black/25 border border-white/[0.06] p-3 pr-5">
                    <div className="flex items-center gap-4 min-w-0">
                      <StrainArt id={item.id.replace("_promo", "")} type={item.type} still glyph={0.7} className="w-12 h-12 rounded-xl shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate">{item.name}</div>
                        <div className="text-[11px] text-zinc-500 font-mono uppercase tracking-wider">{item.type}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-3">
                      <div className="text-sm text-white font-bold">×{item.quantity}</div>
                      <div className="text-xs text-zinc-500 font-mono">${item.price.toFixed(2)} ea</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="relative z-10 mt-5 flex justify-end">
                <button onClick={() => window.print()} className="text-xs text-zinc-500 hover:text-white flex items-center gap-2 transition-colors">
                  <Printer className="w-4 h-4" /> Print invoice
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen font-sans text-zinc-100 selection:bg-teal-400/30">
      <Aurora />
      <div id="scroll-progress" className="scroll-progress" aria-hidden />

      <Navbar
        currentView={currentView === "PRODUCT" ? (MEDICINE_CATALOG.some((m) => m.id === productId) ? "MEDICINES" : "SHOP") : currentView}
        setView={setCurrentView}
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
        onOpenSearch={() => setIsPaletteOpen(true)}
        favCount={favorites.length}
        onOpenFavorites={() => {
          setFavOnly(true);
          setFilterType("All");
          setSearchTerm("");
          setCurrentView("SHOP");
        }}
      />

      {/* Main Content Area */}
      <main key={`${currentView}-${productId ?? ""}`} className="view-enter relative w-full min-h-screen pt-24 md:pt-28 pb-32 md:pb-0">
        {currentView === "HOME" && renderHome()}
        {currentView === "SHOP" && renderShop(SEED_CATALOG, "Seed Bank", Sprout, "feminized & regular")}
        {(currentView === "CLONES" || currentView === "POLLEN") && (
          <GeneticsLibrary
            key={currentView}
            mode={currentView}
            catalog={SEED_CATALOG}
            onNavigate={setCurrentView}
            onOpenStrain={(name) => {
              setFilterType("All");
              setSearchTerm(name);
              setCurrentView("SHOP");
            }}
          />
        )}
        {currentView === "MEDICINES" &&
          renderShop(
            medCategory === "OILS" ? [] : MEDICINE_CATALOG,
            "Natural Medicines",
            Pill,
            "organic remedies",
            <div className="flex gap-2 mb-6" role="tablist" aria-label="Medicine type">
              {([["HONEY", "Infused honeys", MEDICINE_CATALOG.length], ["OILS", "Oils & tinctures", 0]] as const).map(([k, label, n]) => (
                <button
                  key={k}
                  role="tab"
                  aria-selected={medCategory === k}
                  onClick={() => setMedCategory(k)}
                  className={`h-12 px-6 rounded-full text-sm font-semibold border transition-all flex items-center gap-2 ${medCategory === k ? "bg-white/15 border-white/30 text-white" : "bg-white/[0.04] border-white/10 text-zinc-400 hover:text-white"}`}
                >
                  {label}
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/10">{n || "soon"}</span>
                </button>
              ))}
            </div>,
            { noun: "remedy", hideTypes: true },
          )}
        {currentView === "PRODUCT" && productId && (() => {
          const prod = [...SEED_CATALOG, ...MEDICINE_CATALOG].find((p) => p.id === productId);
          return prod ? (
            <ProductPage
              product={prod}
              all={[...SEED_CATALOG, ...MEDICINE_CATALOG]}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onAddToCart={addToCart}
              onBack={closeProduct}
              backLabel={BACK_LABEL[prevView] ?? "Back"}
              onOpen={openProduct}
              onAskGene={() => setIsAiSidebarOpen(true)}
              onGoCart={() => setCurrentView("CART")}
              paidSeeds={paidSeedCount}
            />
          ) : null;
        })()}
        {currentView === "CART" && renderCart()}
        {currentView === "ORDERS" && renderOrders()}
        {currentView === "ASSISTANT" && (
          <div className="px-3 md:px-6 h-[calc(100svh-7.5rem)] md:h-[calc(100svh-8rem)]">
            <GrowAssistant />
          </div>
        )}
        {currentView === "ABOUT" && <About onNavigate={setCurrentView} />}
      </main>

      {renderFreeSeedPicker()}
      {renderWelcomePromo()}
      {renderPurchaseNotification()}

      <CommandPalette
        open={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        products={[...SEED_CATALOG, ...MEDICINE_CATALOG]}
        favorites={favorites}
        onNavigate={(v) => setCurrentView(v)}
        onPickProduct={openProduct}
      />

      {/* Global AI Shop Assistant (Slide Over) */}
      <ShopAssistant
        isOpen={isAiSidebarOpen}
        onClose={() => setIsAiSidebarOpen(false)}
        onAddToCart={addToCart}
        onViewProduct={(p) => {
          setHighlightedProduct(p.id);
        }}
      />

      <UiHost />

      {/* Order Processing Overlay */}
      {invoiceSent && (
        <div className="fixed inset-0 bg-black/75 z-[200] flex items-center justify-center p-4">
          <div className="glass-strong edge-glow rounded-[2.5rem] p-9 max-w-sm w-full text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 rounded-[1.6rem] bg-gradient-to-br from-emerald-300 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-[0_0_60px_-8px_rgba(20,184,166,0.9)]">
              <Mail className="w-10 h-10 text-[#04140e] animate-bounce" />
            </div>
            <h3 className="text-3xl font-extrabold text-white mb-3 tracking-tighter">{checkoutMethod === "PAYPAL" ? "Opening PayPal" : "Opening your mail app"}</h3>
            <p className="text-zinc-400 text-sm mb-7 leading-relaxed">
              {checkoutMethod === "PAYPAL" ? (
                <>We're opening PayPal in a new tab with your order filled in. Finish paying there to complete the order.</>
              ) : (
                <>We're opening your default mail app to send the order request. Please hit <span className="text-emerald-300 font-bold">“Send”</span> to complete the order.</>
              )}
            </p>
            <div className="flex items-center justify-center gap-2.5 text-emerald-300 text-[11px] font-bold uppercase tracking-[0.22em]">
              <span className="w-2 h-2 bg-emerald-300 rounded-full animate-ping" />
              Redirecting to orders
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
