const cheerio = require("cheerio")
const axios = require("axios")
const schedule = require("node-schedule")
const Coin = require('./coin.model')
const dayjs = require("dayjs")
const baseUrl = 'https://dropstab.com/'

let started
let parsedCoinsCounter = 1
let coinsList = []
let coinsLength = 0

const getUrl = num => num === 1 ? "https://dropstab.com/?s=100" : `https://dropstab.com/?p=${num}&s=100`
let getNormalizedData = (coinData) => {
    let res = {...coinData}
    let multipliers = {"M": 10 ** 6, "B": 10 ** 9, "T": 10 ** 12}

    const price = Number(coinData.price.replace(',', '').slice(1))
    res.price = Number.isNaN(price) ? 0 : price



    const ath_price = Number(coinData.ath_price.replace(',', '').slice(1))
    res.ath_price = Number.isNaN(ath_price) ? 0 : ath_price

    const atl_price = Number(coinData.atl_price.replace(',', '').slice(1))
    res.atl_price = Number.isNaN(atl_price) ? 0 : atl_price

    res.ath_time = dayjs(coinData.ath_time).format("DD.MM.YYYY")
    res.atl_time = dayjs(coinData.atl_time).format("DD.MM.YYYY")


    const market_cap =
        (Number(coinData.market_cap.replace(',', '').split(' ')[0].slice(1))
            *
            (multipliers[coinData.market_cap.split(' ')[1]] || 1)).toFixed(0)
    res.market_cap = Number.isNaN(market_cap) ? 0 : market_cap
    res.total_supply =
        coinData.total_supply === '--' ? 0 :
            (Number(coinData.total_supply.replace(',', '').split(' ')[0])
                *
                (multipliers[coinData.total_supply.split(' ')[1]] || 1)).toFixed(0)

    return res
}


const getNames = async () => {
    let res = []
    let names = await Coin.find({})
    names.forEach(elem => res.push(elem.name))
    coinsLength = res.length
    return res
}

const getCoinInfo = async ({pageDom, shortCoin, coin}) => {
    coinsList = coinsList.filter(coin => coin !== shortCoin)
    const coinData = {}
    const coinUrl = baseUrl + pageDom(coin).attr('href')
    const coinPage = await axios.get(coinUrl)
    const coinPageDom = cheerio.load(coinPage.data)
    coinData.name = shortCoin
    coinData.img = coinPageDom("img.block.h-8.w-8.rounded-full.bg-white.object-contain").attr('src')
    coinPageDom("div.min-w-0>div.mt-6>dl.font-medium>div").each((i, elem) => {
        if (i === 5) coinData.total_supply = coinPageDom(elem).find('div>dd>span').text().trim()
    })
    let stat = coinPageDom(".block.grid-cols-2.gap-x-4")
    stat.each((i, elem) => {
        coinPageDom(elem).find('div').each((i, statEl) => {
            let statElDom = coinPageDom(statEl)
            if (i === 0) {
                coinData.price = statElDom.find('dd>span').text().trim()
            }
            if (i === 2) {
                coinData.market_cap = statElDom.find('dd>span').text().trim()
            }
            if (i === 6) {
                coinData.ath_time = statElDom.find('dt>time').text()
                coinData.ath_price = statElDom.find('dd>div.mb-1.text-sm').text()
            }
            if (i === 9) {
                coinData.atl_time = statElDom.find('dt>time').text().trim()
                coinData.atl_price = statElDom.find('dd>div.mb-1.text-sm').text().trim()
            }
        })
    })
    let parsedPercentage = ((parsedCoinsCounter / coinsLength) * 100).toFixed(1)
    let spentTime = ((Date.now() - started) / 1000).toFixed(0)
    try {
        let findCoin = await Coin.findOne({name: coinData.name})
        if (Boolean(findCoin)) {
            await Coin.updateOne({name: coinData.name}, getNormalizedData(coinData))
        } else {
            await Coin.create(getNormalizedData(coinData))
        }
        let isNewCoin = Boolean(findCoin) ? 'updated' : 'new'
        console.log(`${parsedPercentage}%---${spentTime}s---------${isNewCoin}-------remains ${coinsList.length}-----${coinData.name}`)
        parsedCoinsCounter++
    } catch (e) {
        console.log("ERROR\n", e)
    }
}

const parsePage = async (pageNum) => {
    let res = []
    let pageUrl = getUrl(pageNum)
    const page = await axios.get(pageUrl)
    const pageDom = cheerio.load(page.data)
    let coins = pageDom(".styles_wrapper__1cauJ.tableCellSpacing")
    if(coins.length !== 200){
        let pageUrl = getUrl(pageNum)
        const page = await axios.get(pageUrl)
        const pageDom = cheerio.load(page.data)
        coins = pageDom(".styles_wrapper__1cauJ.tableCellSpacing")
        coins.each(async (i, coin) => {
            let shortCoin = pageDom(coin).find('.relative.min-w-0.overflow-hidden.pr-1.font-semibold.uppercase').text().trim()
            if (coinsList.includes(shortCoin)) res.push({pageDom, shortCoin, coin})
        })
    }
    coins.each(async (i, coin) => {
        let shortCoin = pageDom(coin).find('.relative.min-w-0.overflow-hidden.pr-1.font-semibold.uppercase').text().trim()
        if (coinsList.includes(shortCoin)) res.push({pageDom, shortCoin, coin})
    })

    console.log(coins.length)
    return res
}

const getPagesLength = async () => {
    let firstPage = await axios.get(getUrl(1))
    const firstPageDom = cheerio.load(firstPage.data)
    let res
    firstPageDom('div.relative.z-0.mt-4.flex.grow.flex-col > div.w-full.items-center.mt-6 > ul > li.mr-1').each((i, elem) => {
        if (i === 6)
            res = firstPageDom(elem).find('button>span').text().trim()
    })
    return res
}

async function parse() {
    try {
        coinsList = await getNames()
        const pagesNum = await getPagesLength()
        started = Date.now()
        console.log(`========= STARTED ${new Date().toTimeString()} =========`)
        for (let pageNum = 1; pageNum <= pagesNum; pageNum++) {
            if (coinsList.length !== 0) {
                const pageCoins = await parsePage(pageNum)
                console.log(`===================${pageNum}===============`)
                for (const coin of pageCoins) {
                    await getCoinInfo(coin)
                    coinsList = coinsList.filter(coin => coin !== coin.shortName)
                }

            }

        }
    } catch (e) {
        console.log(e)
    } finally {
        console.log(coinsList)
        coinsList = await getNames()

        parsedCoinsCounter = 1
    }
}
parse()
schedule.scheduleJob('*/10 * * * *', async ()=>{await parse()})