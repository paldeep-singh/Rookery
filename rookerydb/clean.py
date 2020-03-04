import json

alcoholList = json.loads(open('.\TheCocktailDB.json').read())
print(len(alcoholList['drinks']))
x = 0
for drinkNumber in range(0, len(alcoholList['drinks'])):

    cleanIngredientsList = []
    # create array of ingredients
    print(alcoholList['drinks'][drinkNumber]['strDrink'])
    x = x + 1
    print(x)
    for i in range(1, 15):

        ingredient = alcoholList['drinks'][drinkNumber]['strIngredient' +
                                                        str(i)]

        if ingredient is not (None):
            cleanIngredientsList.append(ingredient)

        else:
            pass

    alcoholList['drinks'][drinkNumber]['cleanIngredients'] = cleanIngredientsList

    # create ingredients string

    ingredientString = ''
    ingredientString = alcoholList['drinks'][drinkNumber]['strMeasure1'] + ' ' + alcoholList['drinks'][drinkNumber]['strIngredient1']

    for i in range(2, 15):

        ingredientMeasure = alcoholList['drinks'][drinkNumber]['strMeasure' + str(i)]
        ingredientName = alcoholList['drinks'][drinkNumber]['strIngredient' + str(i)]

        if ingredientName is not None and ingredientMeasure is not None:
            ingredientString = ingredientString + ', ' + ingredientMeasure + ' ' + ingredientName
        
        elif ingredientName is not None and ingredientMeasure is None:
            ingredientString = ingredientString + ', ' + ingredientName
        else:
            pass
    
    alcoholList['drinks'][drinkNumber]['cleanIngredientsString'] = ingredientString
    
    if alcoholList['drinks'][drinkNumber]['strAlcoholic'] == 'Alcoholic':
        alcoholList['drinks'][drinkNumber]['strAlcoholic'] = 'true'
    
    elif alcoholList['drinks'][drinkNumber]['strAlcoholic'] == 'Non alcoholic':
        alcoholList['drinks'][drinkNumber]['strAlcoholic'] = 'false'
        
    print(alcoholList['drinks'][drinkNumber]['strAlcoholic'])
        


with open('cleanTest.json', 'w') as outfile:
    json.dump(alcoholList, outfile)
# print(testCocktail)

# for i in range(10, 100):
#    print(shit[0]['strIngredient' + str(i)])
