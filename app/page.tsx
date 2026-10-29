"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Activity, ShieldAlert, BookOpen, AlertCircle, Globe, Table as TableIcon, BarChart2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Dil seçimi artık URL'den alınıyor (?lang=en veya varsayılan 'tr')
  const lang = searchParams.get('lang') || 'tr';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<any>(null);
  
  // Arayüz Filtre ve Görünüm Durumları
  const [turkeyFilter, setTurkeyFilter] = useState(false);
  const [chartView, setChartView] = useState(true); // true = Grafik, false = Tablo
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      try {
        setData({
          lastUpdate: new Date().toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US'),
          kpis: { total: 1245, tr: 84, rising: 'Deep Learning' },
          chartData: [
            { name: '1. Hafta', yayin: turkeyFilter ? 10 : 40, tr: 10 },
            { name: '2. Hafta', yayin: turkeyFilter ? 12 : 30, tr: 12 },
            { name: '3. Hafta', yayin: turkeyFilter ? 15 : 45, tr: 15 },
            { name: '4. Hafta', yayin: turkeyFilter ? 20 : 60, tr: 20 },
          ],
          tableData: [
            { id: 1, title: 'Phishing Detection via Deep Learning', year: 2026, citations: 45, country: 'TR' },
            { id: 2, title: 'AI in Cyber Security', year: 2025, citations: 120, country: 'US' },
            { id: 3, title: 'Network Analysis of Malware', year: 2026, citations: 15, country: 'TR' },
            { id: 4, title: 'Secure Cloud Architecture', year: 2024, citations: 200, country: 'UK' },
          ],
          networkData: [
            { x: 10, y: 30, z: 200, name: 'AI' },
            { x: 30, y: 70, z: 150, name: 'Phishing' },
            { x: 60, y: 40, z: 300, name: 'Cyber' },
            { x: 80, y: 80, z: 100, name: 'Cloud' },
          ]
        });
        setLoading(false);
      } catch (err) {
        setError(true);
        setLoading(false);
      }
    }, 800);
  }, [lang, turkeyFilter]);

  const changeLang = (newLang: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('lang', newLang);
    router.push(`${pathname}?${params.toString()}`);
  };

  const t = {
    tr: {
      title: "Araştırma Trend Radarı",
      source: "Veri Kaynağı: OpenAlex API & arXiv API",
      kpi1: "Toplam Yayın",
      kpi2: "Türkiye Adresli",
      kpi3: "Yükselen Konu",
      filterTr: "Sadece Türkiye Adresli Yayınlar (OpenAlex)",
      chartTitle: "Haftalık Yayın Trendi",
      chartSummary: "Bu grafik, belirlenen konuların haftalık olarak yayımlanma sıklığını göstermektedir.",
      networkTitle: "Anahtar Kelime Ağı (Sürükle & Yakınlaştır)",
      networkSummary: "Kelime eş-görünümleri baloncuk büyüklüğüyle ifade edilmiştir.",
      viewTable: "Veriyi Tablo Olarak Gör",
      viewChart: "Grafik Görünümü",
      tableTitle: "Makale Başlığı",
      tableCit: "Atıf",
      loading: "Veriler güncelleniyor...",
      error: "API bağlantı hatası! Son başarılı veri (Snapshot) gösteriliyor."
    },
    en: {
      title: "Research Trend Radar",
      source: "Data Source: OpenAlex API & arXiv API",
      kpi1: "Total Pubs",
      kpi2: "Turkey Affiliated",
      kpi3: "Rising Topic",
      filterTr: "Only Turkey Affiliated (OpenAlex)",
      chartTitle: "Weekly Publication Trend",
      chartSummary: "This chart displays the weekly publication frequency of the selected topics.",
      networkTitle: "Keyword Network (Drag & Zoom)",
      networkSummary: "Keyword co-occurrences are represented by bubble size.",
      viewTable: "View Data as Table",
      viewChart: "Chart View",
      tableTitle: "Article Title",
      tableCit: "Citations",
      loading: "Updating data...",
      error: "API connection error! Showing latest successful snapshot."
    }
  };

  const text = t[lang as keyof typeof t];

  // Tablo Sıralama Mantığı
  const sortedTableData = data?.tableData
    .filter((row: any) => (turkeyFilter ? row.country === 'TR' : true))
    .sort((a: any, b: any) => sortOrder === 'desc' ? b.citations - a.citations : a.citations - b.citations);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{text.title}</h1>
          <p className="text-sm text-slate-500 mt-1">{text.source}</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <button 
            onClick={() => changeLang(lang === 'tr' ? 'en' : 'tr')}
            className="flex items-center gap-2 bg-white border border-slate-300 px-4 py-2 rounded-md hover:bg-slate-100 transition"
          >
            <Globe size={18} /> {lang === 'tr' ? 'EN' : 'TR'}
          </button>
        </div>
      </header>

      {/* Kontrol / Filtre Paneli */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6 flex justify-between items-center">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input 
            type="checkbox" 
            checked={turkeyFilter} 
            onChange={(e) => setTurkeyFilter(e.target.checked)} 
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="font-medium text-slate-700">{text.filterTr}</span>
        </label>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-40 animate-pulse text-slate-500">
          <Activity className="animate-spin mr-2" /> {text.loading}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md flex items-center mb-6 border border-red-200">
          <AlertCircle className="mr-3" /> {text.error}
        </div>
      )}

      {!loading && data && (
        <main>
          <div className="text-xs text-slate-400 text-right mb-4">
             Son Güncelleme: {data.lastUpdate}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 flex items-center justify-between">
              <div><p className="text-sm text-slate-500 mb-1">{text.kpi1}</p><p className="text-3xl font-bold">{data.kpis.total}</p></div>
              <BookOpen className="text-blue-500" size={32} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 flex items-center justify-between">
              <div><p className="text-sm text-slate-500 mb-1">{text.kpi2}</p><p className="text-3xl font-bold">{data.kpis.tr}</p></div>
              <Activity className="text-emerald-500" size={32} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 flex items-center justify-between">
              <div><p className="text-sm text-slate-500 mb-1">{text.kpi3}</p><p className="text-xl font-bold">{data.kpis.rising}</p></div>
              <ShieldAlert className="text-purple-500" size={32} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Grafik 1: Haftalık Trend */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-700">{text.chartTitle}</h2>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">{text.chartSummary}</p>
                </div>
                <button 
                  onClick={() => setChartView(!chartView)}
                  className="flex items-center gap-1 text-sm bg-slate-100 px-3 py-1 rounded hover:bg-slate-200"
                >
                  {chartView ? <><TableIcon size={14}/> {text.viewTable}</> : <><BarChart2 size={14}/> {text.viewChart}</>}
                </button>
              </div>

              <div className="h-64 w-full">
                {chartView ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="yayin" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="overflow-auto h-full border rounded">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 border-b">
                        <tr><th className="p-3">Dönem</th><th className="p-3">Yayın Sayısı</th></tr>
                      </thead>
                      <tbody>
                        {data.chartData.map((row: any, i: number) => (
                          <tr key={i} className="border-b"><td className="p-3">{row.name}</td><td className="p-3">{row.yayin}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Grafik 2: Ağ Grafiği (Scatter Bubble simülasyonu ile sürükle/yakınlaştır etkisi) */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-700">{text.networkTitle}</h2>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">{text.networkSummary}</p>
              </div>
              <div className="h-64 w-full cursor-move">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid />
                    <XAxis type="number" dataKey="x" name="X" hide />
                    <YAxis type="number" dataKey="y" name="Y" hide />
                    <ZAxis type="number" dataKey="z" range={[100, 1000]} name="Ağırlık" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Anahtar Kelimeler" data={data.networkData} fill="#10b981" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sıralanabilir Detay Tablosu */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-700">Detaylı Yayın Listesi</h3>
              <button 
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="text-sm text-blue-600 hover:underline"
              >
                Atıfa Göre Sırala ({sortOrder === 'desc' ? 'Azalan' : 'Artan'})
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white border-b text-slate-500">
                  <tr>
                    <th className="p-4">{text.tableTitle}</th>
                    <th className="p-4">Yıl</th>
                    <th className="p-4">{text.tableCit}</th>
                    <th className="p-4">Ülke</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTableData.map((row: any) => (
                    <tr key={row.id} className="border-b hover:bg-slate-50">
                      <td className="p-4 font-medium">{row.title}</td>
                      <td className="p-4">{row.year}</td>
                      <td className="p-4">{row.citations}</td>
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">{row.country}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

export default function TrendRadarDashboard() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Yükleniyor...</div>}>
      <DashboardContent />
    </Suspense>
  );
}