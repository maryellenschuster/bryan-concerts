// SummaryTable.js
import React from "react";
import "./App.css";

function SummaryTable({ data }) {
  const summary = data.reduce((acc, cur) => {
    const key = `${cur.city} | ${cur.venue}`;
    if (!acc[key]) {
      acc[key] = { city: cur.city, venue: cur.venue, concerts: 0, artists: new Set(), songs: 0 };
    }
    acc[key].concerts += 1;
    acc[key].artists.add(cur.artist);
    acc[key].songs += cur.songsArray.length;
    return acc;
  }, {});

  const rows = Object.values(summary).map(row => ({
    ...row,
    artists: row.artists.size
  }));

  return (
    <div className="table-container">
      <h2>Venue Summary</h2>
      <table>
        <thead>
          <tr>
            <th>City</th>
            <th>Venue</th>
            <th>Concerts</th>
            <th>Unique Artists</th>
            <th>Songs</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              <td>{row.city}</td>
              <td>{row.venue}</td>
              <td>{row.concerts}</td>
              <td>{row.artists}</td>
              <td>{row.songs}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SummaryTable;
