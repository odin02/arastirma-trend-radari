export default async function Home() {
  // 1. API'den veriyi çekiyoruz (OpenAlex garsonuna sipariş veriyoruz)
  // OpenAlex API'si ücretsiz ve anahtarsızdır, doğrudan veri isteyebiliriz.
  const res = await fetch('https://api.openalex.org/works?search=artificial+intelligence');
  
  // Gelen veriyi (yemeği) JavaScript'in okuyabileceği JSON formatına çeviriyoruz
  const data = await res.json(); 

  // 2. Arayüzü oluşturuyoruz
  return (
    <main className="p-10 font-sans text-gray-800">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">
        Araştırma Trend Radarı
      </h1>
      
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">
          API Bağlantı Testi (OpenAlex)
        </h2>
        
        <p className="text-lg">
          Sistemde şu an <strong>{data.meta.count.toLocaleString('tr-TR')}</strong> adet "Artificial Intelligence" (Yapay Zeka) konulu akademik eser tespit edildi.
        </p>
        
        <p className="text-sm text-gray-500 mt-6">
          Son Güncelleme: {new Date().toLocaleString('tr-TR')}
        </p>
      </div>
    </main>
  );
}