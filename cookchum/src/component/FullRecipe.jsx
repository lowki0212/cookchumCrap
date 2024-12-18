import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./FullRecipe.css";

const FullRecipe = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isInvalidState, setIsInvalidState] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    if (!state || !state.recipe || !state.userId) {
      setIsInvalidState(true);
      navigate("/dashboard");
    }
  }, [state, navigate]);
  const handleAddToFavorites = async () => {
    try {
      // Fetch the user's favorite recipes
      const response = await axios.get(
        `http://localhost:8080/api/favRecipes/getFavRecipe`,
        {
          params: { userId: state.userId },
          headers: { "Content-Type": "application/json" },
        }
      );
  
      const favoriteRecipes = response.data;
  
      // Check if the current recipe is already in the user's favorites
      const isAlreadyFavorite = favoriteRecipes.some(
        (fav) => fav.recipe.recipeId === state.recipe.recipeId
      );
  
      if (isAlreadyFavorite) {
        alert("This recipe is already saved in your favorites.");
        return;
      }
  
      // Add to favorites if not already present
      const favoriteRecipe = {
        recipe: { recipeId: state.recipe.recipeId },
        user: { userId: state.userId },
        dateAdded: new Date().toISOString().split("T")[0],
      };
  
      await axios.post(
        "http://localhost:8080/api/favRecipes/postFavRecipe",
        favoriteRecipe,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
  
      alert("Recipe added to favorites!");
    } catch (error) {
      alert("Failed to add recipe to favorites. Please try again.");
    }
  };

  const fetchReviews = async () => {
    if (!state || !state.recipe || !state.recipe.recipeId) {
      console.error("State or recipe ID is invalid.");
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:8080/api/reviews/getReview`
      );
      const filteredReviews = response.data.filter(
        (r) => r.recipe.recipeId === state.recipe.recipeId
      );
      setReviews(filteredReviews);

      const existingReview = filteredReviews.find(
        (review) => review.user.userId === state.userId
      );
      if (existingReview) {
        setUserReview(existingReview);
        setReviewText(existingReview.reviewText);
        setRating(existingReview.rating);
        setIsAdding(false);
      } else {
        setUserReview(null);
        setReviewText("");
        setRating(0);
        setIsAdding(true);
      }
      // Calculate the average rating
    if (filteredReviews.length > 0) {
      const totalRating = filteredReviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const avgRating = totalRating / filteredReviews.length;
      setAverageRating(avgRating);
    } else {
      setAverageRating(0);
    }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [isInvalidState]);


  const handleAddOrUpdateReview = async () => {
    if (rating <= 0 || rating > 5) {
      alert("Please select a rating between 1 and 5.");
      return;
    }

    const reviewData = {
      reviewText,
      rating,
      reviewDate: new Date().toISOString().split("T")[0],
      user: { userId: state.userId },
      recipe: { recipeId: state.recipe.recipeId },
    };

    try {
      if (userReview) {
        await axios.put(
          `http://localhost:8080/api/reviews/putReview?id=${userReview.reviewId}`,
          reviewData,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        alert("Review updated successfully!");
      } else {
        await axios.post(
          "http://localhost:8080/api/reviews/postReview",
          reviewData,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        alert("Review added successfully!");
        setIsAdding(false);
      }
      fetchReviews();
      setIsEditing(false);
    } catch (error) {
      console.error("Error adding or updating review:", error);
      alert("Failed to save review. Please try again.");
    }
  };

  const handleDeleteReview = async () => {
    try {
      await axios.delete(
        `http://localhost:8080/api/reviews/deleteReview/${userReview.reviewId}`
      );
      alert("Review deleted successfully!");
      fetchReviews();
      setIsEditing(false);
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review. Please try again.");
    }
  };

  const handleStarClick = (starIndex) => {
    setRating(starIndex + 1); // Adjust index (0-based) to rating value (1-based)
  };

  const renderStars = () => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <span
          key={index}
          className={`star ${index < rating ? "gold" : "gray"}`}
          onClick={() => handleStarClick(index)}
        >
          ★
        </span>
      ));
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isInvalidState) {
    return null;
  }

  const { recipe } = state;

  return (
    <>
    <div className="recipe-header invisible">
  <h1 className="recipe-name">{recipe.name}</h1>
  <div className="rating">
  <p>{recipe.reviews ? `${recipe.reviews.length} reviews` : "No reviews yet"}</p>
  </div>
  <p className="author">{recipe.author}</p>
  <h4 className="estimated-cost">Estimated Cost: ${recipe.estimatedCost?.toFixed(2) || "N/A"}</h4>
</div>

    <div className="full-recipe-container">
   <div className="recipe-content">
  {recipe.imageUrl && (
    <div className="recipe-image">
      <img
        src={recipe.imageUrl}
        alt={recipe.name}
        className="full-recipe-image"
      />
    </div>
  )}
  <div className="recipe-info">
    <h1>{recipe.name}</h1>
    <p>{recipe.description}</p>
    <h4>Estimated Cost: ${recipe.estimatedCost?.toFixed(2) || "N/A"}</h4>
    <h3>Ingredients:</h3>
    {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 ? (
      <ul>
        {recipe.ingredients.map((ingredient) => (
          <li key={ingredient.ingredientId}>{ingredient.name}</li>
        ))}
      </ul>
    ) : (
      <p>No ingredients available.</p>
    )}
  </div>
</div>

<h3>Average Rating: {averageRating.toFixed(1)} / 5</h3> {/* New */}
    <div className="review-stars">
      {Array(5)
        .fill(0)
        .map((_, index) => (
          <span
            key={index}
            className={`star ${
              index < Math.round(averageRating) ? "gold" : "gray"
            }`}
          >
            ★
          </span>
        ))}
    </div>

<div class="instructions-section">
    <h2 class="instructions-header">How to Cook</h2>
    <ol class="instructions-list">
      <li>Preheat the oven to 180°C.</li>
      <li>Mix all ingredients in a bowl.</li>
      <li>Bake for 30 minutes or until golden brown.</li>
      <li>Let it cool before serving.</li>
    </ol>
  </div>
  <div class="time-info-section">
    <h2 class="time-info-header">Time Information</h2>
    <div class="time-info">
      <p><span>Prep Time:</span> 15 minutes</p>
      <p><span>Cook Time:</span> 30 minutes</p>
      <p><span>Total Time:</span> 45 minutes</p>
    </div>
  </div>
  <div class="nutritional-section">
    <h2 class="nutritional-header">Nutritional Information</h2>
    <div class="nutritional-info">
    <p><span>Calories: </span>{recipe.calories || "N/A"}</p>
      <p><span>Fat:</span> 10g</p>
      <p><span>Carbohydrates:</span> 35g</p>
      <p><span>Protein:</span> 5g</p>
    </div>
  </div>
  <div className="rev">
      <h3>Reviews:</h3></div>
      <div className="review-list">
        {userReview && !isAdding && (
          <div className="review-item user-review">
            <div className="review-header">
              <img
                src={userReview.user?.profilePicture || "/default-avatar.png"}
                alt={userReview.user?.username || "Anonymous"}
                className="review-avatar"
              />
              <div className="review-info">
                <p className="review-username">
                  {userReview.user?.username || "Anonymous"}
                </p>
                <p className="review-date">{userReview.reviewDate}</p>
                {isEditing && (
                  <button
                    onClick={handleDeleteReview}
                    className="delete-review-button"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
            {isEditing ? (
              <div className="review-form">
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Update your review here..."
                  rows="4"
                ></textarea>
                <div className="review-stars">{renderStars()}</div>
                <button onClick={handleAddOrUpdateReview}>Save</button>
              </div>
            ) : (
              <div className="review-content" onClick={() => setIsEditing(true)}>
                <div className="review-rating">
                  {Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <span
                        key={index}
                        className={`star ${
                          index < userReview.rating ? "gold" : "gray"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                </div>
                <p className="review-text">{userReview.reviewText}</p>
              </div>
            )}
          </div>
        )}

        {isAdding && (
          <div className="review-item add-review">
            <h4>Add a Comment:</h4>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write your review here..."
              rows="4"
            ></textarea>
            <div className="review-stars">{renderStars()}</div>
            <button onClick={handleAddOrUpdateReview} className="add-comment-button">
      <span className="comment-icon">💬</span> {/* Optional: Comment icon */}
      <span className="button-text">Add Comment</span>
    </button>
          </div>
        )}

        {reviews
          .filter((review) => review.user.userId !== state.userId)
          .map((review) => (
            <div key={review.reviewId} className="review-item">
              <div className="review-header">
                <img
                  src={review.user?.profilePicture || "/default-avatar.png"}
                  alt={review.user?.username || "Anonymous"}
                  className="review-avatar"
                />
                <div className="review-info">
                  <p className="review-username">
                    {review.user?.username || "Anonymous"}
                  </p>
                  <p className="review-date">{review.reviewDate}</p>
                </div>
              </div>
              <div className="review-content">
                <div className="review-rating">
                  {Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <span
                        key={index}
                        className={`star ${
                          index < review.rating ? "gold" : "gray"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                </div>
                <p className="review-text">{review.reviewText}</p>
              </div>
            </div>
          ))}
      </div>

      <div className="button-group">
        <button type="button" className="back-button" onClick={handleBack}>
          Back
        </button>
        <button type="button" className="add-favorite-button" onClick={handleAddToFavorites}>
          Add to Favorites
        </button>
        </div>
      </div>

      <div className="reader-favorites">
  <h3>Reader Favorites</h3>
  <div className="favorite-item">
    <img src="https://i.ibb.co/k9qZ0WX/1170f1494f08.jpg" alt="Favorite Recipe 1" />
    <p>CRABBY PATTY</p> 
  </div>
  <div className="favorite-item">
    <img src="https://i.ibb.co/T4PdF6Z/c0a4e0b1de0b.jpg" alt="Favorite Recipe 2" />
    <p>SINIGANG NI WINTER</p> 
  </div>
  <div className="favorite-item">
    <img src="https://i.ibb.co/WsY7McB/2bb71ebc4bcc.jpg" alt="Favorite Recipe 2" />
    <p>KAWALI NI SUPERMAN</p> 
  </div>
  <div className="favorite-item">
    <img src="https://i.ibb.co/KGnqrcD/0b0e95424715.jpg" alt="Favorite Recipe 2" />
    <p>HOTDOG NI SPIDERMAN</p> 
  </div>
  <div className="favorite-item">
    <img src="https://i.ibb.co/18FhjRB/859bc615f1c8.jpg" alt="Favorite Recipe 2" />
    <p>BOILED EGG NI SANTA CLAUS</p> 
  </div>
  <div className="favorite-item">
    <h4>Learn How to Cook!</h4>
    <iframe
      width="100%"
      height="315"
      src="https://www.youtube.com/embed/dQw4w9WgXcQ" // Replace with the actual video URL
      title="YouTube video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    ></iframe>
  </div>
</div>

      </>
  );
};

export default FullRecipe;
