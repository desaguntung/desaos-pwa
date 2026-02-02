"use client";

import { useRouter } from "next/navigation";
import MobileArticleDetail from "./MobileArticleDetail";

interface MobileArticlePageWrapperProps {
  article: any;
  slug: string;
}

export default function MobileArticlePageWrapper({ article, slug }: MobileArticlePageWrapperProps) {
  const router = useRouter();

  const handleClose = () => {
    // Check if we can go back, otherwise go to news list
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push("/berita");
    }
  };

  return (
    <MobileArticleDetail 
      slug={slug} 
      initialData={article} 
      onClose={handleClose} 
    />
  );
}
