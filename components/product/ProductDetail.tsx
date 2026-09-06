"use client";

import Features from "@/components/product/Features";
import ProductBreadcrumb from "@/components/product/ProductBreadcrumb";
import ProductDescription from "@/components/product/ProductDescription";
import ProductGallery from "@/components/product/ProductGallery";
import ProductReviews from "@/components/product/ProductReviews";
import RelatedProducts from "@/components/product/RelatedProducts";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import { formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import type { PaginatedReviews } from "@/types/review";
import {
  Check,
  Heart,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Share2,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProductDetail({
  product,
  relatedProducts,
  reviews,
}: {
  product: Product;
  relatedProducts: Product[];
  reviews: PaginatedReviews;
}) {
  const { addToCart } = useCart();
  const { currency, free_shipping_threshold } = useSettings();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const hasSizes = !!product.sizes?.length;
  const hasColors = !!product.colors?.length;
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [variantError, setVariantError] = useState<string | null>(null);

  const isOnSale =
    product.compare_at_price != null && product.compare_at_price > product.price;
  const discount = isOnSale
    ? Math.round(
        ((product.compare_at_price! - product.price) / product.compare_at_price!) * 100
      )
    : 0;

  // Checkout rejects an order whose quantity exceeds stock, so an out-of-stock
  // product must not offer an enabled button in the first place.
  const inStock = product.stock > 0;
  const lowStock = inStock && product.stock <= 3;

  // The buy box keeps the first paragraph for context; the rest lives in the
  // description section below so the call to action stays above the fold.
  const teaser = (product.description ?? "").split("\n").map((l) => l.trim()).find(Boolean);

  const handleAddToCart = async () => {
    if (!inStock) return false;
    if (hasSizes && !selectedSize) {
      setVariantError("Veuillez sélectionner une taille.");
      return false;
    }
    if (hasColors && !selectedColor) {
      setVariantError("Veuillez sélectionner une couleur.");
      return false;
    }
    setVariantError(null);
    setIsAdding(true);

    await new Promise((resolve) => setTimeout(resolve, 300));

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || "",
        quantity: 1,
        size: selectedSize,
        color: selectedColor,
        availableSizes: product.sizes,
        availableColors: product.colors,
      });
    }

    setIsAdding(false);
    setJustAdded(true);

    setTimeout(() => setJustAdded(false), 2000);
    return true;
  };

  const handleBuyNow = async () => {
    const added = await handleAddToCart();
    if (added) {
      setTimeout(() => router.push("/cart"), 500);
    }
  };

  const handleQuantityChange = (type: "increment" | "decrement") => {
    if (type === "increment") {
      setQuantity((prev) => Math.min(prev + 1, product.stock || 1));
    } else if (type === "decrement" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProductBreadcrumb />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] xl:gap-16 mb-16">
        {/* Sticky so the photo stays in view while the buy box and specs scroll. */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ProductGallery
            images={product.images ?? []}
            fallbackImage={product.image}
            alt={product.name}
          />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {product.category && (
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="text-xs font-medium uppercase tracking-wider text-primary hover:underline"
              >
                {product.category.name}
              </Link>
            )}
            {product.is_new && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                Nouveau
              </span>
            )}
            {isOnSale && (
              <span className="rounded-full bg-destructive px-2.5 py-0.5 text-xs font-semibold text-destructive-foreground">
                -{discount}%
              </span>
            )}
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold leading-tight text-foreground">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    product.reviews_avg_rating != null &&
                      i < Math.round(product.reviews_avg_rating)
                      ? "fill-primary text-primary"
                      : "text-muted-foreground/40"
                  )}
                />
              ))}
            </div>
            {product.reviews_count > 0 ? (
              <a
                href="#avis"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {product.reviews_avg_rating?.toFixed(1)} · {product.reviews_count} avis
              </a>
            ) : (
              <span className="text-sm text-muted-foreground">Pas encore d&apos;avis</span>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-bold text-foreground">
              {formatPrice(product.price, currency)}
            </span>
            {isOnSale && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.compare_at_price as number, currency)}
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            TTC · Livraison offerte dès {formatPrice(free_shipping_threshold, currency)}
          </p>

          <div className="mt-4">
            {inStock ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 text-sm font-medium",
                  lowStock ? "text-amber-600" : "text-emerald-600"
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    lowStock ? "bg-amber-500" : "bg-emerald-500"
                  )}
                />
                {lowStock
                  ? `Plus que ${product.stock} en stock`
                  : "En stock, expédié sous 48 h"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/50" />
                Rupture de stock
              </span>
            )}
          </div>

          {teaser && (
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground line-clamp-4">
              {teaser}
            </p>
          )}

          {(product.description?.trim().length ?? 0) > 0 && (
            <a
              href="#description"
              className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
            >
              Voir la description complète
            </a>
          )}

          <div className="mt-6 space-y-5 border-t border-border pt-6">
            {hasColors && (
              <div>
                <span className="text-sm font-medium text-foreground mb-2 block">
                  Couleur{selectedColor ? ` : ${selectedColor}` : ""}
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.colors!.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        setSelectedColor(color);
                        setVariantError(null);
                      }}
                      className={cn(
                        "px-3.5 py-2 rounded-lg border text-sm font-medium transition-colors",
                        selectedColor === color
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-foreground hover:border-primary/50"
                      )}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasSizes && (
              <div>
                <span className="text-sm font-medium text-foreground mb-2 block">
                  Taille{selectedSize ? ` : ${selectedSize}` : ""}
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.sizes!.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setSelectedSize(size);
                        setVariantError(null);
                      }}
                      className={cn(
                        "h-10 px-3.5 rounded-lg border text-sm font-medium transition-colors",
                        selectedSize === size
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-foreground hover:border-primary/50"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {variantError && (
              <p className="text-sm text-destructive">{variantError}</p>
            )}

            <div className="flex items-end gap-3">
              <div>
                <span className="text-sm font-medium text-foreground mb-2 block">
                  Quantité
                </span>
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange("decrement")}
                    disabled={quantity <= 1 || !inStock}
                    className="h-11 w-11 rounded-r-none"
                    aria-label="Diminuer la quantité"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 min-w-[3rem] text-center font-medium tabular-nums">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange("increment")}
                    disabled={!inStock || quantity >= product.stock}
                    className="h-11 w-11 rounded-l-none"
                    aria-label="Augmenter la quantité"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className={cn(
                  "h-12 w-full text-base transition-all duration-300",
                  justAdded
                    ? "bg-emerald-600 text-white hover:bg-emerald-600"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
                onClick={handleAddToCart}
                disabled={isAdding || !inStock}
              >
                {!inStock ? (
                  "Indisponible"
                ) : isAdding ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Ajout...
                  </span>
                ) : justAdded ? (
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Ajouté au panier !
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Ajouter au panier
                  </span>
                )}
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={handleBuyNow}
                disabled={isAdding || !inStock}
                className="h-12 w-full text-base border-foreground/20 hover:bg-foreground hover:text-background"
              >
                Acheter maintenant
              </Button>
            </div>

            <div className="flex items-center gap-1 -ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className={cn(
                  "text-muted-foreground hover:text-foreground",
                  isLiked && "text-destructive"
                )}
              >
                <Heart className={cn("h-4 w-4 mr-2", isLiked && "fill-current")} />
                Favoris
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
            </div>

            <ul className="space-y-2.5 border-t border-border pt-5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2.5">
                <Truck className="h-4 w-4 shrink-0 text-primary" />
                Livraison offerte dès {formatPrice(free_shipping_threshold, currency)}
              </li>
              <li className="flex items-center gap-2.5">
                <RotateCcw className="h-4 w-4 shrink-0 text-primary" />
                Retours gratuits sous 30 jours
              </li>
              <li className="flex items-center gap-2.5">
                <Package className="h-4 w-4 shrink-0 text-primary" />
                Vélo livré monté à 90 %
              </li>
            </ul>
          </div>
        </div>
      </div>

      {product.description && (
        <ProductDescription description={product.description} />
      )}

      <Features />

      <ProductReviews
        slug={product.slug}
        initialReviews={reviews}
        averageRating={product.reviews_avg_rating}
        reviewsCount={product.reviews_count}
      />

      <RelatedProducts products={relatedProducts} />
    </div>
  );
}
