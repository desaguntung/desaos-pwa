"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Star, MapPin, Tag, X, MessageSquare, Share2, Heart } from "lucide-react";
import MobileHeader from "./ui/MobileHeader";
import Link from "next/link";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose
} from "@/components/ui/Sheet";

// Mock Data
const CATEGORIES = [
  { id: 1, name: "Makanan", icon: "🍜" },
  { id: 2, name: "Kerajinan", icon: "🧶" },
  { id: 3, name: "Jasa", icon: "🛠️" },
  { id: 4, name: "Pertanian", icon: "🌾" },
  { id: 5, name: "Fashion", icon: "👕" },
];

const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: "Kripik Singkong Balado",
    price: 15000,
    rating: 4.8,
    sold: 120,
    image: "https://images.unsplash.com/photo-1599488615731-7e512819a6c6?auto=format&fit=crop&q=80&w=300&h=300",
    seller: "Bu Siti",
    location: "Dusun 1",
    description: "Kripik singkong renyah dengan bumbu balado khas desa yang pedas manis. Dibuat dari singkong pilihan hasil panen petani lokal. Tanpa bahan pengawet, cocok untuk cemilan keluarga."
  },
  {
    id: 2,
    name: "Batik Tulis Khas Desa",
    price: 250000,
    rating: 5.0,
    sold: 45,
    image: "https://images.unsplash.com/photo-1534126511673-b6899657816a?auto=format&fit=crop&q=80&w=300&h=300",
    seller: "Galeri Batik",
    location: "Dusun 2",
    description: "Kain batik tulis asli buatan tangan pengrajin desa dengan motif filosofi kearifan lokal. Bahan katun primisima yang adem dan nyaman dipakai. Ukuran 200cm x 115cm."
  },
  {
    id: 3,
    name: "Madu Hutan Murni",
    price: 85000,
    rating: 4.9,
    sold: 230,
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=300&h=300",
    seller: "Kelompok Tani",
    location: "Dusun 3",
    description: "Madu hutan murni 100% tanpa campuran gula. Dipanen langsung dari sarang lebah liar di hutan desa. Kaya manfaat untuk kesehatan dan stamina tubuh. Kemasan botol kaca 250ml."
  }
];

const PRODUCTS = [
  ...FEATURED_PRODUCTS,
  {
    id: 4,
    name: "Jasa Servis Elektronik",
    price: 50000,
    rating: 4.7,
    sold: 89,
    image: "https://images.unsplash.com/photo-1581092921461-eab62e97a782?auto=format&fit=crop&q=80&w=300&h=300",
    seller: "Pak Budi",
    location: "Dusun 1",
    description: "Melayani perbaikan segala jenis alat elektronik rumah tangga seperti kipas angin, setrika, blender, dll. Bergaransi 1 minggu setelah servis. Bisa dipanggil ke rumah untuk wilayah desa."
  },
  {
    id: 5,
    name: "Sayur Organik Segar",
    price: 10000,
    rating: 4.8,
    sold: 560,
    image: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&q=80&w=300&h=300",
    seller: "Kebun Desa",
    location: "Dusun 2",
    description: "Paket sayur mayur segar organik (bayam, kangkung, sawi) yang dipetik langsung saat ada pesanan. Bebas pestisida kimia, lebih sehat dan segar. Harga per ikat."
  },
   {
    id: 6,
    name: "Anyaman Bambu",
    price: 35000,
    rating: 4.6,
    sold: 34,
    image: "https://images.unsplash.com/photo-1605634563898-f2b3b0284411?auto=format&fit=crop&q=80&w=300&h=300",
    seller: "Pengrajin Bambu",
    location: "Dusun 3",
    description: "Kerajinan anyaman bambu serbaguna, bisa untuk wadah nasi, buah, atau hiasan. Dibuat dengan teliti oleh pengrajin senior desa. Awet, kuat, dan estetik alami."
  }
];

export default function MobileShopView() {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-32 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-20%] w-[70%] h-[40%] bg-orange-100/40 rounded-full blur-[80px] pointer-events-none mix-blend-multiply" />
      <div className="absolute top-[10%] right-[-10%] w-[60%] h-[40%] bg-rose-100/40 rounded-full blur-[80px] pointer-events-none mix-blend-multiply" />

      {/* Header */}
      <MobileHeader />

      <div className="px-5 mt-4">
        {/* Banner / Search */}
        <div className="mb-6">
           <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-1">
            Pasar<span className="text-blue-600">Desa</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium mb-4">
            Dukung UMKM lokal, belanja produk asli desa.
          </p>
          
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" strokeWidth={2} />
            </div>
            <input 
              type="text" 
              placeholder="Cari produk, jasa, atau makanan..." 
              className="w-full pl-12 pr-4 py-3.5 bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-[20px] text-slate-700 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
             <h2 className="text-lg font-bold text-slate-800">Kategori</h2>
             <Link href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700">Lihat Semua</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <motion.button 
                key={cat.id}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-2 min-w-[72px]"
              >
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-2xl mb-1">
                  {cat.icon}
                </div>
                <span className="text-xs font-medium text-slate-600">{cat.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Featured Slider */}
        <div className="mb-8">
           <div className="flex items-center justify-between mb-3">
             <h2 className="text-lg font-bold text-slate-800">Produk Unggulan</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide snap-x">
             {FEATURED_PRODUCTS.map((product) => (
                <div key={product.id} className="min-w-[280px] snap-center">
                   <div 
                      onClick={() => setSelectedProduct(product)}
                      className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-slate-100 relative group active:scale-[0.98] transition-transform cursor-pointer"
                    >
                      <div className="relative h-40 bg-slate-100">
                         <Image 
                           src={product.image} 
                           alt={product.name}
                           fill
                           className="object-cover"
                         />
                         <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-slate-800 flex items-center gap-1 shadow-sm">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            {product.rating}
                         </div>
                      </div>
                      <div className="p-4">
                         <h3 className="font-bold text-slate-800 text-lg mb-1 truncate">{product.name}</h3>
                         <div className="flex items-center gap-1 text-slate-500 text-xs mb-3">
                            <MapPin className="w-3 h-3" />
                            {product.location} • {product.seller}
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="font-black text-blue-600 text-lg">
                               Rp {product.price.toLocaleString('id-ID')}
                            </span>
                            <button className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-blue-600 transition-colors">
                               <ShoppingBag className="w-4 h-4" />
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
             ))}
          </div>
        </div>

        {/* All Products Grid */}
        <div className="mb-6">
           <h2 className="text-lg font-bold text-slate-800 mb-4">Rekomendasi Untukmu</h2>
           <div className="grid grid-cols-2 gap-4">
              {PRODUCTS.map((product) => (
                 <div 
                    key={product.id} 
                    onClick={() => setSelectedProduct(product)}
                    className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-slate-100 flex flex-col active:scale-[0.98] transition-transform cursor-pointer"
                  >
                    <div className="relative h-32 bg-slate-100">
                         <Image 
                           src={product.image} 
                           alt={product.name}
                           fill
                           className="object-cover"
                         />
                    </div>
                    <div className="p-3 flex-1 flex flex-col">
                       <h3 className="font-bold text-slate-800 text-sm mb-1 line-clamp-2">{product.name}</h3>
                       <div className="flex items-center gap-1 text-slate-400 text-[10px] mb-2">
                          <Tag className="w-3 h-3" />
                          Terjual {product.sold}
                       </div>
                       <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-50">
                          <span className="font-bold text-blue-600 text-sm">
                             Rp {product.price.toLocaleString('id-ID')}
                          </span>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* Product Detail Sheet */}
      <Sheet open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-[32px] p-0 border-none bg-white overflow-hidden [&>button]:hidden">
           {selectedProduct && (
              <div className="flex flex-col h-full relative bg-[#F5F5F7]">
                 {/* Drag Handle */}
                 <div className="absolute top-0 left-0 right-0 z-50 flex justify-center pt-3 pb-6 pointer-events-none">
                    <div className="w-12 h-1.5 bg-white/80 rounded-full shadow-sm" />
                 </div>

                 {/* Close Button */}
                 <SheetClose className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/30 transition-colors">
                    <X className="w-5 h-5" />
                 </SheetClose>

                 {/* Product Image */}
                 <div className="relative h-[45vh] w-full shrink-0">
                    <Image 
                       src={selectedProduct.image} 
                       alt={selectedProduct.name}
                       fill
                       className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#F5F5F7] to-transparent opacity-80" />
                 </div>

                 {/* Content Container - Overlapping Image */}
                 <div className="flex-1 -mt-20 relative z-10 px-6 pb-24 overflow-y-auto scrollbar-hide">
                    <div className="flex items-start justify-between mb-4">
                       <div>
                          <h2 className="text-2xl font-black text-slate-800 leading-tight mb-2">{selectedProduct.name}</h2>
                          <div className="flex items-center gap-2">
                             <div className="flex items-center gap-1 bg-yellow-400/20 px-2 py-1 rounded-lg">
                                <Star className="w-3.5 h-3.5 text-yellow-600 fill-yellow-600" />
                                <span className="text-xs font-bold text-yellow-700">{selectedProduct.rating}</span>
                             </div>
                             <span className="text-slate-400 text-xs">•</span>
                             <span className="text-slate-500 text-xs font-medium">{selectedProduct.sold} Terjual</span>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-2xl font-black text-blue-600">
                             Rp {selectedProduct.price.toLocaleString('id-ID')}
                          </p>
                       </div>
                    </div>

                    {/* Seller Info */}
                    <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100 mb-6">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg">
                             🏪
                          </div>
                          <div>
                             <h4 className="font-bold text-slate-800 text-sm">{selectedProduct.seller}</h4>
                             <div className="flex items-center gap-1 text-slate-500 text-xs">
                                <MapPin className="w-3 h-3" />
                                {selectedProduct.location}
                             </div>
                          </div>
                       </div>
                       <button className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-full hover:bg-blue-100 transition-colors">
                          Kunjungi
                       </button>
                    </div>

                    {/* Description */}
                    <div className="mb-8">
                       <h3 className="font-bold text-slate-800 mb-2">Deskripsi Produk</h3>
                       <p className="text-slate-600 text-sm leading-relaxed">
                          {selectedProduct.description}
                       </p>
                    </div>

                    {/* Reviews Preview (Static for now) */}
                    <div>
                       <h3 className="font-bold text-slate-800 mb-3">Ulasan Pembeli</h3>
                       <div className="space-y-3">
                          <div className="bg-white p-3 rounded-xl border border-slate-100">
                             <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-full bg-slate-200" />
                                <span className="text-xs font-bold text-slate-700">Warga Desa</span>
                                <div className="flex gap-0.5 ml-auto">
                                   {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
                                </div>
                             </div>
                             <p className="text-xs text-slate-600">Barangnya bagus, sesuai deskripsi. Penjual ramah banget!</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Bottom Action Bar */}
                 <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 flex items-center gap-3 z-50 pb-8">
                    <button className="w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50">
                       <MessageSquare className="w-5 h-5" />
                    </button>
                    <button className="flex-1 bg-blue-600 text-white font-bold h-12 rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all">
                       <ShoppingBag className="w-5 h-5" />
                       Beli Sekarang
                    </button>
                 </div>
              </div>
           )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
