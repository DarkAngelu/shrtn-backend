const { PrismaClient } = require("@prisma/client")
const express = require("express")
const cors = require("cors")

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