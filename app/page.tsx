"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Globe, BookOpen, TrendingUp, Users, Filter, Code, Network, AlertTriangle, ArrowUpDown, RefreshCw, Database, FileText } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

type Language = 'tr' | 'en';

export default function Dashboard() {
  const [lang, setLang] = useState<Language>('tr');
  const [isTurkeyFilterActive, setIsTurkeyFilterActive] = useState(false);
  
  const [kpiData, setKpiData] = useState({ total: 0, citations: 0, researchers: 0 });
  const [trendData, setTrendData] = useState<any[]>([]);
  const [networkData, setNetworkData] = useState<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] });
  const [tableData, setTableData] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const t = {
    tr: {
      title: "Araştırma Trend Radarı",
      desc: "Yapay Zekâ ve Siber Güvenlik Alanındaki Güncel Yayınlar",
      kpi1: "Toplam Yayın",
      kpi2: "Ortalama Atıf",
      kpi3: "Aktif Araştırmacı",
      networkTitle: "Anahtar Kelime Eş-Görünüm Ağı",
      networkSummary: "Grafik, yapay zekâ ve siber güvenlik makalelerindeki en sık geçen kavramlar arasındaki akademik bağlantıları gösterir.",
      trendTitle: "Yıllık Yayın Sayısı Trendi",
      trendSummary: "Yıllık yayın dağılımı, son dönemde yapay zekâ destekli güvenlik araştırmalarındaki yükselişi ortaya koymaktadır.",
      tableTitle: "Detaylı Yayın Tablosu",
      viewAsTable: "Veriyi Tablo Olarak Gör",
      trFilter: "Sadece Türkiye Adresli Yayınlar",
      loading: "Veriler Çekiliyor...",
      error: "API Bağlantı Hatası! Lütfen internet bağlantınızı kontrol edin.",
      empty: "Seçilen filtreye uygun yayın bulunamadı.",
      designer: "Veri Analisti & Arayüz Geliştiricisi: Bengisu Küçük",
      lastUpdate: "Son güncelleme",
      dataSource: "Veri Kaynağı: OpenAlex API (CC0 Lisansı)",
      thTitle: "Makale Başlığı",
      thYear: "Yıl",
      thCitations: "Atıf Sayısı",
    },
    en: {
      title: "Research Trend Radar",
      desc: "Recent Publications in AI and Cybersecurity",
      kpi1: "Total Publications",
      kpi2: "Avg. Citations",
      kpi3: "Active Researchers",
      networkTitle: "Keyword Co-occurrence Network",
      networkSummary: "The graph illustrates core academic connections between frequent concepts in AI and cybersecurity literature.",
      trendTitle: "Yearly Publication Trend",
      trendSummary: "The yearly publication distribution highlights a recent rise in AI-driven cybersecurity research.",
      tableTitle: "Detailed Publication Table",
      viewAsTable: "View Data as Table",
      trFilter: "Turkey-Addressed Publications Only",
      loading: "Fetching Data...",
      error: "API Connection Error! Please check your network connection.",
      empty: "No publications found matching the selected filter.",
      designer: "Data Analyst & UI Developer: Bengisu Küçük",
      lastUpdate: "Last update",
      dataSource: "Data Source: OpenAlex API (CC0 License)",
      thTitle: "Article Title",
      thYear: "Year",
      thCitations: "Citations",
    }
  };

  // 1. URL Parameter Sync for Language (?lang=tr or ?lang=en)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const langParam = params.get('lang');
      if (langParam === 'en' || langParam === 'tr') {
        setLang(langParam);
      }
    }
  }, []);

  const handleLangToggle = () => {
    const nextLang = lang === 'tr' ? 'en' : 'tr';
    setLang(nextLang);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', nextLang);
      window.history.pushState({}, '', url.toString());
    }
  };

  const scrollToTable = () => {
    const tableElement = document.getElementById('publication-table');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 2. Data Fetching with LocalStorage Offline Cache & Resiliency
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setHasError(false);
      
      let url = "https://api.openalex.org/works?search=artificial intelligence cybersecurity&per-page=50";
      if (isTurkeyFilterActive) {
        url = "https://api.openalex.org/works?filter=institutions.country_code:tr&search=artificial intelligence cybersecurity&per-page=50";
      }

      const cacheKey = `cached_trend_data_${isTurkeyFilterActive ? 'tr' : 'all'}`;

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("API yanıt vermedi");
        
        const data = await response.json();
        const now = new Date().toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US');
        
        // Cache successful response
        localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: now }));
        
        processAndSetData(data, now);
        setOfflineNotice(null);
      } catch (error) {
        console.warn("API Veri çekme hatası, önbellekten yükleniyor:", error);
        
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          processAndSetData(parsed.data, parsed.timestamp);
          setOfflineNotice(
            lang === 'tr'
              ? "İnternet bağlantısı kesildi veya API yanıt vermedi. Sistem son başarılı verilerle (Önbellek) görüntüleniyor."
              : "Network connection lost or API unreachable. Displaying cached data."
          );
          setHasError(false);
        } else {
          setHasError(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isTurkeyFilterActive, lang]);

  const processAndSetData = (data: any, timestamp: string) => {
    const results = data.results || [];
    setLastUpdated(timestamp);

    // KPI 1 & 2 & 3
    const totalCitations = results.reduce((sum: number, work: any) => sum + (work.cited_by_count || 0), 0);
    const avgCitations = results.length > 0 ? (totalCitations / results.length).toFixed(1) : 0;
    const uniqueAuthors = new Set();
    results.forEach((w: any) => w.authorships?.forEach((a: any) => uniqueAuthors.add(a.author.id)));
    setKpiData({ total: data.meta?.count || results.length, citations: Number(avgCitations), researchers: uniqueAuthors.size });

    // Trend Data
    const yearCounts: Record<string, number> = {};
    results.forEach((w: any) => {
      const year = w.publication_year;
      if (year) yearCounts[year] = (yearCounts[year] || 0) + 1;
    });
    const formattedTrend = Object.keys(yearCounts).sort().map(year => ({
      year, count: yearCounts[year]
    }));
    setTrendData(formattedTrend);

    // Network Graph Data
    const nodes: any[] = [];
    const links: any[] = [];
    const conceptMap = new Map();

    results.forEach((w: any) => {
      const topConcepts = w.concepts?.slice(0, 3) || [];
      topConcepts.forEach((c: any) => {
        if (!conceptMap.has(c.id)) {
          conceptMap.set(c.id, { id: c.id, name: c.display_name, val: 1 });
          nodes.push(conceptMap.get(c.id));
        } else {
          conceptMap.get(c.id).val += 0.5;
        }
      });
      if (topConcepts.length > 1) {
        links.push({ source: topConcepts[0].id, target: topConcepts[1].id });
      }
    });
    setNetworkData({ nodes, links });

    // Table Data
    const table = results.map((w: any) => ({
      id: w.id,
      title: w.title || 'İsimsiz Yayın',
      year: w.publication_year || 0,
      citations: w.cited_by_count || 0
    }));
    setTableData(table);
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedData = [...tableData].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setTableData(sortedData);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans transition-colors duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b-2 border-slate-200 pb-6 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Network className="text-indigo-600" size={36} />
            {t[lang].title}
          </h1>
          <p className="text-slate-500 mt-2 text-lg">{t[lang].desc}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={handleLangToggle}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-full shadow-md transition-all active:scale-95 focus:ring-2 focus:ring-indigo-400"
            aria-label="Dil Değiştir"
          >
            <Globe size={18} />
            {lang === 'tr' ? 'EN' : 'TR'}
          </button>
        </div>
      </div>

      {/* Timestamp & Data Source Bar */}
      <div className="mb-6 flex flex-wrap justify-between items-center bg-indigo-50 border border-indigo-100 px-4 py-2.5 rounded-xl text-xs sm:text-sm text-indigo-900 gap-2">
        <div className="flex items-center gap-2">
          <RefreshCw size={15} className="text-indigo-600 animate-spin-slow" />
          <span><strong>{t[lang].lastUpdate}:</strong> {lastUpdated || '—'}</span>
        </div>
        <a 
          href="https://openalex.org" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 font-medium text-indigo-700 hover:underline"
        >
          <Database size={15} />
          {t[lang].dataSource}
        </a>
      </div>

      {/* Filter Control Bar */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-lg"><Filter size={20} className="text-indigo-700"/></div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div className="relative flex items-center">
              <input 
                type="checkbox" 
                checked={isTurkeyFilterActive}
                onChange={(e) => setIsTurkeyFilterActive(e.target.checked)}
                className="peer h-6 w-10 cursor-pointer appearance-none rounded-full bg-slate-300 transition-colors checked:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <div className="pointer-events-none absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-4"></div>
            </div>
            <span className="text-slate-700 font-medium">{t[lang].trFilter}</span>
          </label>
        </div>

        <button 
          onClick={scrollToTable}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold text-sm bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors"
        >
          <FileText size={16} />
          {t[lang].viewAsTable}
        </button>
      </div>

      {/* Offline / Cache Notice */}
      {offlineNotice && (
        <div className="mb-8 bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm">
          <AlertTriangle size={22} className="text-amber-600 flex-shrink-0" />
          <p className="font-medium text-sm">{offlineNotice}</p>
        </div>
      )}

      {/* API Error Box */}
      {hasError && (
        <div className="mb-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
          <AlertTriangle size={24} className="flex-shrink-0" />
          <p className="font-semibold">{t[lang].error}</p>
        </div>
      )}

      {/* KPI Cards (With Skeleton Support) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5">
          <div className="bg-sky-100 p-4 rounded-xl"><BookOpen className="text-sky-600" size={32} /></div>
          <div>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{t[lang].kpi1}</p>
            {isLoading ? (
              <div className="h-8 w-24 bg-slate-200 animate-pulse rounded mt-2"></div>
            ) : (
              <p className="text-3xl font-bold text-slate-800 mt-1">{kpiData.total.toLocaleString()}</p>
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5">
          <div className="bg-emerald-100 p-4 rounded-xl"><TrendingUp className="text-emerald-600" size={32} /></div>
          <div>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{t[lang].kpi2}</p>
            {isLoading ? (
              <div className="h-8 w-24 bg-slate-200 animate-pulse rounded mt-2"></div>
            ) : (
              <p className="text-3xl font-bold text-slate-800 mt-1">{kpiData.citations}</p>
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5">
          <div className="bg-rose-100 p-4 rounded-xl"><Users className="text-rose-600" size={32} /></div>
          <div>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{t[lang].kpi3}</p>
            {isLoading ? (
              <div className="h-8 w-24 bg-slate-200 animate-pulse rounded mt-2"></div>
            ) : (
              <p className="text-3xl font-bold text-slate-800 mt-1">{kpiData.researchers}</p>
            )}
          </div>
        </div>
      </div>

      {/* Main & Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Network Graph Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h2 className="text-xl font-bold text-slate-800 mb-2">{t[lang].networkTitle}</h2>
          <p className="text-xs text-slate-500 mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-100">{t[lang].networkSummary}</p>
          <div className="flex-1 min-h-[350px] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden cursor-move flex items-center justify-center">
            {isLoading ? (
              <p className="text-slate-400 font-medium">{t[lang].loading}</p>
            ) : networkData.nodes.length > 0 ? (
              <ForceGraph2D
                graphData={networkData}
                nodeAutoColorBy="group"
                nodeLabel="name"
                width={500}
                height={350}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.01}
              />
            ) : (
              <p className="text-slate-400">{t[lang].empty}</p>
            )}
          </div>
        </div>
        
        {/* Trend Line Chart Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h2 className="text-xl font-bold text-slate-800 mb-2">{t[lang].trendTitle}</h2>
          <p className="text-xs text-slate-500 mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-100">{t[lang].trendSummary}</p>
          <div className="flex-1 min-h-[350px] bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-center">
            {isLoading ? (
              <p className="text-slate-400 font-medium">{t[lang].loading}</p>
            ) : trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="year" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400">{t[lang].empty}</p>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Publication Table */}
      <div id="publication-table" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <h2 className="text-xl font-bold text-slate-800 mb-6">{t[lang].tableTitle}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b-2 border-slate-200">
              <tr>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('title')}>
                  <div className="flex items-center gap-2">{t[lang].thTitle} <ArrowUpDown size={14} /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('year')}>
                  <div className="flex items-center gap-2">{t[lang].thYear} <ArrowUpDown size={14} /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('citations')}>
                  <div className="flex items-center gap-2">{t[lang].thCitations} <ArrowUpDown size={14} /></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">{t[lang].loading}</td></tr>
              ) : tableData.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">{t[lang].empty}</td></tr>
              ) : (
                tableData.slice(0, 10).map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{row.title}</td>
                    <td className="px-6 py-4">{row.year}</td>
                    <td className="px-6 py-4 font-semibold text-indigo-600">{row.citations}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2 border-t border-slate-200 pt-6">
        <Code size={16} />
        {t[lang].designer}
      </div>
    </div>
  );
}