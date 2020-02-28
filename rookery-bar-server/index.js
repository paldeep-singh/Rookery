require('dotenv').config()
const express = require('express')
const app = express()
const port = 8080
var neo4j = require('neo4j-driver')

app.get('/', (req, res) => res.send('Rookery Bar App Server GTFO'))

app.get('/alcohol-list', async function (req, res) { alcoholList = await getAlcohols(), res.send(alcoholList) })
app.get('/cocktail-list-none', async function (req, res) { newList = req.query.a , cocktailList = await getCocktailsMissingNone(newList), res.send(cocktailList)})
app.get('/cocktail-list-one', async function (req, res) { newList = req.query.a , cocktailList = await getCocktailsMissingOne(newList), res.send(cocktailList) })
app.get('/cocktail', async function (req, res) {cocktail = req.query.a , selectedCocktail = await getSpecificCocktail(cocktail), res.send(selectedCocktail)})


//http://localhost:3001/cocktail-list-one/?a=Vodka&a=blah

app.listen(port, () => console.log(`Rookery Bar App Server listening on port ${port}!`))

async function getSpecificCocktail(selectedCocktail) {
    let driver = neo4j.driver(
        process.env.REACT_APP_NEO4J_URL,
        neo4j.auth.basic(process.env.REACT_APP_NEO4J_USER, process.env.REACT_APP_NEO4J_PASSWORD)
    )
    let session = driver.session()
    let result = await session
        .run(
            `MATCH (c:Cocktail)
          WHERE c.name = $cocktailName
          RETURN c`,
            { cocktailName: selectedCocktail }
        )
    let resultData = result.records[0].toObject().c.properties
    session.close()
    return resultData
}


async function getAlcohols() {
    let driver = neo4j.driver(
        process.env.REACT_APP_NEO4J_URL,
        neo4j.auth.basic(process.env.REACT_APP_NEO4J_USER, process.env.REACT_APP_NEO4J_PASSWORD)
    )
    let session = driver.session()
    let result = await session
        .run(
            'MATCH (n:Alcohol) RETURN n ORDER BY n.name'
        )

    let resultData = []
    result.records.forEach(record => {
        resultData.push(
            record.toObject().n.properties.name)
    })
    session.close()
    console.log(resultData)
    return resultData
}

async function getCocktailsMissingNone(availableAlcohol) {

    let driver = neo4j.driver(
        process.env.REACT_APP_NEO4J_URL,
        neo4j.auth.basic(process.env.REACT_APP_NEO4J_USER, process.env.REACT_APP_NEO4J_PASSWORD)
    )
    let session = driver.session()

    let result = await session
        .run(
            `MATCH (i:Alcohol)
        WHERE i.name IN $checkList
        WITH COLLECT(i) AS available_alcohol
        MATCH (r:Cocktail)-[:CONTAINS_INGREDIENT]->(i:Alcohol)
        WITH available_alcohol, r, COLLECT(i) AS recipe_ingredients
        WHERE ALL(x IN recipe_ingredients WHERE x IN available_alcohol)
        RETURN r
        ORDER BY r.name`,
            { checkList: availableAlcohol }
        )

    let resultData = []
    result.records.forEach(record => {
        resultData.push(
            record.toObject().r.properties.name)
    })
    console.log(resultData)
    session.close()
    return resultData
}

async function getCocktailsMissingOne(availableAlcohol) {
    let driver = neo4j.driver(
        process.env.REACT_APP_NEO4J_URL,
        neo4j.auth.basic(process.env.REACT_APP_NEO4J_USER, process.env.REACT_APP_NEO4J_PASSWORD)
    )
    let session = driver.session()
    let result = await session
        .run(
            `MATCH (i:Alcohol)
        WHERE i.name IN $checkList
        WITH COLLECT(i) AS available_alcohol
        MATCH (r:Cocktail)-[:CONTAINS_INGREDIENT]->(i:Alcohol)
        WITH available_alcohol, r, COLLECT(i) AS recipe_ingredients
        WHERE SINGLE(x IN recipe_ingredients WHERE NOT x IN available_alcohol)
        RETURN r
        ORDER BY r.name`,
            { checkList: availableAlcohol }
        )

    let resultData = []
    result.records.forEach(record => {
        resultData.push(
            record.toObject().r.properties.name)
    })
    console.log(resultData)

    session.close()
    return resultData
}