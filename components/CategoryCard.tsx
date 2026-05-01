import Link from 'next/link';
import Image from 'next/image';

interface CategoryCardProps {
  _id: string;
  categoryname: string;
  image: string;
}

export default function CategoryCard({ _id, categoryname, image }: CategoryCardProps) {
  return (
    <Link href={`/products?category=${_id}`}>
      <div className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-shadow cursor-pointer">
        <div className="relative h-40 w-full bg-gray-100">
          <Image
            src={image}
            alt={categoryname}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-white font-semibold text-center">{categoryname}</h3>
          </div>
        </div>
      </div>
    </Link>
  );
}
