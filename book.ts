type="text/babel">
        const { useState, useEffect } = React;

        const BookSearchInterface = () => {
            const [darkMode, setDarkMode] = useState(false);
            const [searchQuery, setSearchQuery] = useState('');
            const [selectedBook, setSelectedBook] = useState(null);
            const [loading, setLoading] = useState(false);
            const [apiBooks, setApiBooks] = useState([]);
            const [searchType, setSearchType] = useState('book');
            const [apiStatus, setApiStatus] = useState('ready');

        
                demographics: {
                    Child: 14, Teenager: 78, Adults: 4, Seniors: 2
                },
                regionalPopularity: [
                    { country: 'India', popularity: 90, readers: 2150000 },
                    { country: 'Korea', popularity: 65, readers: 600000 },
                    { country: 'Germany', popularity: 64, readers: 580000 }
                ],
                emotionalImpact: [
                    { emotion: 'Love', value: 85 },
                    { emotion: 'Suspense', value: 72 },
                    { emotion: 'Nostalgia', value: 91 },
                    { emotion: 'Anger', value: 60 }
                ],
                seasonalTrends: [
                    { month: 'Jan', popularity: 56, sales: 45000 },
                    { month: 'Feb', popularity: 55, sales: 52000 },
                    { month: 'Mar', popularity: 42, sales: 58000 },
                    { month: 'Apr', popularity: 39, sales: 61000 },
                    { month: 'May', popularity: 44, sales: 67000 },
                    { month: 'Jun', popularity: 59, sales: 63000 },
                    { month: 'Jul', popularity: 58.5,sales:72000 },
                    { month: 'Aug', popularity: 66, sales: 68000 },
                    { month: 'Sep', popularity: 45, sales: 64000 },
                    { month: 'Oct', popularity: 34, sales: 60000 },
                    { month: 'Nov', popularity: 21, sales: 71000 },
                    { month: 'Dec', popularity: 47, sales: 75000 }
                ]
            };

            const genres = ['all', 'fantasy', 'science fiction', 'romance', 'thriller', 'mystery', 'biography', 'history', 'poetry', 'drama'];

           // Fetching data from API
            const fetchFromOpenLibrary = async (query= 'book') => {
                console.log('Starting search:', query);
                setLoading(true);
                setApiStatus(waiting);
                setSearchResults([]);
                
                try {
                    let url = " ";
                    
                    console.log('Fetching from:', url);
                    
                    const response = await fetch(url);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    
                    const data = await response.json();
                    console.log('API Response:', data);
                    
                    const docs = (data && data.docs) ? data.docs : [];
                    let processedDocs = docs;
                    if (searchType === 'plot') {
                        const keywords = query.toLowerCase().split(/\s+/).filter(Boolean);
                        processedDocs = docs.filter(d => {
                            const haystack = [
                                ...(d.first_sentence ? (Array.isArray(d.first_sentence) ? d.first_sentence : [d.first_sentence]) : []),
                                ...(d.subtitle ? [d.subtitle] : []),
                                ...(d.subject ? d.subject : [])
                            ].map(s => s.toLowerCase());
                            return keywords.some(k => haystack.includes(k));
                        });
                        if (processedDocs.length === 0) {
                            processedDocs = docs;
                        }
                    }
                    
                    if (processedDocs && processedDocs.length > 0) {
                        const books = processedDocs.map((book, index) => {
                            const firstSentence = Array.isArray(book.first_sentence) ? book.first_sentence[0] : book.first_sentence;
                            const subtitle = book.subtitle;
                            let plotSnippet = '';
                            if (firstSentence) plotSnippet = String(firstSentence);
                            else if (subtitle) plotSnippet = String(subtitle);
                            else if (book.subject && book.subject.length > 0) plotSnippet = `Subjects: ${book.subject.slice(0,3).join(', ')}`;
                            return {
                                id: book.key || `${searchType}-${index}`,
                                title: book.title || 'Untitled',
                                author: (book.author_name && book.author_name[0]) || (searchType === 'author' ? query : 'Unknown Author'),
                                year: book.first_publish_year || 'N/A',
                                isbn: (book.isbn && book.isbn[0]) || '',
                                coverEditionKey: book.cover_edition_key || null,
                                publisher: (book.publisher && book.publisher[0]) || 'Unknown',
                                key: book.key,
                                searchType: searchType,
                                plotSnippet: plotSnippet
                            };
                        });
                        
                        console.log('Processed books:', books);
                        setSearchResults(books);
                        setApiBooks(books);
                        setApiStatus('success');
                    } else {
                        throw new Error('No books found');
                    }
                    
                } catch (error) {
                    console.error('Search error:', error);
                    setSearchResults([]);
                    setApiStatus('error');
                    
                    alert('Failed to fetch from API. Using mock data instead.');                        
                }
                
                setLoading(false);
            };

            const handleSearch = async () => {
                const query = searchQuery.trim();
                if (!query) {
                    alert('Kindly enter your search query.');
                    return;
                }                
                try {
                    await fetchFromOpenLibrary(query, searchType);
                } catch (error) {
                    console.log('API failed, using mock data:', error);
                    const mockBooks = generateMockBooks(query, searchType);
                    setSearchResults(mockBooks);
                    setApiBooks(mockBooks);
                    setApiStatus('mock');
                    setLoading(false);
                }
            };

            useEffect(() => {
                setTimeout(() => {
                    handleSearch();
                }, 1000);
            }, []);

            // Generate mock books data
            const generateMockBooks = (query, searchType) => {
                const mockTitles = [
                    'The Great Adventure', 'Mystery of the Night', 'Beyond the Horizon', 
                    'The Last Chapter', 'Echoes of Time', 'Whispers in the Wind',
                    'The Hidden Truth', 'Shadows of Yesterday', 'Tomorrow\'s Promise'
                ];
                
                const mockAuthors = [
                    'Jane Smith', 'Michael Johnson', 'Sarah Williams', 'David Brown',
                    'Emily Davis', 'Robert Wilson', 'Lisa Anderson', 'James Taylor'
                ];
                
                const mockSubjects = [
                    'Fiction', 'Adventure', 'Mystery', 'Romance', 'Science Fiction',
                    'Fantasy', 'Historical Fiction', 'Contemporary Literature'
                ];
                
                return Array.from({ length: 8 }, (_, index) => ({
                    id: `mock-${index}`,
                    title: mockTitles[index % mockTitles.length],
                    author: searchType === 'author' ? query : mockAuthors[index % mockAuthors.length],
                    year: Math.floor(Math.random() * 50) + 1970,
                    isbn: `978-${Math.floor(Math.random() * 90000) + 10000}`,
                    coverId: null,
                    subjects: [mockSubjects[index % mockSubjects.length]],
                    pages: Math.floor(Math.random() * 400) + 200,
                    publisher: 'Mock Publisher',
                    key: `mock-key-${index}`,
                    rating: (3 + Math.random() * 2).toFixed(1),
                    searchType: searchType
                }));
            };

            const handleFileUpload = (event) => {
                const file = event.target.files[0];
                if (file) {
                    setUploadedFile(file);
                    const recommendations = ['The Hobbit', 'Dune', 'The Catcher in the Rye', 'Pride and Prejudice', 'The Great Gatsby'];
                    alert(`File uploaded: ${file.name}\n ✨ Recommended similar books: ${recommendations.join(', ')}`);
                }
            };

            const exportToPDF = () => {
                alert('Generating comprehensive PDF report with all the analytics...');
            };

            const exportToCSV = () => {
                alert('Exporting detailed data to CSV format...');
            };

            const getCoverUrl = (coverId, editionKey, coverEditionKey) => {
                if (coverId) return `API KEY'
                if (coverEditionKey) return `API KEY'
                if (editionKey) return `API KEY'
                return null;
            };

            // Chart colors
            const COLORS = ['#667eea', '#4f435bff', '#f093fb', '#f5574c', '#4facfe', '#43e97b', '#fa709a', '#ffecd2'];

            return (
                <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
                

                    {/* Header */}
                    <header className={`glassmorphism shadow-2xl sticky top-0 z-50`}>
                        <div className="max-w-7xl mx-auto px-4 py-6">
                            <div className="flex justify-between items-center">
                                        <div className="h-10 w-10 text-blue-600 animate-pulse">📚</div>
                                        <div className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 animate-ping">✨</div>
                                    </div>
                                    <div>
                                        <h1 className={`text-3xl font-bold bg-gradient-to-r ${darkMode ? 'from-green-400 to-white' : 'from-blue-600 to-purple-600'} bg-clip-text text-transparent`}>
                                            ReadAlyze
                                        </h1>
                                        <p className="text-sm opacity-70">Discover • Analyze • Explore</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2 text-sm">
                                        <span>👁️</span>
                                        <span>{apiBooks.length} books Analyzed</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm">
                                        <div className={`w-2 h-2 rounded-full ${
                                            apiStatus === 'ready' ? 'bg-gray-400' :
                                            apiStatus === 'loading' ? 'bg-yellow-400 animate-pulse' :
                                            apiStatus === 'success' ? 'bg-green-400' :
                                            apiStatus === 'error' ? 'bg-red-400' :
                                            apiStatus === 'mock' ? 'bg-orange-400' : 'bg-gray-400'
                                        }`}></div>
                                        <span className={`text-xs ${
                                            apiStatus === 'ready' ? 'text-gray-400' :
                                            apiStatus === 'loading' ? 'text-yellow-600' :
                                            apiStatus === 'success' ? 'text-green-600' :
                                            apiStatus === 'error' ? 'text-red-600' :
                                            apiStatus === 'mock' ? 'text-orange-600' : 'text-gray-400'
                                        }`}>
                                            {apiStatus === 'ready' ? 'Ready' :
                                             apiStatus === 'loading' ? 'Loading...' :
                                             apiStatus === 'success' ? 'API Connected' :
                                             apiStatus === 'error' ? 'API Error' :
                                             apiStatus === 'mock' ? 'Demo Mode' : 'Ready'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
                        {/* Enhanced Search Section */}
                        <div className={`glassmorphism rounded-3xl shadow-2xl p-8 mb-8 transform hover:scale-[1.01] transition-all duration-300`}>
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold mb-2">Discover Your Next Great Read</h2>
                                <p className="opacity-70">Powered with some AI-enhanced analytics</p>
                                <div className="mt-4 flex items-center justify-center space-x-4">
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        apiStatus === 'ready' ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-green-300' :
                                        apiStatus === 'loading' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
                                        apiStatus === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                                        apiStatus === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                                        apiStatus === 'mock' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {apiStatus === 'ready' ? '🔄 Ready' :
                                         apiStatus === 'loading' ? '⏳ Loading...' :
                                         apiStatus === 'success' ? '✅ API Connected' :
                                         apiStatus === 'error' ? '❌ API Error' :
                                         apiStatus === 'mock' ? '🎭 Demo Mode' : '🔄 Ready'}
                                    </div>
                                    {apiBooks.length > 0 && (
                                        <div className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-green-300 rounded-full text-xs font-medium">
                                            📚 {apiBooks.length} books found
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                                <div className="relative col-span-2">
                                    <span className={`absolute left-4 top-4 h-5 w-5 ${darkMode ? 'text-green-400' : 'text-gray-400'}`}>🔍</span>
                                    <input
                                        type="text"
                                        placeholder="Search books, authors, or topics..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-300 focus:scale-105 ${
                                            darkMode 
                                                ? 'bg-gray-600/70 border-green-500/50 text-white placeholder-green-200 focus:border-green-400' 
                                                : 'bg-white/70 border-gray-200 focus:border-purple-400'
                                        } focus:outline-none focus:ring-4 focus:ring-purple-400/20`}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSearch();

                                        }}
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className={`absolute right-4 top-4 h-5 w-5 ${darkMode ? 'text-green-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                                        📚 Books
                                    </button>
                                    <button
                                        onClick={() => setSearchType('author')}
                                        className={`flex-1 px-3 py-3 rounded-xl transition-all duration-300 text-sm font-medium ${
                                            searchType === 'author' 
                                                ? darkMode 
                                                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                                                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                                : darkMode ? 'text-green-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        ✍️ Authors
                                    </button>
                                    <button
                                        onClick={() => setSearchType('plot')}
                                        className={`flex-1 px-3 py-3 rounded-xl transition-all duration-300 text-sm font-medium ${
                                            searchType === 'plot' 
                                                ? darkMode 
                                                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                                                    : 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg'
                                                : darkMode ? 'text-green-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        🧩 Plot
                                    </button>
                                </div>
                                
                                <select
                                    value={selectedGenre}
                                    onChange={(e) => setSelectedGenre(e.target.value)}
                                    className={`px-4 py-4 rounded-2xl border-2 transition-all duration-300 ${
                                        darkMode 
                                            ? 'bg-gray-600/70 border-green-500/50 text-white focus:border-green-400' 
                                            : 'bg-white/70 border-gray-200 focus:border-purple-400'
                                    } focus:outline-none focus:ring-4 focus:ring-purple-400/20`}
                                >
                                    {genres.map(genre => (
                                        <option key={genre} value={genre} className={darkMode ? 'bg-gray-700 text-white' : ''}>
                                            {genre === 'all' ? '🔍 All Genres' : `📚 ${genre.charAt(0).toUpperCase() + genre.slice(1)}`}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleSearch}
                                    
                                    <div className="flex items-center justify-center space-x-2">
                                        <span>🔍</span>
                                        <span>Search</span>
                                    </div>
                                </button>
                            </div>

                            {/* Search suggestions */}
                            <div className="mb-6">
                                <p className={`text-sm mb-2 ${darkMode ? 'text-green-400' : 'text-gray-500'}`}>💡 Some Suggestions</p>
                                <div className="flex flex-wrap gap-2">
                                    {['Harry Potter', 'Jane Austen', 'Stephen King', 'Science Fiction', 'Mystery'].map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => {
                                                setSearchQuery(suggestion);
                                                setTimeout(() => handleSearch(), 100);
                                            }}
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* File Upload */}
                            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-6">
                                <label className={`flex-1 flex items-center justify-center space-x-3 cursor-pointer px-6 py-4 rounded-2xl border-2 border-dashed transition-all duration-300 hover:scale-105 ($
                                    darkMode 
                                        ? 'border-green-500/50 hover:border-green-400 bg-gray-600/30' 
                                        : 'border-gray-300 hover:border-purple-400 bg-white/30'
                                }`}>
                                    <span>📤</span>
                                    <span className="font-medium">Upload Book for AI Recommendations</span>
                                    <span className="text-yellow-400 animate-pulse">✨</span>
                                    <input
                                        type="file"
                                        accept=".pdf,.epub,.txt"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                </label>
                                {uploadedFile && (
                                    <div className="flex items-center space-x-2 text-green-500 font-medium">
                                        <span className="animate-pulse">❤️</span>
                                        <span>✨ {uploadedFile.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && !loading && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                <div className={`glassmorphism rounded-3xl shadow-2xl p-6`}>
                                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                                        <div className={`${darkMode ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-purple-500 to-blue-500'} rounded-2xl p-3 mr-3`}>
                                            <span className="text-white">📚</span>
                                        </div>
                                        Search Results
                                        <span className={`ml-auto text-sm ${darkMode ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-purple-500 to-pink-500'} text-white px-3 py-1 rounded-full`}>
                                            {searchResults.length} found
                                        </span>
                                    </h2>
                                        {searchResults.map((book, index) => (
                                            <div
                                                key={index}
                                                onClick={() => setSelectedBook(book)}
                                                className={`group p-5 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl ${
                                                    selectedBook?.title === book.title
                                                        ? darkMode 
                                                            ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 border-2 border-green-400'
                                                            : 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-2 border-purple-400'
                                                        : darkMode ? 'bg-gray-600/50 hover:bg-gray-500/50' : 'bg-white/50 hover:bg-white/70'
                                                }`}
                                            >
                                                <div className="flex space-x-4">
                                                    { (book.coverId || book.coverEditionKey || book.editionKey) && (
                                                        <img
                                                            src={getCoverUrl(book.coverId, book.editionKey, book.coverEditionKey)}
                                                            alt={book.title}
                                                            className="w-16 h-20 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300"
                                                            onError={(e) => e.target.style.display = 'none'}
                                                        />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className={`font-bold text-lg truncate ${darkMode ? 'group-hover:text-green-400' : 'group-hover:text-purple-600'} transition-colors duration-300`}>
                                                            {book.title}
                                                        </h3>
                                                        <p className="text-sm opacity-75 mb-2">by {book.author}</p>
                                                        <div className="flex flex-wrap gap-2 mb-2">
                                                            {book.subjects?.slice(0, 2).map((subject, idx) => (
                                                                <span key={idx} className={`text-xs px-2 py-1 ${darkMode ? 'bg-green-800/50 text-green-300' : 'bg-purple-100 text-purple-600'} rounded-full`}>
                                                                    {subject}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-4 text-sm">
                                                                <span className="flex items-center">
                                                                    <span className="mr-1">📅</span>
                                                                    {book.year}
                                                                </span>
                                                                <span className="flex items-center text-yellow-500">
                                                                    <span className="mr-1">⭐</span>
                                                                    {book.rating}/5
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <div className={`text-xs ${darkMode ? 'text-green-400' : 'text-purple-600'} font-medium`}>
                                                                    {book.popularity}% popular
                                                                </div>
                                                                {book.searchType && (
                                                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                                                        book.searchType === 'author' 
                                                                            ? darkMode 
                                                                                ? 'bg-green-800/50 text-green-300'
                                                                                : 'bg-pink-100 text-pink-600'
                                                                            : book.searchType === 'plot' 
                                                                                ? (darkMode ? 'bg-green-800/50 text-green-300' : 'bg-indigo-100 text-indigo-600')
                                                                                : darkMode 
                                                                                ? 'bg-green-800/50 text-green-300'
                                                                                : 'bg-blue-100 text-blue-600'
                                                                    }`}>
                                                                        {book.searchType === 'author' ? '✍️ Author' : book.searchType === 'plot' ? '🧩 Plot' : '📚 Book'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Export Options */}
                                <div className={`glassmorphism rounded-3xl shadow-2xl p-6`}>
                                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                                        <div className={`${darkMode ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-green-500 to-teal-500'} rounded-2xl p-3 mr-3`}>
                                            <span className="text-white">📥</span>
                                        </div>
                                        Export Analytics
                                    </h2>
                                    <div className="space-y-4">
                                        <button
                                            onClick={exportToPDF}
                                            className={`w-full ${darkMode ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'} text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2`}
                                        >
                                            <span>📥</span>
                                            <span>📄 Export Detailed PDF Report</span>
                                        </button>
                                        <button
                                            onClick={exportToCSV}
                                            className={`w-full ${darkMode ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'} text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2`}
                                        >
                                            <span>📊</span>
                                            <span>📊 Export Data as CSV</span>
                                        </button>
                                        <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gray-600/50' : 'bg-gray-100/50'}`}>
                                            <h4 className="font-semibold mb-2">Export includes:</h4>
                                            <ul className="text-sm space-y-1 opacity-75">
                                                <li>• Demographic Analysis</li>
                                                <li>• Regional Popularity Data</li>
                                                <li>• SHAP value explanations</li>
                                                <li>• Reading Patterns & Trends</li>
                                                <li>• Emotional Impact Scores</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Analytics Section */}
                        {(selectedBook || searchMode === 'enhanced') && (
                            <div className="space-y-8">
                                {/* Book Details Card */}
                                {selectedBook && (
                                    <div className={`glassmorphism rounded-3xl shadow-2xl p-8`}>
                                        <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-8">
                                            {(selectedBook.coverId || selectedBook.coverEditionKey || selectedBook.editionKey) && (
                                                <div className="flex-shrink-0">
                                                    <img
                                                        src={getCoverUrl(selectedBook.coverId, selectedBook.editionKey, selectedBook.coverEditionKey)}
                                                        alt={selectedBook.title}
                                                        className="w-48 h-64 object-cover rounded-2xl shadow-2xl mx-auto lg:mx-0"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <h2 className={`text-4xl font-bold mb-2 bg-gradient-to-r ${darkMode ? 'from-green-400 to-white' : 'from-purple-600 to-blue-600'} bg-clip-text text-transparent`}>
                                                    {selectedBook.title}
                                                </h2>
                                                <p className="text-xl opacity-75 mb-6">by {selectedBook.author}</p>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center space-x-3">
                                                            <span className={darkMode ? 'text-green-400' : 'text-purple-500'}>📅</span>
                                                            <span><strong>Published:</strong> {selectedBook.year}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-3">
                                                            <span className="text-yellow-500">⭐</span>
                                                            <span><strong>Rating:</strong> {selectedBook.rating}/5</span>
                                                        </div>
                                                        <div className="flex items-center space-x-3">
                                                            <span className={darkMode ? 'text-green-400' : 'text-blue-500'}>📖</span>
                                                            <span><strong>Pages:</strong> {selectedBook.pages || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center space-x-3">
                                                            <span className="text-green-500">📈</span>
                                                            <span><strong>Popularity:</strong> {selectedBook.popularity}%</span>
                                                        </div>
                                                        <div className="flex items-center space-x-3">
                                                            <span className={darkMode ? 'text-green-400' : 'text-indigo-500'}>👤</span>
                                                            <span><strong>Publisher:</strong> {selectedBook.publisher}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {selectedBook.subjects && selectedBook.subjects.length > 0 && (
                                                    <div className="mt-6">
                                                        <h4 className="font-semibold mb-3">📚 Subjects & Themes:</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedBook.subjects.slice(0, 6).map((subject, idx) => (
                                                                <span key={idx} className={`px-3 py-2 ${darkMode ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 border border-green-600' : 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-600 border border-purple-200'} rounded-full text-sm font-medium`}>
                                                                    {subject}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Analytics Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Demographics */}
                                    <div className={`glassmorphism rounded-3xl shadow-2xl p-6`}>
                                        <h3 className="text-xl font-bold mb-6 flex items-center">
                                            <div className={`${darkMode ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-pink-500 to-rose-500'} rounded-2xl p-2 mr-3`}>
                                                <span className="text-white">👥</span>
                                            </div>
                                            Reader Demographics & Emotional Impact
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="text-center">
                                                <h4 className="font-semibold mb-4">Demographics</h4>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span>Child:</span>
                                                        <span className="font-bold">{enhancedMockData.demographics.Child}%</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Teenager:</span>
                                                        <span className="font-bold">{enhancedMockData.demographics.Teenager}%</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Adults:</span>
                                                        <span className="font-bold">{enhancedMockData.demographics.Adults}%</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Seniors:</span>
                                                        <span className="font-bold">{enhancedMockData.demographics.Seniors}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <h4 className="font-semibold mb-4">Emotional Impact</h4>
                                                <div className="space-y-2">
                                                    {enhancedMockData.emotionalImpact.slice(0, 10).map((emotion, idx) => (
                                                        <div key={idx} className="flex justify-between">
                                                            <span>{emotion.emotion}:</span>
                                                            <span className="font-bold">{emotion.value}%</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Regional Popularity */}
                                    <div className={`glassmorphism rounded-3xl shadow-2xl p-6`}>
                                            </div>
                                            Global Reading Patterns
                                        </h3>
                                        <div className="space-y-3">
                                            {enhancedMockData.regionalPopularity.map((region, idx) => (
                                                <div key={idx} className="flex items-center justify-between">
                                                    <span className="font-medium">{region.country}</span>
                                                    <div className="flex items-center space-x-2">
                                                        <div className={`w-24 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2`}>
                                                            <div 
                                                                className={`${darkMode ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-blue-500 to-purple-500'} h-2 rounded-full`} 
                                                                style={{width: `${region.popularity}%`}}
                                                            ></div>
                                                        </div>
                                                        <span className="text-sm font-bold">{region.popularity}%</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Reading Patterns */}
                                    <div className={`glassmorphism rounded-3xl shadow-2xl p-6`}>
                                        <h3 className="text-xl font-bold mb-6 flex items-center">
                                            <div className={`bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl p-2 mr-3`}>
                                                <span className="text-white">📈</span>
                                            </div>
                                            Daily Reading Patterns
                                        </h3>
                                        <div className="space-y-3">
                                            {enhancedMockData.readingPatterns.map((pattern, idx) => (
                                                <div key={idx} className="flex items-center justify-between">
                                                    <span className="font-medium">{pattern.time}</span>
                                                    <div className="flex items-center space-x-2">
                                                        <div className={`w-24 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2`}>
                                                            <div 
                                                                className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full" 
                                                                style={{width: `${(pattern.readers / 100) * 100}%`}}
                                                            ></div>
                                                        </div>
                                                        <span className="text-sm font-bold">{pattern.readers}%</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Seasonal Trends */}
                                    <div className={`glassmorphism rounded-3xl shadow-2xl p-6`}>
                                        <h3 className="text-xl font-bold mb-6 flex items-center">
                                            </div>
                                            Seasonal Reading Trends
                                        </h3>
                                        <div className="space-y-3">
                                            {enhancedMockData.seasonalTrends.map((trend, idx) => (
                                                <div key={idx} className="flex items-center justify-between">
                                                    <span className="font-medium">{trend.month}</span>
                                                    <div className="flex items-center space-x-2">
                                                        <div className={`w-24 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2`}>
                                                            <div 
                                                                className={`${darkMode ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-orange-500 to-red-500'} h-2 rounded-full`} 
                                                                style={{width: `${trend.popularity}%`}}
                                                            ></div>
                                                        </div>
                                                        <span className="text-sm font-bold">{trend.popularity}%</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <footer className={`mt-12 glassmorphism rounded-3xl shadow-2xl p-8`}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                                <div>
                                    <div className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-purple-600'} mb-2`}>{apiBooks.length || 0}</div>
                                    <div className="text-sm opacity-75">Books Analyzed</div>
                                </div>
                                <div>
                                    <div className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-blue-600'} mb-2`}>10K+</div>
                                    <div className="text-sm opacity-75">Active Readers</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-green-600 mb-2">5K+</div>
                                    <div className="text-sm opacity-75">Books Recommended</div>
                                </div>
                            </div>
                            
                            <div className="mt-6 text-center text-sm opacity-50">
                        </footer>
                    </div>
                </div>
            );
        };


        ReactDOM.render(<BookSearchInterface />, document.getElementById('root'));