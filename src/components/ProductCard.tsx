import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import type { Product } from "../types/models";
import { formatCurrency } from "../utils/format";

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: number) => Promise<void> | void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { cart } = useStore();
  const cartQuantity = cart.find((entry) => entry.productId === product.id)?.quantity ?? 0;
  const cartQuantityRef = useRef(cartQuantity);
  const resetStatusTimeoutRef = useRef<number | null>(null);
  const [addStatus, setAddStatus] = useState<"idle" | "pending" | "added" | "unchanged">("idle");

  useEffect(() => {
    cartQuantityRef.current = cartQuantity;
  }, [cartQuantity]);

  useEffect(() => {
    return () => {
      if (resetStatusTimeoutRef.current !== null) {
        window.clearTimeout(resetStatusTimeoutRef.current);
      }
    };
  }, []);

  async function handleAddToCart() {
    if (addStatus === "pending") {
      return;
    }

    if (resetStatusTimeoutRef.current !== null) {
      window.clearTimeout(resetStatusTimeoutRef.current);
      resetStatusTimeoutRef.current = null;
    }

    const quantityBeforeAdd = cartQuantityRef.current;
    setAddStatus("pending");

    await Promise.resolve(onAddToCart(product.id));

    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => {
        resolve();
      });
    });

    const quantityAfterAdd = cartQuantityRef.current;
    setAddStatus(quantityAfterAdd > quantityBeforeAdd ? "added" : "unchanged");

    resetStatusTimeoutRef.current = window.setTimeout(() => {
      setAddStatus("idle");
      resetStatusTimeoutRef.current = null;
    }, 1500);
  }

  const addButtonLabel =
    addStatus === "pending"
      ? "Adding..."
      : addStatus === "added"
        ? "Added"
        : addStatus === "unchanged"
          ? "Try Again"
          : "Add to Cart";

  const cartStatusMessage =
    addStatus === "pending"
      ? "Adding item..."
      : addStatus === "added"
        ? `Added. In cart: ${cartQuantity}.`
        : addStatus === "unchanged"
          ? "Cart unchanged."
          : cartQuantity > 0
            ? `In cart: ${cartQuantity}.`
            : "Not in cart yet.";

  return (
    <article className="product-card">
      <Link
        to={`/product/${product.slug}`}
        className="product-image-wrap"
        aria-label={product.name}
      >
        <div className="product-id-tag">#{product.id.toString().padStart(3, "0")}</div>
        <img src={product.heroImage} alt={product.name} className="product-image" />
      </Link>
      <div className="product-meta">
        <div>
          <h3>{product.name}</h3>
          <p>{product.tagline}</p>
        </div>
        <strong>{formatCurrency(product.price)}</strong>
      </div>
      <div className="product-actions">
        <Link className="btn btn-light" to={`/product/${product.slug}`}>
          Inspect
        </Link>
        <button
          type="button"
          className="btn btn-cart"
          disabled={addStatus === "pending"}
          onClick={() => {
            void handleAddToCart();
          }}
        >
          {addButtonLabel}
        </button>
      </div>
      <p
        className={[
          addStatus === "unchanged" ? "cart-status cart-status-warning" : "cart-status",
          addStatus === "idle" && cartQuantity === 0 ? "cart-status-hidden" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-live="polite"
      >
        {cartStatusMessage}
      </p>
    </article>
  );
}
