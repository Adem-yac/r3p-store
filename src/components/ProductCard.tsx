import { Link } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  isPromo?: boolean;
}

const ProductCard = ({ id, name, price, oldPrice, image, category, isPromo }: ProductCardProps) => {
  return (
    <Link to={`/product/${id}`} className="group block">
      {/* Image */}
      <div className="relative overflow-hidden bg-muted aspect-[3/4] rounded-lg">
        {isPromo && (
          <span className="badge-promo absolute top-3 left-3 z-10 rounded-md">
            Promo
          </span>
        )}
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors duration-300" />
      </div>

      {/* Info */}
      <div className="mt-3">
        <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
          {category}
        </p>
        <h3 className="font-heading text-xl text-foreground mt-0.5 leading-tight">
          {name}
        </h3>
        <div className="flex items-center gap-3 mt-1">
          {oldPrice && (
            <span className="text-muted-foreground text-xs line-through font-body">
              {oldPrice.toLocaleString()} DZD
            </span>
          )}
          <span className="font-body text-sm font-semibold text-accent">
            {price.toLocaleString()} DZD
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
