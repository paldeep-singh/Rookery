//Display all alcohol
MATCH (n:Alcohol)
RETURN n

//Display all cocktails
MATCH (n:Cocktail)
RETURN n

//Display all ingredients
MATCH (n:ingredients)
RETURN n

//Display cocktails that can be made with specific alcohol

MATCH (i:Alcohol)
WHERE i.name IN $checkList
WITH COLLECT(i) AS available_alcohol
MATCH (r:Cocktail)-[:CONTAINS_INGREDIENT]->(i:Alcohol)
WITH available_alcohol, r, COLLECT(i) AS recipe_ingredients
WHERE ALL(x IN recipe_ingredients WHERE x IN available_alcohol)
RETURN r
ORDER BY SIZE(recipe_ingredients) DESC,
{ checkList: this.state.myBar }

//Display cocktails that can be made missing 1 alcohol

MATCH (i:Alcohol)
WHERE i.name IN $checkList
WITH COLLECT(i) AS available_alcohol
MATCH (r:Cocktail)-[:CONTAINS_INGREDIENT]->(i:Alcohol)
WITH available_alcohol, r, COLLECT(i) AS recipe_ingredients
WHERE SINGLE(x IN recipe_ingredients WHERE NOT x IN available_alcohol)
RETURN r
ORDER BY SIZE(recipe_ingredients) DESC,
{ checkList: this.state.myBar }

//Retrieve specific cocktail
MATCH (c:Cocktail)
WHERE c.name = $cocktailName
RETURN c,
{ cocktailName: this.state.selectedCocktail}

// Most useful ingredients
MATCH (c:Cocktail)-[:CONTAINS_INGREDIENT]->(ingredient)
RETURN ingredient, count(*) AS numCocktails
ORDER BY numCocktails DESC
LIMIT 5

// Most useful Alcohol
MATCH (c:Cocktail)-[:CONTAINS_INGREDIENT]->(a:Alcohol)
RETURN a, count(*) AS numCocktails
ORDER BY numCocktails DESC
LIMIT 5
