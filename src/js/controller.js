import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

// if (module.hot) {
//   module.hot.accept();
// }

//* https://forkify-api.herokuapp.com/v2

//@@ Loading a Recipe from API
const controlRecipes = async function () {
  try {
    //@@ Listening For load and hashchange Events
    const id = window.location.hash.slice(1);
    // console.log(id);
    //5ed6604591c37cdc054bc886
    if (!id) {
      return;
    }
    recipeView.renderSpinner();

    //* 1 Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    //* 2 Updating bookings view
    bookmarksView.update(model.state.bookmarks);

    //* 3 loading recipe
    await model.loadRecipe(id);

    //* 4 Rendering recipe
    recipeView.render(model.state.recipe);

    //* TEST
    // controlServings();
  } catch (err) {
    // console.log(err);
    recipeView.renderError();
    console.error(err);
  }
};
// controlRecipes();

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    // console.log(resultsView);

    //* 1 Get search Query
    const query = searchView.getQuery();
    if (!query) {
      return;
    }
    //* 2 load search results
    await model.loadSearchResults(query);

    //* 3 Render results
    // console.log(model.state.search.results);
    // resultsView.render(model.state.search.results);
    // console.log(model.getSearchResultsPage(1));
    resultsView.render(model.getSearchResultsPage());

    //* Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};
// controlSearchResults();

const controlPagination = function (goToPage) {
  // console.log(goToPage);
  //* 1 Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  //* 2 Render NEW pagination buttons
  paginationView.render(model.state.search);
};

//@@ Updating Recipe Servings
const controlServings = function (newServings) {
  //* Update the recipe servings (in state)
  model.updateServings(newServings);

  //* Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

//@@ Implementing Bookmarks - Part 1
const controlAddBookmark = function () {
  // console.log(model.state.recipe.bookmarked);
  //* 1 Add/Remove bookmark
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else {
    model.deleteBookmark(model.state.recipe.id);
  }
  // console.log(model.state.recipe);

  //* 2 Update recipe view
  recipeView.update(model.state.recipe);

  //* 3 Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

//@@ Implementing Bookmarks - Part 2
const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

//@@ Uploading a New Recipe - Part 1
const controlAddRecipe = async function (newRecipe) {
  try {
    //* Show loading spinner
    addRecipeView.renderSpinner();

    // console.log(newRecipe);
    //* Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //* Render recipe
    recipeView.render(model.state.recipe);

    //* Success message
    addRecipeView.renderMessage();

    //* Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    //* Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    // window.history.back();

    //* Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
