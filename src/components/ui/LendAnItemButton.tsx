import Link from 'next/link';
import { Button } from './Button';

export default function LendAnItemButton() {
  return (
    <Link href="/lend">
      <Button className="mr-4 px-4 py-2 bg-white text-gray-800 rounded-full shadow-md hover:bg-gray-100 transition-colors flex items-center justify-center font-sans text-sm">
        Lend an Item
      </Button>
    </Link>
  );
} 