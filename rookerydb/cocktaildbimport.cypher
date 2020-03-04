WITH "file:///cleanTest.json" AS url
CALL apoc.load.json(url) YIELD value
UNWIND value.drinks as drink
MERGE (c:Cockatil {id: drink.idDrink}) 
ON CREATE SET c.name = drink.strdrink,
                c.ingredients = drink.cleanIngredientsString,
                c.method = drink.strInstructions

