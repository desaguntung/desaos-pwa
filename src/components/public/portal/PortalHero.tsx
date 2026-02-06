"use client";

import { NewsItem } from "@/components/public/NewsCard";
import PortalNewsCard from "./PortalNewsCard";

interface PortalHeroProps {
  items: NewsItem[];
}

export default function PortalHero({ items }: PortalHeroProps) {
  if (!items || items.length === 0) return null;

  const mainStory = items[0];
  const subStories = items.slice(1, 3);

  return (
    <section className="w-full py-8 md:py-10">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[520px]">
          
          {/* Main Story - Takes 2 columns */}
          <div className="lg:col-span-2 h-[350px] lg:h-full shadow-sm rounded-2xl overflow-hidden">
            <PortalNewsCard 
                item={mainStory} 
                variant="hero-main" 
                className="h-full"
            />
          </div>

          {/* Sub Stories - Takes 1 column, stacked */}
          <div className="flex flex-col gap-6 h-full">
            {subStories.map((item, index) => (
               <div key={item.title} className="flex-1 h-[220px] lg:h-auto shadow-sm rounded-2xl overflow-hidden">
                    <PortalNewsCard 
                        item={item} 
                        variant="hero-sub" // Using hero-sub style for smaller font
                        className="h-full"
                        showCategory={true}
                    />
               </div>
            ))}
            {/* Fallback if less than 3 items total */}
             {subStories.length < 2 && (
                <div className="flex-1 bg-body-bg dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-secondary-text">
                    <span className="text-sm font-medium">Coming Soon</span>
                </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
