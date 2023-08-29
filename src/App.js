import { useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import {
  Dropdown,
  Form,
  FormControl,
  Pagination,
  Table,
} from "react-bootstrap";
import debounce from "lodash.debounce";

import { GetUsersQuery } from "./graphql/user.query";

const itemsPerPageOptions = [5, 10, 20, 100];
const defaultItemsPerPage = 5;

function App() {
  // State variables for managing various aspects of the component
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [sortByOrder, setSortByOrder] = useState("");
  const [sortByField, setSortByField] = useState("");
  const [columns, setColumns] = useState([
    { name: "Name", field: "name", sort: "asc" },
    { name: "Email", field: "email", sort: null },
    { name: "Location", field: "location", sort: null },
    { name: "Age", field: "age", sort: null },
  ]);

  // Use the useQuery hook to fetch data
  const {
    loading,
    error,
    data = [],
    refetch,
  } = useQuery(GetUsersQuery, {
    variables: {
      page: currentPage,
      limit: itemsPerPage,
      entityType: "users",
      sortByField,
      sortByOrder,
    },
  });

  // Use Lodash debounce here for refetch the data according to sort and search term
  const delayedRefetch = debounce(() => {
    refetch({
      page: currentPage,
      limit: itemsPerPage,
      entityType: "users",
      searchTerm: searchQuery, // Use the current state value
      sortByField,
      sortByOrder,
    });
    setSearchLoading(false);
  }, 2000);

  // UseEffect to handle search query and sorting then refetch data
  useEffect(() => {
    setSearchLoading(true);
    delayedRefetch();
    return delayedRefetch.cancel; // Cancel the debounce on cleanup
  }, [searchQuery, sortByField]);

  // Extract data from the query response
  const paginationInfo = data?.paginationInfo || {};
  const totalPages = paginationInfo?.totalPages || 0;
  const currentPageData = data?.getUsers || [];

  // Function to check if actions should be disabled
  const isActionDisabled = () => {
    if (loading || searchLoading) {
      return false;
    }
    return true;
  };

  // Event handlers
  const handlePageChange = (pageNumber) => {
    let actionStatus = isActionDisabled();
    if (!actionStatus) return false;

    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (selectedItemsPerPage) => {
    let actionStatus = isActionDisabled();
    if (!actionStatus) return false;

    setItemsPerPage(selectedItemsPerPage);
    setCurrentPage(1); // Reset to the first page
  };

  const handlePreviousPage = () => {
    let actionStatus = isActionDisabled();
    if (!actionStatus) return false;

    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    let actionStatus = isActionDisabled();
    if (!actionStatus) return false;

    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handleSort = (field) => {
    let actionStatus = isActionDisabled();
    if (!actionStatus) return false;

    const newColumns = columns.map((col) => {
      if (col.field === field) {
        return { ...col, sort: col.sort === "asc" ? "desc" : "asc" };
      } else {
        return { ...col, sort: null };
      }
    });

    setColumns(newColumns);
    setSortByField(field);
    setSortByOrder(newColumns.find((col) => col.field === field)?.sort);
  };

  // Render the component
  return (
    <div className="container">
      {error && <p>{error.message}</p>}
      {!error && (
        <>
          <h1 className="text-center">Users</h1>
          <Form>
            <FormControl
              type="text"
              placeholder="Search by name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Form>

          <Table striped bordered hover>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.field}
                    onClick={() => handleSort(col.field)}
                    className={
                      col.sort === "asc"
                        ? "sort-asc"
                        : col.sort === "desc"
                        ? "sort-desc"
                        : ""
                    }
                  >
                    {col.name}{" "}
                    {col.sort === "asc" ? (
                      <i className="fa fa-caret-up"></i>
                    ) : col.sort === "desc" ? (
                      <i className="fa fa-caret-down"></i>
                    ) : null}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentPageData.map((item) => (
                <tr key={item.email}>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.location}</td>
                  <td>{item.age}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="d-flex justify-content-between align-items-center">
            <Dropdown>
              <Dropdown.Toggle variant="primary" id="itemsPerPageDropdown">
                Items per page: {itemsPerPage}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {itemsPerPageOptions.map((option) => (
                  <Dropdown.Item
                    key={option}
                    onClick={() => handleItemsPerPageChange(option)}
                  >
                    {option}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>

            {!error && (searchLoading || loading) && (
              <h1 className="text-center">Loading...</h1>
            )}

            <Pagination>
              <Pagination.Prev
                onClick={handlePreviousPage}
                disabled={!paginationInfo?.hasPreviousPage || false}
              />
              {Array.from({
                length: totalPages,
              }).map((_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={index + 1 === currentPage}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                onClick={handleNextPage}
                disabled={!paginationInfo?.hasNextPage || false}
              />
            </Pagination>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
