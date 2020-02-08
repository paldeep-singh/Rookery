//Display all alcohol
MATCH (n:Alcohol)
RETURN n

//Display all cocktails
MATCH (n:Cocktail)
RETURN n

//Display all ingredients
MATCH (n:ingredients)
RETURN n

//Display cocktails that can be made with specific ingredients
MATCH (c:Cocktail)-[:CONTAINS_INGREDIENT]->(i:Ingredient)
WHERE i.name IN //List of ingredients
RETURN c.name as cocktail, [(c)-[:CONTAINS_INGREDIENT]->(o:Ingredient) | o.name] AS ingredients, [(g:Ingredient)<-[:IS_GARNISHED_WITH]-(c) | g.name] AS garnish

UNWIND ["Vodka", "Coffee Liqueur"] AS search
MATCH (c:Cocktail)-[:CONTAINS_INGREDIENT]->(i:Ingredient), (c)-[:CONTAINS_INGREDIENT]->(i2:Ingredient)
WHERE i.name = search AND i2.name <> search
RETURN c, collect(i2.name) AS ingredients_required, [(g:Ingredient)<-[:IS_GARNISHED_WITH]-(c) | g.name] AS garnish

UNWIND ["Vodka", "Coffee Liqueur"] AS search
MATCH (c:Cocktail)-[:CONTAINS_INGREDIENT]->(i2:Ingredient)
WHERE i2.name <> search
RETURN c, c.ingredients AS ingredients, collect(i2.name) AS ingredients_required, [(g:Ingredient)<-[:IS_GARNISHED_WITH]-(c) | g.name] AS garnish

WITH c, [(c)-[:CONTAINS_INGREDIENT]->(o:Ingredient) | o.name] AS i2, [(c)-[:CONTAINS_INGREDIENT]->(o:Ingredient) | o.name] AS i3, [(g:Ingredient)<-[:IS_GARNISHED_WITH]-(c) | g.name] AS g2
MATCH c, i2, i3, g2
WHERE i2 = search
AND i3 <> search
RETURN c, i2.name AS available_ingredients, i3.name AS ingredients_required, g2

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
