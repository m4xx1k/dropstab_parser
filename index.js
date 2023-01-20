const cheerio = require("cheerio")
const axios = require("axios")
const schedule = require("node-schedule")
const Coin = require('./coin.model')
const dayjs = require("dayjs")
const baseUrl = 'https://dropstab.com/'

let started
let parsedCoinsCounter = 1
let coinsList = `
BTC



ETH



USDT



USDC



BNB



BUSD



XRP



ADA



SOL



DOT



MATIC



DAI



SHIB



AVAX



TRX



WBTC



ETC



LEO



UNI



LTC



ATOM



NEAR



LINK



FTT



CRO



XMR



XLM



BCH



LUNC



ALGO



FLOW



ICP



VET



FIL



APE



EOS



HBAR



XTZ



MANA



SAND



QNT



AAVE



CHZ



EGLD



AXS



THETA



TUSD



BSV



USDP



OKB



KCS



ZEC



XEC



BTT



GRT



MIOTA



USDD



HT



MKR



SNX



KLAY



RVN



NEO



FTM



USDN



HNT



RUNE



CAKE



LDO



CRV



PAXG



LUNA



NEXO



ENJ



WAVES



DASH



STX



ZIL



GT



USTC



TWT



FEI



BTG



MINA



GMT



KSM



COMP



GNO



DCR



KAVA



XEM



CELO



HOT



1INCH



CEL



CVX



KNC



GLM



GALA



ANKR



AR



XDC



QTUM



TFUEL



KDA



ROSE



GUSD



ENS



FLUX



BAL



OP



IOTX



ONE



BTRST



OMG



BORA



ZRX



RSR



LPT



ICX



HIVE



AMP



IOST



JST



XYM



POLY



AUDIO



STORJ



SRM



ONT



GLMR



SC



WAXP



ZEN



IMX



XCH



UMA



SXP



CHSB



SCRT



WOO



CSPR



ABBC



SKL



PLA



SLP



DGB



DAO



NFT



SUSHI



CKB



ELON



CVC



EPS



KEEP



RNDR



CEEK



LSK



MED



UOS



EWT



FX



SPELL



INJ



BTCST



CELR



SYS



XNO



NU



ONG



SNT



ORBS



RLC



PEOPLE



ARDR



TRIBE



COTI



LOOM



POWR



XYO



CFX



OCEAN



WIN



PROM



NMR



FXS



DOGE



TEL



CHR



RLY`.split(`



`)
//let coinsList = []
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
    console.log(`parsed ${res.length} names from db`)
    return res
}

const getCoinInfo = async ({pageDom, shortCoin, coin, pageNum}) => {
     coinsList = coinsList.filter(coin => coin !== shortCoin)
    const coinData = {}

    const coinUrl = baseUrl + pageDom(coin).attr('href')
    const coinPage = await axios.get(coinUrl)
    const coinPageDom = cheerio.load(coinPage.data)

    coinData.name = shortCoin
    coinData.full_name = coinPageDom("h1.mr-1.min-w-0.truncate.text-xl.font-bold").text().trim()
    coinData.img = coinPageDom("img.block.h-8.w-8.rounded-full.bg-white.object-contain").attr('src')
    coinPageDom("div.min-w-0>div.mt-6>dl.font-medium>div").each((i, elem) => {
        if (i === 5) {
            coinData.total_supply = coinPageDom(elem).find('div>dd>span').text().trim()
        }
    })


    coinPageDom(".block.grid-cols-2.gap-x-4").each((_, elem) => {
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

        // let findCoin = await Coin.findOne({name: coinData.name})
        // console.log(getNormalizedData({...coinData, c1:1,c2:1,c3:1,c4:1,c5:1,c6:1,c7:1,c8:1,c9:1,c10:1}))
        // if (Boolean(findCoin)) {
        //     await Coin.updateOne({name: coinData.name}, getNormalizedData({...coinData, c1:1,c2:1,c3:1,c4:1,c5:1,c6:1,c7:1,c8:1,c9:1,c10:1}))
        // } else {
        // }
        await Coin.create(getNormalizedData({...coinData, c1:1,c2:1,c3:1,c4:1,c5:1,c6:1,c7:1,c8:1,c9:1,c10:1}))

        coinsList = coinsList.filter(coin => coin !== shortCoin)
        const currentTime = new Date().toTimeString()
        console.log(`[${currentTime.split(" ")[0]}]--${parsedPercentage}%---${spentTime}s-------remains ${coinsList.length}-----${coinData.name}`)
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
    let coinNames= ''
    coins.each(async (i, coin) => {
        let shortCoin = pageDom(coin).find('.relative.min-w-0.overflow-hidden.pr-1.font-semibold.uppercase').text().trim()
        if (coinsList.includes(shortCoin)) {
            coinNames+=shortCoin+', '
            res.push({pageDom, shortCoin, coin})
        }
    })
    console.log('parsed page #'+pageNum)
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
    console.log('parsed pages length')
    return res
}

async function parse() {
    try {
        //coinsList = await getNames()
        const pagesNum = await getPagesLength()
        started = Date.now()
        console.log(`========= STARTED ${new Date().toTimeString()} =========`)
        for (let pageNum = 1; pageNum <= pagesNum; pageNum++) {
            if (coinsList.length !== 0) {
                let remainsCoins = pageNum > 8 ? 'Remains=Coins=' + coinsList.join(", ") : '='
                console.log(`================PAGE=${pageNum}==============${remainsCoins}`)
                const pageCoins = await parsePage(pageNum)
                for (const coin of pageCoins) {
                    await getCoinInfo({...coin, pageNum})
                }

            }

        }
        console.log(coinsList)
    } catch (e) {
        console.log(e)
    } finally {
        if(!coinsList.length){
            console.log('not parsed coins:')
            console.log(coinsList)
        }


        parsedCoinsCounter = 1
    }
}

parse()
schedule.scheduleJob('*/15 * * * *', async ()=>{
    coinsList = await getNames()
    await parse()
    if(coinsList.length!==0) {
        console.log('again parse')
        await parse()
    }

})
