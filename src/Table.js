// Table.js
import React from "react";
import "./App.css";

function Table({ data }) {
  return (
    <div className="table-container">
      <h2>Concert Details</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Artist</th>
            <th>Venue</th>
            <th>City</th>
            <th>Songs</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, idx) => (
            <tr key={idx}>
              <td>{new Date(d.date).toLocaleDateString()}</td>
              <td>{d.artist}</td>
              <td>{d.venue}</td>
              <td>{d.city}</td>
              <td>{d.songsArray.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;