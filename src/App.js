
import React, { useState, useEffect } from "react";
import "./App.css";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, LineChart, Line } from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Select from "react-select";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "leaflet/dist/leaflet.css";
import data from "./gigs_soundguy28.json";
import Table from "./Table";
import SummaryTable from "./SummaryTable";
import logo from "./assets/grateful-dead.png"; // Replace this with the actual path to your logo file

function App() {
  const [concerts, setConcerts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [topSongs, setTopSongs] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [concertHistory, setConcertHistory] = useState([]);
  const [venueCounts, setVenueCounts] = useState([]);
  const [songOfDay, setSongOfDay] = useState(null);

  const [artistOpt, setArtistOpt] = useState([]);
  const [venueOpt, setVenueOpt] = useState([]);
  const [cityOpt, setCityOpt] = useState([]);
  const [songOpt, setSongOpt] = useState([]);
  const [dateRange, setDateRange] = useState([{ startDate: new Date("2000-01-01"), endDate: new Date(), key: "selection" }]);
  const [filters, setFilters] = useState({ artist: null, venue: null, city: null, song: null });

  useEffect(() => {
    const parsed = data.map(d => ({
      ...d,
      date: new Date(d.date.split("-").reverse().join("-")),
      songsArray: d.songs ? d.songs.split(",").map(s => s.trim()) : []
    }));
    setConcerts(parsed);

    const unique = (arr, key) => [...new Set(arr.map(x => x[key]))].map(label => ({ label, value: label }));
    setArtistOpt(unique(parsed, "artist"));
    setVenueOpt(unique(parsed, "venue"));
    setCityOpt(unique(parsed, "city"));
    const songSet = new Set();
    parsed.forEach(c => c.songsArray.forEach(s => songSet.add(s)));
    setSongOpt([...songSet].map(label => ({ label, value: label })));
  }, []);

  useEffect(() => {
    const { artist, venue, city, song } = filters;
    let filteredData = concerts.filter(c => {
      const inDateRange = c.date >= dateRange[0].startDate && c.date <= dateRange[0].endDate;
      const byArtist = !artist || c.artist === artist.value;
      const byVenue = !venue || c.venue === venue.value;
      const byCity = !city || c.city === city.value;
      const bySong = !song || c.songsArray.includes(song.value);
      return inDateRange && byArtist && byVenue && byCity && bySong;
    });
    setFiltered(filteredData);

    const songCounts = {};
    filteredData.forEach(d => d.songsArray.forEach(s => (songCounts[s] = (songCounts[s] || 0) + 1)));
    setTopSongs(Object.entries(songCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 6));

    const artistCounts = {};
    filteredData.forEach(d => (artistCounts[d.artist] = (artistCounts[d.artist] || 0) + 1));
    setTopArtists(Object.entries(artistCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8));

    const monthMap = {};
    filteredData.forEach(d => {
      const key = d.date.toISOString().slice(0, 7);
      monthMap[key] = (monthMap[key] || 0) + 1;
    });
    setConcertHistory(Object.entries(monthMap).map(([month, count]) => ({ month, count })).sort((a, b) => new Date(a.month) - new Date(b.month)));

    const venueMap = {};
    filteredData.forEach(d => {
      const key = `${d.venue}, ${d.city}`;
      venueMap[key] = (venueMap[key] || 0) + 1;
    });
    setVenueCounts(Object.entries(venueMap).map(([location, count], idx) => ({ id: idx, location, count })));

    const todayMD = new Date().toISOString().slice(5, 10);
    const withSongs = filteredData.filter(c => c.songsArray.length > 0);
    const scored = withSongs.map(c => {
      const md = c.date.toISOString().slice(5, 10);
      const diff = Math.abs(new Date(`2024-${md}`) - new Date(`2024-${todayMD}`));
      return { ...c, dateDiff: diff };
    });
    const closest = scored.sort((a, b) => a.dateDiff - b.dateDiff)[0];
    if (closest) {
      const song = closest.songsArray[Math.floor(Math.random() * closest.songsArray.length)];
      setSongOfDay({ song, artist: closest.artist, venue: closest.venue, city: closest.city, date: closest.date.toDateString() });
    }
  }, [concerts, filters, dateRange]);

  const totalMinutes = filtered.reduce((sum, c) => sum + c.songsArray.length, 0) * 5.5;
  const gratefulDeadDrumsMinutes = concerts.filter(c => c.songsArray.includes(" Drums")).length * 9.5;
  const distinctYears = new Set(filtered.map(c => c.date.getFullYear())).size;

  return (
    <div className="App">
      <div className="header">
        <img src={logo} alt="Logo" className="logo" />
        <h1>Bryan's Concert Dashboard</h1>
      </div>
      <div className="hero-metrics">
        <div className="main-metric">🎶 Concerts: {filtered.length}</div>
        <div className="main-metric">⏱️ Minutes Listened: {totalMinutes.toLocaleString()}</div>
      </div>
      <div className="sub-metrics">
        <div className="metric">🎤 Artists: {new Set(filtered.map(c => c.artist)).size}</div>
        <div className="metric">🎵 Songs: {filtered.reduce((sum, c) => sum + c.songsArray.length, 0)}</div>
        <div className="metric">🏟️ Venues: {new Set(filtered.map(c => c.venue)).size}</div>
        <div className="metric">📆 Years of Data: {distinctYears}</div>
      </div>

      <div className="song-of-day">
        {songOfDay && (
          <>
            <h2>🎵 Song of the Day</h2>
            <p><strong>{songOfDay.song}</strong></p>
            <p>{songOfDay.artist} — {songOfDay.venue}, {songOfDay.city}</p>
            <p>{songOfDay.date}</p>
          </>
        )}
        <p style={{ marginTop: "1rem" }}>
          Bryan, you’ve spent <strong>{(gratefulDeadDrumsMinutes / 60).toFixed(1)}</strong> hours listening to the Grateful Dead’s “Drums” at concerts. Keep truckin’ on!
        </p>
      </div>

      <div className="charts-row">
        <div className="chart-box">
          <h2>Top Songs</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topSongs}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#00c0ff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-box">
          <h2>Top Artists</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topArtists}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#00c0ff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="charts-row">
        <div className="chart-box">
          <h2>Concert History</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={concertHistory}>
              <XAxis dataKey="month" />
              <YAxis />
              <CartesianGrid stroke="#ccc" />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#ff70c0" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="map-box">
          <h2>Concert Locations</h2>
          <MapContainer center={[38.03, -78.48]} zoom={4} style={{ height: "250px", width: "100%" }}>
            <TileLayer
              attribution="© OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {venueCounts.map((v, idx) => (
              <Marker position={[38 + idx * 0.01, -78 + idx * 0.01]} key={idx}>
                <Popup>{v.location}: {v.count} shows</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      <div className="filters">
        <DateRange
          editableDateInputs={true}
          onChange={item => setDateRange([item.selection])}
          moveRangeOnFirstSelection={false}
          ranges={dateRange}
        />
        <Select options={artistOpt} onChange={v => setFilters(f => ({ ...f, artist: v }))} placeholder="Filter by artist" />
        <Select options={venueOpt} onChange={v => setFilters(f => ({ ...f, venue: v }))} placeholder="Filter by venue" />
        <Select options={cityOpt} onChange={v => setFilters(f => ({ ...f, city: v }))} placeholder="Filter by city" />
        <Select options={songOpt} onChange={v => setFilters(f => ({ ...f, song: v }))} placeholder="Filter by song" />
      </div>

      <Table data={filtered} />
      <SummaryTable data={filtered} />
    </div>
  );
}

export default App;
