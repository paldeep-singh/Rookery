import json

collatedList = json.loads(open('.\\cleanCocktailList.json').read())

for drinkNumber in range(0, len(collatedList['drinks'])):
    print(drinkNumber)
    print(collatedList['drinks'][drinkNumber]['strDrink'])
    
