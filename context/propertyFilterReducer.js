import { allProperties } from "@/data/properties";

export const initialState = {
  price: [1800, 5500],
  size: [800, 2200],
  rooms: "All",
  bedrooms: "All",
  bathrooms: "All",
  type: "All",
  features: [],
  filtered: allProperties,
  sortingOption: "Sort by (Default)",
  sorted: allProperties,
  currentPage: 1,
  itemPerPage: 6,
};

export function reducer(state, action) {
  switch (action.type) {
    case "SET_PRICE":
      return { ...state, price: action.payload };
    case "SET_SIZE":
      return { ...state, size: action.payload };
    case "SET_ROOMS":
      return { ...state, rooms: action.payload };
    case "SET_BEDROOMS":
      return { ...state, bedrooms: action.payload };
    case "SET_BATHROOMS":
      return { ...state, bathrooms: action.payload };
    case "SET_TYPE":
      return { ...state, type: action.payload };
    case "SET_FEATURES":
      return { ...state, features: action.payload };
    case "SET_FILTERED":
      return { ...state, filtered: [...action.payload] };
    case "SET_SORTING_OPTION":
      return { ...state, sortingOption: action.payload };
    case "SET_SORTED":
      return { ...state, sorted: [...action.payload] };
    case "SET_CURRENT_PAGE":
      return { ...state, currentPage: action.payload };
    case "SET_ITEM_PER_PAGE":
      return { ...state, itemPerPage: action.payload };
    case "CLEAR_FILTER":
      return {
        ...state,
        price: [1800, 5500],
        size: [800, 2200],
        rooms: "All",
        bedrooms: "All",
        bathrooms: "All",
        type: "All",
        features: [],
      };
    default:
      return state;
  }
}
