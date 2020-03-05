WITH "file:///cleanCocktailList.json" AS url
CALL apoc.load.json(url) YIELD value
UNWIND value.drinks as drink
WITH drink
UNWIND drink.cleanIngredients AS ingredient
MERGE (c:Cocktail {id: drink.idDrink})
MERGE (i:Ingredient {name: ingredient})
MERGE (c) - [:CONTAINS_INGREDIENT] -> (i)
ON CREATE SET c.name = drink.strDrink,
                c.ingredients = drink.cleanIngredientsString,
                c.method = drink.strInstructions,
                c.thumbnail = drink.strDrinkThumb,
                c.category = drink.strCategory,
                c.glass = drink.strGlass,
                c.alcoholic = toBoolean(drink.strAlcohlic)

