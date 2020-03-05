import json

collatedList = json.loads(open('.\\cleanCocktailList.json').read())

def merge_two_dicts(x, y):
    z = x.copy()   # start with x's keys and values
    z.update(y)    # modifies z with y's keys and values & returns None
    return z
drinkCounter = 0

#do a



jsonFile = '.\\' + 'a' + '.json'
alcoholList = json.loads(open(jsonFile).read())
x = 0
for drinkNumber in range(0, len(alcoholList['drinks'])):
    drinkCounter = drinkCounter + 1

    cleanIngredientsList = []
    # create array of ingredients
    x = x + 1
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
    ingredientMeasure = alcoholList['drinks'][drinkNumber]['strMeasure' + str(1)]
    ingredientName = alcoholList['drinks'][drinkNumber]['strIngredient' + str(1)]
    if ingredientName is not None and ingredientMeasure is not None:
        ingredientString = ingredientString + ', ' + ingredientMeasure + ' ' + ingredientName
        
    elif ingredientName is not None and ingredientMeasure is None:
        ingredientString = ingredientString + ', ' + ingredientName

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
    
    
    collatedList['drinks'] = alcoholList['drinks']


#the rest of the alphabet

alphabetList = [ 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'v', 'w', 'y', 'z' ]

for alphabet in alphabetList:
    
    jsonFile = '.\\' + alphabet + '.json'
    alcoholList = json.loads(open(jsonFile).read())
    x = 0
    for drinkNumber in range(0, len(alcoholList['drinks'])):
        drinkCounter = drinkCounter + 1

        cleanIngredientsList = []
        # create array of ingredients
        x = x + 1
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
        ingredientMeasure = alcoholList['drinks'][drinkNumber]['strMeasure' + str(1)]
        ingredientName = alcoholList['drinks'][drinkNumber]['strIngredient' + str(1)]
        if ingredientName is not None and ingredientMeasure is not None:
            ingredientString = ingredientString + ', ' + ingredientMeasure + ' ' + ingredientName
            
        elif ingredientName is not None and ingredientMeasure is None:
            ingredientString = ingredientString + ', ' + ingredientName

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
        
        
    collatedList['drinks'].extend(alcoholList['drinks'])
    print(len(collatedList['drinks']))


print(len(collatedList['drinks']))

#for drinkNumber in range(0, len(collatedList['drinks'])):
    #print(drinkNumber)
    



with open('cleanCocktailList.json', 'w') as outfile:
    json.dump(collatedList, outfile)
# print(testCocktail)

# for i in range(10, 100):
#    print(shit[0]['strIngredient' + str(i)])
