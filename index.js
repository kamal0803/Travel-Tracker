import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;

let visitedCountries = [];

const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

await db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {

    const result = await db.query("SELECT country_code from visited_countries");
    visitedCountries = result.rows.map(item => item.country_code);

    res.render("index.ejs", {
        countries: visitedCountries
    });
});

app.post("/add", async (req, res) => {

    const newCountry = req.body.country;

    const result = await db.query('SELECT country_code from countries where lower(country_name) = $1', [newCountry.trim().toLowerCase()]);
    const newCountryCode = result.rows.find(r => true)?.country_code;

    if(newCountryCode){

        try{
            await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [newCountryCode]);
            res.redirect("/");
        }catch(e){
            res.render("index.ejs", {
                countries: visitedCountries,
                error: "Country already exists, please try a new country."
            })
        }
        
    }else{
        res.render("index.ejs", {
            countries: visitedCountries,
            error: "Country doesn't exists, please try again."
        })
    }

});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
