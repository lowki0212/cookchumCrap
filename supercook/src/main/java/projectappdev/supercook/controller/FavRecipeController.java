package projectappdev.supercook.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import projectappdev.supercook.entity.FavRecipeEntity;
import projectappdev.supercook.service.FavRecipeService;
@RestController
@RequestMapping("/api/favRecipes")
public class FavRecipeController {

	@Autowired
		FavRecipeService fserv;
		
		
		//Create of CRUD
		@PostMapping(value = "/postFavRecipe", consumes = "application/json", produces = "application/json")
		public FavRecipeEntity postFavRecipeRecord(@RequestBody FavRecipeEntity recipe) {
			 System.out.println("Received recipe: " + recipe);
			return fserv.postFavRecipeRecord(recipe);
		}
		
		//Read of CRUD
		@GetMapping("/getFavRecipe")
		public List<FavRecipeEntity> getFavRecipeRecord(){
			System.out.println("getAllStudents method was called");
			List<FavRecipeEntity> favRecipes = fserv.getFavRecipeRecord();
		    favRecipes.forEach(fav -> System.out.println("Rating: " + fav.getRating()));
			return fserv.getFavRecipeRecord();
		}
		//Update of CRUD
		@PutMapping("/putFavRecipe")
		public FavRecipeEntity putFavRecipeDetails(@RequestParam int id,@RequestBody FavRecipeEntity newFavRecipe){
			return fserv.putFavRecipeDetails(id, newFavRecipe);
		}
		//Delete of CRUD
		@DeleteMapping("/deleteFavRecipe/{id}")
		public String deteleFavRecipe(@PathVariable int id) {
			return fserv.deteleFavRecipe(id);
		}
	
}