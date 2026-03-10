"use client";

import React, { useState } from "react";

export default function Pagination2({
  itemLength = 200,
  itemPerPage = 10,
  setPage = (num) => {},
}) {
  const [activePage, setActivePage] = useState(1);
  const totalPages = Math.ceil(itemLength / itemPerPage); // Adjust as needed

  const handlePageClick = (page) => {
    if (page != 0 && page <= totalPages) {
      setActivePage(page);
      setPage(page);
    }
    // Add navigation logic here, e.g., using a router or window.location
  };

  return (
    <>
      {totalPages > 1 ? (
        <React.Fragment>
          {" "}
          <li onClick={() => handlePageClick(activePage - 1)}>
            <a className={`nav-item`}>
              <i className="icon icon-arr-l" />
            </a>
          </li>
          {[...Array(totalPages)].slice(0, 4).map((_, index) => {
            const page = index + 1;
            return (
              <li key={page}>
                <a
                  className={`nav-item ${activePage === page ? "active" : ""}`}
                  onClick={() => handlePageClick(page)}
                >
                  {page}
                </a>
              </li>
            );
          })}
          {activePage >= 5 && (
            <li>
              <a className={`nav-item active`}>{activePage}</a>
            </li>
          )}
          {totalPages >= totalPages && activePage != totalPages && (
            <li className={`nav-item`}>
              <a className="">...</a>
            </li>
          )}
          <li onClick={() => handlePageClick(activePage + 1)}>
            <a className={`nav-item`}>
              <i className="icon icon-arr-r" />
            </a>
          </li>{" "}
        </React.Fragment>
      ) : (
        ""
      )}
    </>
  );
}
