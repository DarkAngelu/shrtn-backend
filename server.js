const { PrismaClient } = require("@prisma/client")
const express = require("express")
const cors = require("cors")
const axios = require("axios")

const app = express()
const port = process.env.PORT

const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())

app.get("/:shortUrl", async (req, res) => {
    const shortUrl = req.params.shortUrl

    console.log(shortUrl)
    const response = await prisma.url.findUnique({
        where: {
            shortUrl: shortUrl
        },
        select: {
            longUrl: true
        }
    })

    console.log(response)

    const longUrl = response.longUrl

    res.status(301).redirect(longUrl)
})

app.post("/", async (req, res) => {
    const { longUrl } = req.body
    console.log(longUrl)

    const check = await prisma.url.findUnique({
        where: {
            longUrl: longUrl
        }, 
        select: {
            shortUrl: true
        }
    })

    if (check) {
        console.log("url already here")
        console.log(check.shortUrl)
        return res.json({
            shortUrl: check.shortUrl
        })
    }

    // If it already doesn't exists

    function makeId(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        return result;
    }

    const len = 5
    let shortUrl = makeId(len)

    while (await prisma.url.findUnique({ where: { shortUrl: shortUrl }})) {
        shortUrl = makeId(len)
    }

    // only after the shortUrl is unique

    const response = await prisma.url.create({
        data: {
            longUrl: longUrl,
            shortUrl: shortUrl
        }
    })

    console.log(response)

    return res.json({
        shortUrl: response.shortUrl
    })
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})




// Function to reload the server in an interval
// so as to keep it alive and not to get killed
// on the free tier of render.com

const url = `https://shrtn-etj2.onrender.com/`; // Replace with your Render URL
const interval = 30000; // Interval in milliseconds (30 seconds)

function reloadWebsite() {
  axios.get(url)
    .then(response => {
      console.log(`Reloaded at ${new Date().toISOString()}: Status Code ${response.status}`);
    })
    .catch(error => {
      console.error(`Error reloading at ${new Date().toISOString()}:`, error.message);
    });
}


setInterval(reloadWebsite, interval);