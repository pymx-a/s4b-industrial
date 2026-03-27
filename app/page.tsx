'use client';

import { useState } from 'react';

interface S4BResponse {
  listStock?: {
    headers: string[];
    rows: string[][];
  };
  error?: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<S4BResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/search?sr=${encodeURIComponent(query)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch results');
      }
      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-4 md:p-12 font-[family-name:var(--font-geist-sans)] selection:bg-blue-500/20">
      <main className="max-w-6xl mx-auto space-y-16">
        <header className="space-y-3">
          <h1 className="text-3xl font-medium tracking-tight text-white flex items-center gap-3">
            <span className="w-1 h-8 bg-blue-600 rounded-full"></span>
            S4B Search
          </h1>
          <p className="text-neutral-500 text-sm max-w-xl leading-relaxed">
            Real-time industrial electronics database. Direct s4b.ru integration.
          </p>
        </header>

        <section className="space-y-8">
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter part number..."
              className="flex-1 bg-neutral-900/50 border border-neutral-800 rounded-xl px-5 py-3.5 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-neutral-600 text-base"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-white text-black hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Search'
              )}
            </button>
          </form>
        </section>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl flex items-center gap-4 animate-in slide-in-from-left-4">
            <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
        )}

        <section className="space-y-6">
          {results?.listStock ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs tracking-tight">
                <span className="text-neutral-500">
                  <span className="text-neutral-300 font-medium">{results.listStock.rows.length}</span> entries found
                </span>
                <button
                  onClick={() => {
                    if (!results?.listStock) return;
                    const headers = results.listStock.headers.join(';');
                    const rows = results.listStock.rows.map(row => row.join(';')).join('\n');
                    const csvContent = "\uFEFF" + headers + '\n' + rows;
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', `s4b_search_${query || 'results'}.csv`);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="flex items-center gap-1.5 text-neutral-500 hover:text-white transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export
                </button>
              </div>
              <div className="border-t border-neutral-800">
                <table className="w-full text-left border-collapse table-auto">
                  <thead>
                    <tr className="border-b border-neutral-900">
                      {results.listStock.headers.map((header, idx) => {
                        const h = header.toLowerCase();
                        const isTechnical = ['id', 'своб', 'тран'].includes(h);
                        
                        return (
                          <th 
                            key={idx} 
                            className={`fluid-padding fluid-table-header font-medium text-neutral-600 uppercase tracking-wider
                              ${isTechnical ? 'hidden 2xl:table-cell' : ''}`}
                          >
                            {header}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900">
                    {results.listStock.rows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-neutral-900/30 transition-colors">
                        {row.map((cell, cellIdx) => {
                          const h = results.listStock!.headers[cellIdx].toLowerCase();
                          const isTechnical = ['id', 'своб', 'тран'].includes(h);

                          return (
                            <td 
                              key={cellIdx} 
                              className={`fluid-padding fluid-table-text text-neutral-400 group-hover:text-white
                                ${isTechnical ? 'hidden 2xl:table-cell' : ''}
                                ${h === 'наименование' ? 'whitespace-normal min-w-[200px]' : 'whitespace-nowrap'}`}
                            >
                              {h === 'цена' && cell?.startsWith('~') ? (
                                <span className="text-blue-500 tabular-nums">{cell}</span>
                              ) : h === 'есть' && (parseInt(cell) > 0) ? (
                                <span className="text-neutral-200 tabular-nums">{cell}</span>
                              ) : (
                                cell
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : !loading && (
            <div className="text-center py-32 border-t border-neutral-900">
              <p className="text-neutral-600 text-sm tracking-tight">No active search results</p>
            </div>
          )}
        </section>
      </main>

      <footer className="max-w-6xl mx-auto mt-32 pb-12 border-t border-neutral-900 pt-8 flex justify-between items-center text-[10px] text-neutral-700 uppercase tracking-widest font-medium">
        <p>&copy; 2026 S4B Intel</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-neutral-400 transition-colors">Terms</a>
          <a href="#" className="hover:text-neutral-400 transition-colors">API</a>
        </div>
      </footer>
    </div>
  );
}
