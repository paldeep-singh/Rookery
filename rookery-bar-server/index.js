require('dotenv').config()
const { check, validationResult, query, body, param } = require('express-validator');
const express = require('express')
const bodyParser = require('body-parser');
const app = express()
app.use(bodyParser.json())
const port = 8080
var neo4j = require('neo4j-driver')
const greeting = 'You must leave'


app.get('/', (req, res) => res.send(greeting))

app.get('/api/alcohol', async function (req, res) {
    res.set('Access-Control-Allow-Origin', '*');
    alcoholList = await getAlcohols(),
        res.json(alcoholList)
})
app.get('/api/cocktail',
    [query('filter').not().isEmpty(), query('alcohol').isArray()],
    async function (req, res) {
        res.set('Access-Control-Allow-Origin', '*');
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(500).json({ errors: errors.array() });
        }
        else if (req.query.filter === "none-missing") {

            cocktailList = await getCocktailsMissingNone(req.query.alcohol)
            res.json(cocktailList)

        }
        else if (req.query.filter === "one-missing") {
            cocktailList = await getCocktailsMissingOne(req.query.alcohol)
            res.json(cocktailList)
        }
        else {
            return res.status(500).json("filter value must be none-missing or one-missing")
        }
    })

app.get('/api/cocktail/:cocktailName', [param('cocktailName').not().isEmpty()],
    async function (req, res) {
        res.set('Access-Control-Allow-Origin', '*');
        selectedCocktail = await getSpecificCocktail(req.params.cocktailName),
            res.json(selectedCocktail)
    })

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
            record.toObject().n.properties)
    })
    session.close()
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