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
  const [sortConfig, setSortConfig] = useState<{ key: number; direction: 'asc' | 'desc' } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setError(null);
    setSortConfig(null);

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

  const parsePrice = (val: string) => {
    if (!val) return 0;
    const clean = val.replace(/[^\d.]/g, '');
    return parseFloat(clean) || 0;
  };

  const sortedRows = results?.listStock?.rows ? [...results.listStock.rows].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    const header = results.listStock!.headers[sortConfig.key].toLowerCase();
    
    const isNumeric = ['есть', 'цена', 'цена руб'].includes(header);
    
    if (isNumeric) {
      const aNum = parsePrice(aVal);
      const bNum = parsePrice(bVal);
      return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
    }
    
    return sortConfig.direction === 'asc' 
      ? aVal.localeCompare(bVal)
      : bVal.localeCompare(aVal);
  }) : [];

  const requestSort = (index: number) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === index && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: index, direction });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)] text-[var(--text-1)] p-4 md:p-10 font-[family-name:var(--font-geist-sans)] selection:bg-blue-500/20">
      <main className="max-w-7xl mx-auto space-y-10">
        <header className="flex items-baseline gap-4 border-b border-[var(--border-s)] pb-6">
          <h1 className="text-xl font-semibold tracking-tight text-[var(--text-0)] flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
            S4B
          </h1>
        </header>

        <section className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2 w-full max-w-2xl">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="PN, Brand or Description..."
                className="flex-1 bg-[var(--bg-1)] border border-[var(--border-s)] rounded-lg px-4 py-2.5 outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10 transition-all placeholder:text-[var(--text-2)] text-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[var(--bg-2)] border border-[var(--border-m)] text-[var(--text-0)] hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-50 px-6 py-2.5 rounded-lg text-[11px] font-bold tracking-widest uppercase transition-all flex items-center justify-center min-w-[100px]"
              >
                {loading ? '...' : 'Search'}
              </button>
            </form>

            {results?.listStock && (
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-bold text-[var(--text-2)] uppercase tracking-[0.15em]">
                  <span className="text-[var(--text-0)]">{results.listStock.rows.length}</span> results
                </span>
                <button
                  onClick={() => {
                    const sanitizeCSV = (val: string) => {
                      if (!val) return '""';
                      // Escaping leading special characters for Excel safety
                      const escaped = val.replace(/^([=\+\-\@])/, "'$1");
                      // Doubling quotes and wrapping in quotes
                      return `"${escaped.replace(/"/g, '""')}"`;
                    };
                    const headers = results.listStock!.headers.map(sanitizeCSV).join(';');
                    const rows = sortedRows.map(row => row.map(sanitizeCSV).join(';')).join('\n');
                    const csvContent = "\uFEFF" + headers + '\n' + rows;
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', `s4b_${query.replace(/[^\w\s-]/gi, '_') || 'export'}.csv`);
                    link.click();
                  }}
                  className="flex items-center gap-2 text-[var(--text-2)] hover:text-[var(--text-0)] transition-colors text-[10px] font-bold uppercase tracking-[0.15em] border border-[var(--border-s)] px-3 py-2 rounded-lg hover:bg-[var(--bg-1)]"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-500/5 border border-red-500/10 text-red-400 p-4 rounded-lg text-xs font-medium flex items-center gap-3">
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <div className="relative border border-[var(--border-s)] rounded-xl overflow-hidden bg-[var(--bg-1)]">
            {results?.listStock ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-auto">
                  <thead>
                    <tr className="bg-[var(--bg-2)] border-b border-[var(--border-m)]">
                      {results.listStock.headers.map((header, idx) => {
                        const h = header.toLowerCase();
                        const isTechnical = ['id', 'своб', 'тран'].includes(h);
                        const isNumeric = ['есть', 'цена', 'цена руб'].includes(h);
                        const isSorted = sortConfig?.key === idx;
                        
                        return (
                          <th 
                            key={idx}
                            onClick={() => requestSort(idx)}
                            className={`fluid-padding fluid-table-header font-bold text-[var(--text-2)] uppercase tracking-widest cursor-pointer hover:text-[var(--text-0)] transition-colors
                              ${isTechnical ? 'hidden 2xl:table-cell' : ''}
                              ${isNumeric ? 'text-right' : ''}`}
                          >
                            <div className={`flex items-center gap-1.5 ${isNumeric ? 'justify-end' : ''}`}>
                              {header}
                              {isSorted && (
                                <svg className={`w-2.5 h-2.5 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                                </svg>
                              )}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-s)]">
                    {sortedRows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="transition-colors">
                        {row.map((cell, cellIdx) => {
                          const h = results.listStock!.headers[cellIdx].toLowerCase();
                          const isTechnical = ['id', 'своб', 'тран'].includes(h);
                          const isNumeric = ['есть', 'цена', 'цена руб'].includes(h);
                          const isName = h === 'наименование';

                          return (
                            <td 
                              key={cellIdx} 
                              className={`fluid-padding fluid-table-text text-[var(--text-1)] 
                                ${isTechnical ? 'hidden 2xl:table-cell' : ''}
                                ${isNumeric ? 'text-right tnum font-medium' : ''}
                                ${isName ? 'text-[var(--text-0)] line-clamp-2 max-w-[420px]' : ''}`}
                            >
                              {h === 'цена' && cell?.startsWith('~') ? (
                                <span className="text-blue-400/80">{cell}</span>
                              ) : isNumeric && (parseInt(cell) > 0) ? (
                                <span className="text-[var(--text-0)]">{cell}</span>
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
            ) : !loading && (
              <div className="py-40 text-center border-t border-[var(--border-s)]">
                <p className="text-[var(--text-2)] text-[10px] font-bold uppercase tracking-[0.3em]">System idle / Awaiting Query</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto mt-20 pb-10 border-t border-[var(--border-s)] pt-8 flex justify-between items-center text-[10px] text-[var(--text-2)] uppercase tracking-widest font-black opacity-30">
        <p>&copy; 2026</p>
      </footer>
    </div>
  );
}
