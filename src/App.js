import React, { useEffect, useState } from 'react';
import './App.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

function App() {
  const [concerts, setConcerts] = useState([]);
  const [songFreq, setSongFreq] = useState([]);
  const [artistFreq, setArtistFreq] = useState([]);
  const [venueFreq, setVenueFreq] = useState([]);

  const [filterArtist, setFilterArtist] = useState('');
  const [filterVenue, setFilterVenue] = useState('');
  const [filterYear, setFilterYear] = useState('');

  useEffect(() => {
    fetch('/gigs_soundguy28.json')
      .then((res) => res.json())
      .then((data) => {
        // Sort by date (newest first)
        const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
        setConcerts(sorted);
        computeStats(sorted);
      });
  }, []);

  const computeStats = (concerts) => {
    const songMap = {};
    const artistMap = {};
    const venueMap = {};

    concerts.forEach(concert => {
      // Count songs
      concert.songs?.split(',').forEach(song => {
        const trimmed = song.trim();
        if (trimmed) songMap[trimmed] = (songMap[trimmed] || 0) + 1;
      });

      // Count artists
      const artist = concert.artist;
      if (artist) artistMap[artist] = (artistMap[artist] || 0) + 1;

      // Count venues
      const venue = concert.venue;
      if (venue) venueMap[venue] = (venueMap[venue] || 0) + 1;
    });

    // Convert maps to arrays for charts
    const mapToArray = (map) =>
      Object.entries(map)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10

    setSongFreq(mapToArray(songMap));
    setArtistFreq(mapToArray(artistMap));
    setVenueFreq(mapToArray(venueMap));
  };

  const applyFilters = () => {
    return concerts.filter(concert => {
      const matchArtist = !filterArtist || concert.artist === filterArtist;
      const matchVenue = !filterVenue || concert.venue === filterVenue;
      const matchYear = !filterYear || new Date(concert.date).getFullYear().toString() === filterYear;
      return matchArtist && matchVenue && matchYear;
    });
  };
  

  const renderChart = (title, data) => (
    <div className="chart-section">
      <h2>{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ left: 50 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={150} />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#007acc" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="App">
      <h1>🎶 Bryan's Concert Dashboard</h1>

      {renderChart("Most Played Songs", songFreq)}
      {renderChart("Most Seen Artists", artistFreq)}
      {renderChart("Most Visited Venues", venueFreq)}

        <div className="filters">
    <label>
      Artist:
      <select value={filterArtist} onChange={(e) => setFilterArtist(e.target.value)}>
        <option value="">All</option>
        {[...new Set(concerts.map(c => c.artist))].sort().map(artist => (
          <option key={artist} value={artist}>{artist}</option>
        ))}
      </select>
    </label>

    <label>
      Venue:
      <select value={filterVenue} onChange={(e) => setFilterVenue(e.target.value)}>
        <option value="">All</option>
        {[...new Set(concerts.map(c => c.venue))].sort().map(venue => (
          <option key={venue} value={venue}>{venue}</option>
        ))}
      </select>
    </label>

    <label>
      Year:
      <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
        <option value="">All</option>
        {[...new Set(concerts.map(c => new Date(c.date).getFullYear().toString()))]
          .sort((a, b) => b - a)
          .map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
      </select>
    </label>

    <button onClick={() => {
      setFilterArtist('');
      setFilterVenue('');
      setFilterYear('');
    }}>
      Reset Filters
    </button>
  </div>


      <h2>All Concerts (Sorted by Date)</h2>
      <ul className="concert-list">
      {applyFilters().map((concert, index) => (
          <li key={index} className="concert-card">
            <strong>{concert.date}</strong> – {concert.artist} at {concert.venue} ({concert.city})
            <details>
              <summary>Show Setlist</summary>
              <p>{concert.songs}</p>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
