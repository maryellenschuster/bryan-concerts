// SummaryTable.js - Summary by Venue/City/Artist Count Table with column filters

import React from "react";
import { useTable, useSortBy, usePagination, useFilters } from "react-table";
import "./App.css";

// Default text filter component
function DefaultColumnFilter({ column: { filterValue, setFilter } }) {
  return (
    <input
      value={filterValue || ""}
      onChange={e => setFilter(e.target.value || undefined)}
      placeholder="Search..."
      style={{ width: "100%", backgroundColor: "#1a273e", color: "white", border: "1px solid #4ABE6C", padding: "4px" }}
    />
  );
}

function SummaryTable({ data }) {
  const summary = React.useMemo(() => {
    const counts = {};
    data.forEach(c => {
      const key = `${c.venue}|${c.city}|${c.artist}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([key, count]) => {
      const [venue, city, artist] = key.split("|");
      return { venue, city, artist, count };
    });
  }, [data]);

  const columns = React.useMemo(() => [
    { Header: "Venue", accessor: "venue" },
    { Header: "City", accessor: "city" },
    { Header: "Artist", accessor: "artist" },
    { Header: "Concerts", accessor: "count" }
  ], []);

  const defaultColumn = React.useMemo(
    () => ({ Filter: DefaultColumnFilter }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    nextPage,
    previousPage,
    state: { pageIndex }
  } = useTable(
    {
      columns,
      data: summary.sort((a, b) => b.count - a.count),
      defaultColumn,
      initialState: { pageSize: 10 }
    },
    useFilters,
    useSortBy,
    usePagination
  );

  return (
    <div className="data-table">
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render("Header")}
                  <span>{column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}</span>
                </th>
              ))}
            </tr>
          ))}
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th key={column.id}>{column.canFilter ? column.render("Filter") : null}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>&lt;</button>
        <span>Page {pageIndex + 1} of {pageOptions.length}</span>
        <button onClick={() => nextPage()} disabled={!canNextPage}>&gt;</button>
      </div>
    </div>
  );
}

export default SummaryTable;
