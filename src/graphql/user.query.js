import { gql } from "@apollo/client";

export const GetUsersQuery = gql`
  query getAllUsers(
    $page: Int!
    $limit: Int!
    $entityType: String!
    $searchTerm: String
    $sortByOrder: String
    $sortByField: String
  ) {
    getUsers(
      page: $page
      limit: $limit
      searchTerm: $searchTerm
      sortByOrder: $sortByOrder
      sortByField: $sortByField
    ) {
      _id
      email
      name
      age
      location
    }

    paginationInfo(entityType: $entityType, limit: $limit, page: $page) {
      currentPage
      hasNextPage
      hasPreviousPage
      totalPages
    }
  }
`;
