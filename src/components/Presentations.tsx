import React, { useEffect } from "react";
import Slider from "react-slick";
import { motion } from "framer-motion";
import { useState } from "react";
import type { TefsirItem } from "@/types/tefsir";



const Presentations = () => {
  // 🔹 State'ler
  const [tefsirData, setTefsirData] = useState<TefsirItem[]>([]);
  const [allData, setAllData] = useState<TefsirItem[]>([]); // For filter options
  const [selectedKitap, setSelectedKitap] = useState("");
  const [selectedMufessir, setSelectedMufessir] = useState("");
  const [selectedAyet, setSelectedAyet] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch all data once for filter options
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const response = await fetch("/api/presentations?limit=1000");
        const result = await response.json();
        setAllData(result.data || result);
      } catch (error) {
        console.error("Error fetching all data:", error);
      }
    }
    fetchAllData();
  }, []);

  // Fetch filtered data when filters change
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedKitap) params.append("kitap", selectedKitap);
        if (selectedMufessir) params.append("mufessir", selectedMufessir);
        if (selectedAyet) params.append("ayetNo", selectedAyet);

        const response = await fetch(`/api/presentations?${params.toString()}`);
        const result = await response.json();
        setTefsirData(result.data || result);
      } catch (error) {
        console.error("Error fetching presentations:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedKitap, selectedMufessir, selectedAyet]);

  // 🔹 Benzersiz kitap ve müfessir listeleri oluştur (from all data)
  const kitapListesi = [...new Set(allData.map((item) => item.kitap))];
  const mufessirListesi = [...new Set(allData.map((item) => item.mufessir))];
  const ayetListesi = [...new Set(allData.map((item) => item.ayetNo))].sort(
    (a: any, b: any) => a - b
  );

  // 🔹 Slider ayarları
  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: false,
    adaptiveHeight: true, // Allows slides to have different heights
  };

  return (
    <div className="max-w-7xl mx-auto m-8 p-4 w-5xl">
      {/* 🔹 Filtre Alanı */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4 bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-green-800 mb-1">
            Kitap:
          </label>
          <select
            value={selectedKitap}
            onChange={(e) => setSelectedKitap(e.target.value)}
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="">Tümü</option>
            {kitapListesi.map((kitap) => (
              <option key={kitap} value={kitap}>
                {kitap}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-green-800 mb-1">
            Müfessir:
          </label>
          <select
            value={selectedMufessir}
            onChange={(e) => setSelectedMufessir(e.target.value)}
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="">Tümü</option>
            {mufessirListesi.map((mufessir) => (
              <option key={mufessir} value={mufessir}>
                {mufessir}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-green-800 mb-1">
            Ayet No:
          </label>
          <select
            value={selectedAyet}
            onChange={(e) => setSelectedAyet(e.target.value)}
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="">Tümü</option>
            {ayetListesi.map((ayet) => (
              <option key={ayet} value={ayet}>
                {ayet}
              </option>
            ))}
          </select>
        </div>

        {/* Temizle Butonu */}
        <button
          onClick={() => {
            setSelectedKitap("");
            setSelectedMufessir("");
            setSelectedAyet("");
          }}
          className="bg-amber-100 text-amber-800 px-4 py-2 rounded-md border border-amber-300 hover:bg-amber-200 transition"
        >
          Filtreyi Temizle
        </button>
      </div>

      {/* 🔹 Slider Alanı */}
      {loading ? (
        <div className="flex justify-center items-center min-h-96">
          <div className="text-white text-xl">Yükleniyor...</div>
        </div>
      ) : (
        <Slider {...settings}>
          {tefsirData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl p-6 border border-gray-200"
            >
              {/* Üst kısım */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col align-middle justify-between my-auto">
                  <h2 className="text-2xl font-semibold text-green-900">
                    {item.kitap}
                  </h2>
                  <p className="text-amber-800 font-semibold italic text-xl mt-3">
                    {item.mufessir}
                  </p>
                </div>
                <div className="text-right max-w-1/2 flex-shrink-0 bg-amber-50 rounded-lg p-3 border border-amber-200">
                  <p className="text-base text-stone-600 font-medium">
                    {item.sure} Suresi (Ayet: {item.ayetNo})
                  </p>
                  <p className="text-4xl font-arabic text-right text-green-900 leading-snug mt-2">
                    {item.arapca}
                  </p>
                </div>
              </div>

              {/* Açıklama */}
              <div className="border-t-2 p-4">
                <div
                  className="prose prose-lg prose-stone text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: item.aciklama }}
                />
              </div>
            </motion.div>
          ))}
        </Slider>
      )}
    </div>
  );
};

export default Presentations;
