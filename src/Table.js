// Table.js - All Concert Data Table with column filters + pagination

import React from "react";
import { useTable, useFilters, useSortBy, usePagination } from "react-table";
import "./App.css";

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

function Table({ data }) {
  const columns = React.useMemo(() => [
    { Header: "Date", accessor: "date", Cell: ({ value }) => new Date(value).toLocaleDateString() },
    { Header: "Artist", accessor: "artist" },
    { Header: "Venue", accessor: "venue" },
    { Header: "City", accessor: "city" },
    { Header: "Songs", accessor: "songs" }
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
    state: { pageIndex },
  } = useTable(
    { columns, data, defaultColumn, initialState: { pageSize: 10 } },
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
          {page.map((row, i) => {
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
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>{"<"}</button>
        <span>Page {pageIndex + 1} of {pageOptions.length}</span>
        <button onClick={() => nextPage()} disabled={!canNextPage}>{">"}</button>
      </div>
    </div>
  );
}

export default Table;
