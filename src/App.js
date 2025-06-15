
import React, { useState, useEffect } from "react";
import "./App.css";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, LabelList, LineChart, Line
} from "recharts";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "leaflet/dist/leaflet.css";
import data from "./gigs_soundguy28.json";
import Table from "./Table";
import SummaryTable from "./SummaryTable";
import logo from "./assets/grateful-dead.png";

function App() {
  const [concerts, setConcerts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [topSongs, setTopSongs] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [concertHistory, setConcertHistory] = useState([]);
  const [venueCounts, setVenueCounts] = useState([]);
  const [songOfDay, setSongOfDay] = useState(null);
  const [collapsed, setCollapsed] = useState({ summary: false, all: false });
  const [dateRange, setDateRange] = useState([{ startDate: new Date("2000-01-01"), endDate: new Date(), key: "selection" }]);

  useEffect(() => {
    const parsed = data.map(d => ({
      ...d,
      date: new Date(d.date.split("-").reverse().join("-")),
      songsArray: d.songs ? d.songs.split(",").map(s => s.trim()) : []
    }));
    setConcerts(parsed);
  }, []);

  useEffect(() => {
    let filteredData = concerts.filter(c => c.date >= dateRange[0].startDate && c.date <= dateRange[0].endDate);
    setFiltered(filteredData);

    const songCounts = {};
filteredData.forEach(d =>
  d.songsArray.forEach(s => {
    const trimmed = s.trim().toLowerCase();
    if (trimmed !== "drums") {
      songCounts[s] = (songCounts[s] || 0) + 1;
    }
  })
);
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
  }, [concerts, dateRange]);

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
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Bar dataKey="count" fill="#00c0ff">
                <LabelList dataKey="count" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-box">
          <h2>Top Artists</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topArtists}>
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Bar dataKey="count" fill="#00c0ff">
                <LabelList dataKey="count" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-box">
          <h2>Concert History</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={concertHistory}>
              <XAxis dataKey="month" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <CartesianGrid stroke="#444" />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#4ABE6C" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="map-box">
          <h2>Concert Locations</h2>
          <MapContainer center={[38.03, -78.48]} zoom={5} style={{ height: "250px", width: "100%" }}>
            <TileLayer
              attribution="© OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {venueCounts.map((v, idx) => (
              <CircleMarker
                key={idx}
                center={[38 + idx * 0.01, -78 + idx * 0.01]}
                radius={Math.min(15, 3 + v.count)}
                pathOptions={{ color: "#00e5ff", fillOpacity: 0.6 }}
              >
                <Popup>{v.location}: {v.count} shows</Popup>
              </CircleMarker>
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
      </div>

      <div className="collapsible">
        <h2 onClick={() => setCollapsed(c => ({ ...c, summary: !c.summary }))}>Summary Table ▾</h2>
        {!collapsed.summary && <SummaryTable data={filtered} />}

        <h2 onClick={() => setCollapsed(c => ({ ...c, all: !c.all }))}>All Concert Data ▾</h2>
        {!collapsed.all && <Table data={filtered} />}
      </div>
    </div>
  );
}

export default App;
