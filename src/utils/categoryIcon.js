import {
  Wheat, Droplets, Milk, CupSoda, Cookie, Flame, Bean, Candy, Sparkles, SprayCan, Package, ShoppingBasket,
} from 'lucide-react';

const MAP = [
  [/rice|flour|grain|atta/i, Wheat],
  [/oil|ghee/i, Droplets],
  [/dairy|egg|milk/i, Milk],
  [/beverage|drink|tea|juice/i, CupSoda],
  [/snack|biscuit|chips/i, Cookie],
  [/spice|season|masala/i, Flame],
  [/pulse|lentil|daal|dal/i, Bean],
  [/sugar|sweet/i, Candy],
  [/personal|care|beauty/i, Sparkles],
  [/clean|household|detergent/i, SprayCan],
  [/canned|packaged|frozen/i, Package],
];

export function categoryIcon(name) {
  const hit = MAP.find(([re]) => re.test(String(name || '')));
  return hit ? hit[1] : ShoppingBasket;
}
